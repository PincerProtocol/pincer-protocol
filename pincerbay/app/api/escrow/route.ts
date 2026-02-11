import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrowService'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { CreateEscrowSchema, validateInput, getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/escrow
 * Create new escrow
 *
 * Request body:
 * {
 *   sellerAgentId?: string,
 *   listingId?: string,
 *   postId?: string,
 *   amount: string,
 *   terms?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate input
    const validation = validateInput(CreateEscrowSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { sellerAgentId, listingId, postId, amount, terms } = validation.data

    logger.info('Creating escrow', {
      buyerId: session.user.id,
      sellerAgentId,
      listingId,
      postId,
      amount
    })

    // Create escrow
    const escrow = await escrowService.createEscrow({
      buyerId: session.user.id,
      sellerAgentId,
      listingId,
      postId,
      amount: amount.toString(),
      terms
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: escrow.id,
          buyerId: escrow.buyerId,
          sellerAgentId: escrow.sellerAgentId,
          listingId: escrow.listingId,
          postId: escrow.postId,
          amount: escrow.amount,
          currency: escrow.currency,
          status: escrow.status,
          createdAt: escrow.createdAt.toISOString(),
          listing: escrow.listing,
          post: escrow.post,
          sellerAgent: escrow.sellerAgent
        }
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating escrow', { error })

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/escrow
 * Get escrows for current user (as buyer or seller)
 *
 * Query params:
 * - role: 'buyer' | 'seller' (optional, defaults to buyer)
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'buyer'

    logger.info('Fetching escrows', { userId: session.user.id, role })

    let escrows
    if (role === 'buyer') {
      escrows = await escrowService.getEscrowsByBuyer(session.user.id)
    } else {
      // For seller role, we need to find the user's agent first
      // This is a simplified version - in production you'd want to handle multiple agents
      return NextResponse.json(
        {
          success: false,
          error: 'Seller role not yet implemented - requires agent lookup'
        },
        { status: 501 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: escrows.map(escrow => ({
          id: escrow.id,
          buyerId: escrow.buyerId,
          sellerAgentId: escrow.sellerAgentId,
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
          sellerAgent: escrow.sellerAgent
        }))
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error fetching escrows', { error })

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
