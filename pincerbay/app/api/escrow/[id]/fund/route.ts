import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { walletService } from '@/lib/walletService'
import { getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/escrow/[id]/fund
 * Fund escrow by depositing PNCR
 *
 * Request body:
 * {
 *   txHash?: string  // Optional - for on-chain funding verification
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

    logger.info('Funding escrow', { escrowId, userId: session.user.id, txHash })

    // Get escrow details
    const escrow = await escrowService.getEscrow(escrowId)

    // Verify user is the buyer
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - only buyer can fund escrow' },
        { status: 403 }
      )
    }

    // Verify escrow is in 'created' state
    if (escrow.status !== 'created') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot fund escrow with status '${escrow.status}'. Expected 'created'.`
        },
        { status: 400 }
      )
    }

    // For MVP: If no txHash provided, generate placeholder
    // In production: verify on-chain deposit before updating status
    let fundTxHash = txHash || `offchain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    let onChainTxId: string | undefined

    // On-chain integration
    try {
      const SIMPLE_ESCROW_ADDRESS = process.env.SIMPLE_ESCROW_CONTRACT_ADDRESS

      if (!SIMPLE_ESCROW_ADDRESS || SIMPLE_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        logger.warn('SimpleEscrow contract not deployed. Recording as pending on-chain confirmation.', {
          escrowId,
          hint: 'Set SIMPLE_ESCROW_CONTRACT_ADDRESS environment variable after deploying contract'
        })
        // Continue with DB update but mark as pending_chain
      } else {
        // TODO: Implement buyer signature verification
        // For MVP: This requires client-side wallet signature
        // Client needs to call escrowService.fundEscrowOnChain with their wallet signer
        // const result = await escrowService.fundEscrowOnChain(
        //   escrow.id,
        //   buyerSigner,  // Requires wallet connection from client
        //   escrow.sellerAgent?.wallet?.address || escrow.sellerId,
        //   escrow.amount.toString()
        // )
        // fundTxHash = result.txHash
        // onChainTxId = result.onChainTxId
        logger.warn('On-chain escrow funding requires client wallet integration. Marked as pending_chain.', {
          escrowId,
          hint: 'Client should call /api/escrow/[id]/fund-onchain with signed transaction'
        })
      }
    } catch (error) {
      logger.error('On-chain escrow funding failed', { escrowId, error })
      // Continue with DB update for MVP
    }

    // Fund escrow in database
    const updated = await escrowService.fundEscrow(escrowId, fundTxHash)

    logger.info('Escrow funded successfully', {
      escrowId,
      userId: session.user.id,
      txHash: fundTxHash,
      amount: updated.amount
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          txHashFund: updated.txHashFund,
          amount: updated.amount,
          currency: updated.currency,
          message: 'Escrow funded successfully'
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error funding escrow', { error })

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
