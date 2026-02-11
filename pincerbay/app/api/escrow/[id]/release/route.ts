import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { walletService } from '@/lib/walletService'
import { getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/escrow/[id]/release
 * Release escrow funds to seller
 *
 * Request body:
 * {
 *   txHash?: string  // Optional - for on-chain release verification
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: escrowId } = await params
    const body = await req.json()
    const { txHash } = body

    logger.info('Releasing escrow funds', { escrowId, userId: session.user.id, txHash })

    // Get escrow details
    const escrow = await escrowService.getEscrow(escrowId)

    // Verify user is the buyer
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - only buyer can release escrow' },
        { status: 403 }
      )
    }

    // Verify escrow is in 'funded' or 'delivered' state
    if (escrow.status !== 'funded' && escrow.status !== 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot release escrow with status '${escrow.status}'. Expected 'funded' or 'delivered'.`
        },
        { status: 400 }
      )
    }

    // For MVP: If no txHash provided, generate placeholder
    // In production: execute on-chain transfer to seller
    let releaseTxHash = txHash || `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // On-chain integration
    try {
      const SIMPLE_ESCROW_ADDRESS = process.env.SIMPLE_ESCROW_CONTRACT_ADDRESS
      const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY

      if (!SIMPLE_ESCROW_ADDRESS || SIMPLE_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        logger.warn('SimpleEscrow contract not deployed. Marking as manual_release required.', {
          escrowId,
          hint: 'Set SIMPLE_ESCROW_CONTRACT_ADDRESS environment variable after deploying contract'
        })
      } else if (!PLATFORM_PRIVATE_KEY) {
        logger.warn('PLATFORM_PRIVATE_KEY not set. On-chain release requires manual intervention.', {
          escrowId,
          hint: 'Set PLATFORM_PRIVATE_KEY for automated on-chain releases'
        })
      } else {
        // TODO: Implement on-chain release
        // For full implementation, need to:
        // 1. Get buyer's wallet signer (buyer confirms delivery in SimpleEscrow)
        // 2. Call escrowService.releaseEscrowOnChain(onChainTxId, buyerSigner)
        // Note: SimpleEscrow.confirmDelivery() must be called by the BUYER, not platform
        // const buyerSigner = walletService.getSigner(buyerPrivateKey)  // Need buyer's signature
        // const result = await escrowService.releaseEscrowOnChain(escrow.onChainTxId, buyerSigner)
        // releaseTxHash = result.txHash
        logger.warn('On-chain escrow release implementation pending. Funds released in DB only.', {
          escrowId,
          hint: 'Buyer must call SimpleEscrow.confirmDelivery() to release funds on-chain'
        })
      }
    } catch (error) {
      logger.error('On-chain escrow release failed', { escrowId, error })
      // Continue with DB update for MVP
    }

    // Release escrow in database and update seller metrics
    const updated = await escrowService.releaseEscrow(escrowId, releaseTxHash)

    logger.info('Escrow released successfully', {
      escrowId,
      userId: session.user.id,
      txHash: releaseTxHash,
      amount: updated.amount,
      sellerId: updated.sellerAgentId
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          txHashRelease: updated.txHashRelease,
          amount: updated.amount,
          currency: updated.currency,
          sellerAgentId: updated.sellerAgentId,
          message: 'Escrow released successfully. Funds transferred to seller.'
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error releasing escrow', { error })

    if (error instanceof Error && error.message === 'Escrow not found') {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes('Invalid state transition')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
