import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { MiningService } from '@/lib/miningService'
import { logError } from '@/lib/logger'

const BASE_RATE = 0.1 // PNCR per minute
const DAILY_CAP = 100 // Max PNCR per day per user

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const miningService = new MiningService()
    const activeSession = await miningService.getActiveSession(session.user.id)

    if (!activeSession) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    // Calculate current duration and estimated earnings
    const durationMs = Date.now() - activeSession.startedAt.getTime()
    const durationMinutes = durationMs / (1000 * 60)

    // Get user's agents for mining boost
    const { prisma } = await import('@/lib/prisma')
    const agents = await prisma.agent.findMany({
      where: { ownerId: session.user.id },
      select: { miningBoost: true }
    })
    const maxBoost = Math.max(...agents.map(a => a.miningBoost || 1.0), 1.0)

    // Check recent activity
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const [recentPosts, recentComments] = await Promise.all([
      prisma.feedPost.count({
        where: {
          authorId: session.user.id,
          createdAt: { gte: oneHourAgo }
        }
      }),
      prisma.feedComment.count({
        where: {
          authorId: session.user.id,
          createdAt: { gte: oneHourAgo }
        }
      })
    ])
    const hasRecentActivity = (recentPosts + recentComments) > 0
    const activityBonus = hasRecentActivity ? 1.5 : 1.0

    // Calculate estimated earnings
    let estimatedEarnings = durationMinutes * BASE_RATE * maxBoost * activityBonus

    // Get today's stats to check cap
    const todayStats = await miningService.getTodayStats(session.user.id)

    // Apply cap if needed
    if (todayStats.earned + estimatedEarnings > DAILY_CAP) {
      estimatedEarnings = Math.max(0, DAILY_CAP - todayStats.earned)
    }

    return NextResponse.json({
      success: true,
      data: {
        session: activeSession,
        durationMinutes: parseFloat(durationMinutes.toFixed(2)),
        estimatedEarnings: parseFloat(estimatedEarnings.toFixed(2)),
        miningBoost: maxBoost,
        activityBonus: hasRecentActivity,
        todayStats
      }
    })
  } catch (error) {
    logError(error, { endpoint: '/api/mining/status' })

    return NextResponse.json(
      { error: 'Failed to get mining status' },
      { status: 500 }
    )
  }
}
