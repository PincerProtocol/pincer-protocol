import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { walletService } from '@/lib/walletService'
import { PrismaClient } from '@prisma/client'
import { ratelimit } from '@/lib/ratelimit'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// Request validation schema
// Note: Transfers require Web3 wallet signature - no privateKey accepted
const transferSchema = z.object({
  from: z.string().min(1, 'From address/walletId is required'),
  to: z.string().min(1, 'To address is required'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  memo: z.string().optional(),
  signature: z.string().optional(), // Web3 wallet signature (replaces privateKey)
  type: z.enum(['agent-to-human', 'human-to-agent', 'agent-to-agent']).optional()
})

/**
 * POST /api/wallet/transfer
 * Transfer between Agent ↔ Human wallets
 * 
 * Request:
 * {
 *   from: string (wallet ID for agent, address for human),
 *   to: string (address),
 *   amount: string,
 *   memo?: string,
 *   privateKey?: string (required for human-to-agent),
 *   type?: 'agent-to-human' | 'human-to-agent' | 'agent-to-agent'
 * }
 * 
 * Response:
 * {
 *   txHash: string,
 *   status: string,
 *   from: string,
 *   to: string,
 *   amount: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const identifier = forwarded?.split(',')[0] ?? 'anonymous'
    const { success } = await ratelimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = transferSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { from, to, amount, memo, signature, type } = validation.data

    // Security: Web3 signature required for production transfers
    // Demo mode: Returns mock response for testing UI
    const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.BASE_RPC_URL

    // Validate addresses
    if (!walletService.isValidAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      )
    }

    let txResult
    let transferType = type

    // Determine transfer type if not specified
    if (!transferType) {
      if (from.startsWith('0x') && from.length === 66) {
        transferType = 'agent-to-human'
      } else if (walletService.isValidAddress(from)) {
        transferType = 'human-to-agent'
      } else {
        return NextResponse.json(
          { error: 'Cannot determine transfer type' },
          { status: 400 }
        )
      }
    }

    // Demo mode: Return mock transaction
    if (isDemoMode) {
      const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`
      txResult = {
        txHash: mockTxHash,
        status: 'pending',
        demo: true
      }
    } else {
      // Production: Require Web3 signature
      const session = await getServerSession()
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required. Connect wallet first.' },
          { status: 401 }
        )
      }

      if (!signature) {
        return NextResponse.json(
          { error: 'Web3 signature required for transfers' },
          { status: 400 }
        )
      }

      // TODO: Verify signature and execute on-chain transfer
      // For now, return not implemented
      return NextResponse.json(
        { error: 'Production transfers not yet implemented. Enable DEMO_MODE for testing.' },
        { status: 501 }
      )
    }

    // Record transaction in database
    await prisma.transaction.create({
      data: {
        fromAgentId: transferType.startsWith('agent') ? from : null,
        toAgentId: transferType === 'human-to-agent' ? to : null,
        amount: parseFloat(amount),
        txType: 'transfer',
        txHash: txResult.txHash,
        status: txResult.status,
        description: memo || `${transferType} transfer`
      }
    })

    return NextResponse.json({
      success: true,
      txHash: txResult.txHash,
      status: txResult.status,
      from,
      to,
      amount,
      type: transferType
    })
  } catch (error: unknown) {
    logger.error('POST /api/wallet/transfer error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process transfer'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
