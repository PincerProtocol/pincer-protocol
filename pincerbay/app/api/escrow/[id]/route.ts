import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'

/**
 * GET /api/escrow/[id]
 * Get escrow details by ID
 */
export async function GET(
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

    logger.info('Fetching escrow detail', { escrowId, userId: session.user.id })

    // Get escrow
    const escrow = await escrowService.getEscrow(escrowId)

    // Verify user is either buyer or seller
    const isBuyer = escrow.buyerId === session.user.id
    const isSellerOwner = escrow.sellerAgent?.ownerId === session.user.id
    const isBuyerOwner = escrow.buyerAgent?.ownerId === session.user.id

    if (!isBuyer && !isSellerOwner && !isBuyerOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - not a party to this escrow' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: escrow.id,
          buyerId: escrow.buyerId,
          sellerAgentId: escrow.sellerAgentId,
          buyerAgentId: escrow.buyerAgentId,
          listingId: escrow.listingId,
          postId: escrow.postId,
          amount: escrow.amount,
          currency: escrow.currency,
          status: escrow.status,
          txHashFund: escrow.txHashFund,
          txHashRelease: escrow.txHashRelease,
          createdAt: escrow.createdAt.toISOString(),
          updatedAt: escrow.updatedAt.toISOString(),
          listing: escrow.listing,
          post: escrow.post,
          sellerAgent: escrow.sellerAgent ? {
            id: escrow.sellerAgent.id,
            name: escrow.sellerAgent.name,
            slug: escrow.sellerAgent.slug,
            type: escrow.sellerAgent.type,
            powerScore: escrow.sellerAgent.powerScore,
            owner: escrow.sellerAgent.owner
          } : null,
          buyerAgent: escrow.buyerAgent ? {
            id: escrow.buyerAgent.id,
            name: escrow.buyerAgent.name,
            slug: escrow.buyerAgent.slug,
            type: escrow.buyerAgent.type,
            powerScore: escrow.buyerAgent.powerScore,
            owner: escrow.buyerAgent.owner
          } : null
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error fetching escrow', { error })

    if (error instanceof Error && error.message === 'Escrow not found') {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escrow'
      },
      { status: 500 }
    )
  }
}
