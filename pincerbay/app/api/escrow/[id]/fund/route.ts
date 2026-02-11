import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/escrow/[id]/fund
 * Fund escrow by depositing PNCR from internal wallet
 * 
 * Flow:
 * 1. Verify buyer is the caller
 * 2. Check buyer has sufficient PNCR balance
 * 3. Deduct from buyer's wallet (held in escrow)
 * 4. Update escrow status to 'funded'
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

    logger.info('Funding escrow', { escrowId, userId: session.user.id })

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

    // Get buyer's wallet
    const buyerWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found. Please sign in again.' },
        { status: 400 }
      )
    }

    // Check balance
    if (buyerWallet.balance < escrow.amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient PNCR balance. Required: ${escrow.amount}, Available: ${buyerWallet.balance.toFixed(2)}`
        },
        { status: 402 }
      )
    }

    // Generate transaction hash
    const txHash = `escrow_fund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Execute funding in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct from buyer's wallet
      await tx.userWallet.update({
        where: { id: buyerWallet.id },
        data: { balance: { decrement: escrow.amount } }
      })

      // 2. Record transaction
      await tx.walletTransaction.create({
        data: {
          fromWalletId: buyerWallet.id,
          toWalletId: null, // Held in escrow
          amount: escrow.amount,
          txType: 'escrow',
          txHash,
          status: 'confirmed',
          description: `Escrow funding: ${escrowId.slice(0, 8)}...`
        }
      })

      // 3. Update escrow status
      const updated = await tx.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'funded',
          txHashFund: txHash,
          updatedAt: new Date()
        }
      })

      return updated
    })

    logger.info('Escrow funded successfully', {
      escrowId,
      userId: session.user.id,
      txHash,
      amount: escrow.amount
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.id,
          status: result.status,
          txHashFund: result.txHashFund,
          amount: escrow.amount,
          currency: escrow.currency,
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

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
