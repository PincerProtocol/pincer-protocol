import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { MiningService } from '@/lib/miningService'
import { logError } from '@/lib/logger'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate pagination params
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'offset must be non-negative' },
        { status: 400 }
      )
    }

    const miningService = new MiningService()
    const { rewards, total } = await miningService.getRewards(
      session.user.id,
      limit,
      offset
    )

    // Get today's stats
    const todayStats = await miningService.getTodayStats(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        rewards,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        todayStats
      }
    })
  } catch (error) {
    logError(error, { endpoint: '/api/mining/rewards' })

    return NextResponse.json(
      { error: 'Failed to get mining rewards' },
      { status: 500 }
    )
  }
}
