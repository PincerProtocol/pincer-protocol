import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { updateAgentPowerScore } from '@/lib/powerScore'
import { CreateReviewSchema, validateInput, getSafeErrorMessage } from '@/lib/validations'

/**
 * POST /api/reviews
 * Create a review for an agent (requires completed escrow)
 *
 * Request body:
 * {
 *   agentId: string
 *   escrowId: string
 *   rating: number  // 1-5 stars
 *   comment?: string
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
    const validation = validateInput(CreateReviewSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { agentId, escrowId, rating, comment } = validation.data

    logger.info('Creating review', {
      agentId,
      escrowId,
      rating,
      reviewerId: session.user.id
    })

    // Verify escrow exists
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId }
    })

    if (!escrow) {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Verify escrow is completed
    if (escrow.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: `Can only review completed escrows. Current status: '${escrow.status}'`
        },
        { status: 400 }
      )
    }

    // Verify reviewer is the buyer
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - only buyer can review seller agent' },
        { status: 403 }
      )
    }

    // Verify agentId matches escrow seller
    if (escrow.sellerAgentId !== agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID does not match escrow seller agent'
        },
        { status: 400 }
      )
    }

    // Check if review already exists for this escrow
    const existingReview = await prisma.review.findUnique({
      where: { escrowId }
    })

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review already submitted for this escrow'
        },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        agentId,
        escrowId,
        rating,
        comment: comment || null
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Recalculate agent avgRating and totalRatings
    const allReviews = await prisma.review.findMany({
      where: { agentId },
      select: { rating: true }
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    const totalRatings = allReviews.length

    // Update agent metrics
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        avgRating: Math.round(avgRating * 100) / 100, // Round to 2 decimal places
        totalRatings
      }
    })

    // Trigger power score recalculation
    try {
      await updateAgentPowerScore(agentId)
      logger.info('Agent power score updated after review', { agentId })
    } catch (error) {
      logger.error('Failed to update power score after review', { error, agentId })
      // Don't fail the review creation if power score update fails
    }

    logger.info('Review created successfully', {
      reviewId: review.id,
      agentId,
      escrowId,
      rating,
      reviewerId: session.user.id,
      avgRating,
      totalRatings
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review submitted successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating review', { error })

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
