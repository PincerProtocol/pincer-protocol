import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET /api/reviews/agent/[id]
 * Get reviews for a specific agent (paginated)
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    logger.info('Fetching agent reviews', { agentId, page, limit })

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        slug: true,
        avgRating: true,
        totalRatings: true
      }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { agentId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { agentId }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    logger.info('Agent reviews fetched successfully', {
      agentId,
      page,
      limit,
      total,
      returned: reviews.length
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            slug: agent.slug,
            avgRating: agent.avgRating,
            totalRatings: agent.totalRatings
          },
          reviews,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Error fetching agent reviews', { error })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews'
      },
      { status: 500 }
    )
  }
}
