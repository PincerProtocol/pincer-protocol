import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { walletService } from '@/lib/walletService'
import { verifyTransferSignature } from '@/lib/signatureVerify'
import { prisma } from '@/lib/prisma'
import { ratelimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'
import { TransferSchema, getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/wallet/transfer
 * Transfer PNCR with wallet signature verification
 *
 * Request:
 * {
 *   from: string (address or walletId),
 *   to: string (address),
 *   amount: string,
 *   signature: string (wallet signature),
 *   type?: 'agent-to-human' | 'human-to-agent' | 'agent-to-agent'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     txHash: string,
 *     status: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const identifier = forwarded?.split(',')[0] ?? session.user.id
    const { success: rateLimitSuccess } = await ratelimit.limit(identifier)

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = TransferSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { from, to, amount, signature, type } = validation.data

    // Validate addresses
    if (!walletService.isValidAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      )
    }

    // Verify signature matches `from` address
    const message = {
      from,
      to,
      amount,
      timestamp: Date.now()
    }

    const isValidSignature = verifyTransferSignature(message, signature, from)
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Determine transfer type if not specified
    let transferType = type
    if (!transferType) {
      // If from is a walletId (66 chars with 0x prefix), it's agent-to-*
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

    // Get platform signer for agent wallet operations
    const platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY
    if (!platformPrivateKey) {
      logger.error('PLATFORM_PRIVATE_KEY not configured')
      return NextResponse.json(
        { error: 'Platform wallet not configured' },
        { status: 500 }
      )
    }

    let txHash: string

    try {
      if (transferType === 'agent-to-agent' || transferType === 'agent-to-human') {
        // Platform signer calls agentTransfer on behalf of agent wallet
        const signer = walletService.getSigner(platformPrivateKey)
        const result = await walletService.agentTransfer(
          signer,
          from, // walletId
          to,   // recipient address
          amount
        )
        txHash = result.txHash
      } else {
        // human-to-agent: User transfers directly (not implemented in MVP)
        // In production, this would require user to sign transaction via wallet UI
        return NextResponse.json(
          { error: 'User-to-agent transfers must be done via wallet UI' },
          { status: 400 }
        )
      }

      // Create WalletTransaction record
      await prisma.walletTransaction.create({
        data: {
          fromAgentWalletId: transferType.startsWith('agent') ? from : null,
          toAgentWalletId: transferType === 'agent-to-agent' ? to : null,
          amount: parseFloat(amount),
          txType: 'transfer',
          txHash: txHash,
          status: 'completed',
          description: `${transferType} transfer`
        }
      })

      // Update cached balances in DB
      // Note: from is a walletId (66 chars), not an address
      // We'll update balances by querying the agent wallet by address
      const toBalance = await walletService.getPNCRBalance(to)

      // Update recipient wallet if it's an agent wallet
      if (transferType === 'agent-to-agent' || transferType === 'agent-to-human') {
        // Only update if recipient is an agent wallet (has address in AgentWallet table)
        if (transferType === 'agent-to-agent') {
          await prisma.agentWallet.updateMany({
            where: { address: to },
            data: { balance: parseFloat(toBalance) }
          })
        }
      }

      logger.info('Transfer completed', { txHash, from, to, amount, type: transferType })

      return NextResponse.json({
        success: true,
        data: {
          txHash,
          status: 'completed'
        }
      })
    } catch (error: unknown) {
      logger.error('Transfer execution failed:', error)
      return NextResponse.json(
        { error: getSafeErrorMessage(error) },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    logger.error('POST /api/wallet/transfer error:', error)
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    )
  }
}
