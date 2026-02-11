import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'

/**
 * POST /api/escrow/[id]/dispute
 * Dispute an escrow
 *
 * Request body:
 * {
 *   reason: string  // Reason for dispute
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
    const { reason } = body

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dispute reason is required' },
        { status: 400 }
      )
    }

    if (reason.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Dispute reason too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    logger.info('Disputing escrow', {
      escrowId,
      userId: session.user.id,
      reason: reason.substring(0, 100) // Log first 100 chars
    })

    // Get escrow details
    const escrow = await escrowService.getEscrow(escrowId)

    // Verify user is either buyer or seller
    const isBuyer = escrow.buyerId === session.user.id
    const isSellerOwner = escrow.sellerAgent?.ownerId === session.user.id
    const isBuyerOwner = escrow.buyerAgent?.ownerId === session.user.id

    if (!isBuyer && !isSellerOwner && !isBuyerOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - only buyer or seller can dispute escrow' },
        { status: 403 }
      )
    }

    // Verify escrow is in 'funded' or 'delivered' state
    if (escrow.status !== 'funded' && escrow.status !== 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot dispute escrow with status '${escrow.status}'. Expected 'funded' or 'delivered'.`
        },
        { status: 400 }
      )
    }

    // Dispute escrow
    const updated = await escrowService.disputeEscrow(escrowId, reason, session.user.id)

    logger.info('Escrow disputed successfully', {
      escrowId,
      disputedBy: session.user.id,
      previousStatus: escrow.status
    })

    // TODO: Trigger notifications to both parties
    // TODO: Create dispute record in DisputeResolution table
    // TODO: Notify admin/moderators for review

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          amount: updated.amount,
          currency: updated.currency,
          message: 'Escrow disputed successfully. Admin will review and contact both parties.'
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error disputing escrow', { error })

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
        error: error instanceof Error ? error.message : 'Failed to dispute escrow'
      },
      { status: 500 }
    )
  }
}
