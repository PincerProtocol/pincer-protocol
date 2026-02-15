import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/escrow/[id]/release
 * Release escrow funds to seller
 * 
 * Flow:
 * 1. Verify buyer is the caller
 * 2. Calculate platform fee (10%)
 * 3. Credit seller's agent wallet (90%)
 * 4. Update escrow status to 'completed'
 * 5. Update agent metrics (earnings, tasks)
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

    logger.info('Releasing escrow funds', { escrowId, userId: session.user.id })

    // Get escrow details
    const escrow = await escrowService.getEscrow(escrowId)

    // Verify user is the buyer
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - only buyer can release escrow' },
        { status: 403 }
      )
    }

    // Verify escrow is in correct state
    if (escrow.status !== 'funded' && escrow.status !== 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot release escrow with status '${escrow.status}'. Expected 'funded' or 'delivered'.`
        },
        { status: 400 }
      )
    }

    // Get seller's agent wallet
    if (!escrow.sellerAgentId) {
      return NextResponse.json(
        { success: false, error: 'No seller agent found for this escrow' },
        { status: 400 }
      )
    }

    const sellerAgentWallet = await prisma.agentWallet.findUnique({
      where: { agentId: escrow.sellerAgentId }
    })

    if (!sellerAgentWallet) {
      return NextResponse.json(
        { success: false, error: 'Seller agent wallet not found' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const platformFee = escrow.amount * 0.10 // 10% platform fee
    const sellerAmount = escrow.amount - platformFee

    // Generate transaction hash
    const txHash = `escrow_release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Execute release in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Credit seller's agent wallet
      await tx.agentWallet.update({
        where: { id: sellerAgentWallet.id },
        data: { balance: { increment: sellerAmount } }
      })

      // 2. Record transaction
      await tx.walletTransaction.create({
        data: {
          fromWalletId: null, // From escrow
          toAgentWalletId: sellerAgentWallet.id,
          amount: sellerAmount,
          txType: 'escrow',
          txHash,
          status: 'confirmed',
          description: `Escrow release: ${escrowId.slice(0, 8)}... (after 10% fee)`
        }
      })

      // 3. Record platform fee
      await tx.walletTransaction.create({
        data: {
          fromWalletId: null,
          toWalletId: null, // Platform treasury
          amount: platformFee,
          txType: 'fee',
          txHash: `${txHash}_fee`,
          status: 'confirmed',
          description: `Platform fee from escrow: ${escrowId.slice(0, 8)}...`
        }
      })

      // 4. Update escrow status
      const updated = await tx.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'completed',
          txHashRelease: txHash,
          updatedAt: new Date()
        }
      })

      // 5. Update agent metrics and check for milestone bonuses
      const updatedAgent = await tx.agent.update({
        where: { id: escrow.sellerAgentId! },
        data: {
          tasksCompleted: { increment: 1 },
          totalEarnings: { increment: sellerAmount }
        }
      })

      // Maker Rebates: Milestone bonuses for sellers
      const newTaskCount = updatedAgent.tasksCompleted
      let milestoneBonus = 0
      let milestoneMessage = ''

      if (newTaskCount === 1) {
        milestoneBonus = 500
        milestoneMessage = '🎉 First sale bonus!'
      } else if (newTaskCount === 10) {
        milestoneBonus = 2000
        milestoneMessage = '🏆 10 sales milestone!'
      } else if (newTaskCount === 50) {
        milestoneBonus = 10000
        milestoneMessage = '🌟 50 sales milestone!'
      } else if (newTaskCount === 100) {
        milestoneBonus = 25000
        milestoneMessage = '💎 100 sales milestone!'
      }

      // Give milestone bonus if applicable
      if (milestoneBonus > 0) {
        await tx.agentWallet.update({
          where: { id: sellerAgentWallet.id },
          data: { balance: { increment: milestoneBonus } }
        })

        await tx.walletTransaction.create({
          data: {
            toAgentWalletId: sellerAgentWallet.id,
            amount: milestoneBonus,
            txType: 'maker_rebate',
            status: 'confirmed',
            description: milestoneMessage
          }
        })
      }

      // 6. Update platform stats
      await tx.platformStats.upsert({
        where: { id: 'global' },
        create: {
          id: 'global',
          totalTxVolume: escrow.amount
        },
        update: {
          totalTxVolume: { increment: escrow.amount }
        }
      })

      return updated
    })

    logger.info('Escrow released successfully', {
      escrowId,
      userId: session.user.id,
      txHash,
      totalAmount: escrow.amount,
      sellerAmount,
      platformFee,
      sellerAgentId: escrow.sellerAgentId
    })

    // Get updated agent info for milestone
    const sellerAgent = await prisma.agent.findUnique({
      where: { id: escrow.sellerAgentId! }
    })
    const newTaskCount = sellerAgent?.tasksCompleted || 0
    let milestoneBonus = 0
    if (newTaskCount === 1) milestoneBonus = 500
    else if (newTaskCount === 10) milestoneBonus = 2000
    else if (newTaskCount === 50) milestoneBonus = 10000
    else if (newTaskCount === 100) milestoneBonus = 25000

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.id,
          status: result.status,
          txHashRelease: result.txHashRelease,
          totalAmount: escrow.amount,
          sellerReceived: sellerAmount,
          platformFee,
          milestoneBonus: milestoneBonus > 0 ? {
            amount: milestoneBonus,
            taskCount: newTaskCount,
          } : null,
          message: milestoneBonus > 0 
            ? `Escrow released! Seller received ${sellerAmount} PNCR + ${milestoneBonus} PNCR milestone bonus!`
            : 'Escrow released successfully. Funds transferred to seller.'
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

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
