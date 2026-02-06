import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { walletService } from '@/lib/walletService'
import { PrismaClient } from '@prisma/client'
import { ratelimit } from '@/lib/ratelimit'
import { z } from 'zod'

const prisma = new PrismaClient()

// Request validation schema
const transferSchema = z.object({
  from: z.string().min(1, 'From address/walletId is required'),
  to: z.string().min(1, 'To address is required'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  memo: z.string().optional(),
  privateKey: z.string().optional(), // For human wallet transfers
  type: z.enum(['agent-to-human', 'human-to-agent', 'agent-to-agent']).optional()
})

/**
 * POST /api/wallet/transfer
 * Agent ↔ Human 지갑 간 전송
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
    const identifier = request.ip ?? 'anonymous'
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
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { from, to, amount, memo, privateKey, type } = validation.data

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
      // Check if 'from' is a wallet ID (bytes32) or address
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

    // Execute transfer based on type
    switch (transferType) {
      case 'agent-to-human':
        // Agent Wallet → Human Wallet
        // This requires the session user to be the owner or operator
        const session = await getServerSession()
        if (!session?.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // For now, we'll require a privateKey parameter
        // In production, use session-based signing
        if (!privateKey) {
          return NextResponse.json(
            { error: 'Private key required for agent transfer' },
            { status: 400 }
          )
        }

        const agentSigner = walletService.getSigner(privateKey)
        txResult = await walletService.agentTransfer(
          agentSigner,
          from, // walletId
          to,
          amount,
          memo || 'Agent to Human transfer'
        )
        break

      case 'human-to-agent':
        // Human Wallet → Agent Wallet (deposit)
        if (!privateKey) {
          return NextResponse.json(
            { error: 'Private key required for human wallet transfer' },
            { status: 400 }
          )
        }

        const humanSigner = walletService.getSigner(privateKey)
        
        // Get wallet ID from 'to' parameter (should be agentId format)
        // First, check if 'to' is a walletId or we need to look it up
        let targetWalletId = to
        
        if (!to.startsWith('0x') || to.length !== 66) {
          // 'to' is likely an agentId, get wallet ID
          const signerAddress = await humanSigner.getAddress()
          targetWalletId = await walletService.getAgentWalletId(signerAddress, to)
        }

        txResult = await walletService.depositToAgentWallet(
          humanSigner,
          targetWalletId,
          amount
        )
        break

      case 'agent-to-agent':
        // Agent Wallet → Agent Wallet (via transfer)
        if (!privateKey) {
          return NextResponse.json(
            { error: 'Private key required' },
            { status: 400 }
          )
        }

        const a2aSigner = walletService.getSigner(privateKey)
        txResult = await walletService.agentTransfer(
          a2aSigner,
          from,
          to,
          amount,
          memo || 'Agent to Agent transfer'
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid transfer type' },
          { status: 400 }
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
    console.error('POST /api/wallet/transfer error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process transfer'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
