import { prisma } from './prisma'
import { logger } from './logger'

const BASE_RATE = 0.1 // PNCR per minute
const DAILY_CAP = 100 // Max PNCR per day per user

export class MiningService {
  /**
   * Start a new mining session for the user
   * @throws Error if active session already exists
   */
  async startSession(userId: string) {
    // Check no active session exists
    const activeSession = await prisma.miningSession.findFirst({
      where: {
        userId,
        status: 'active'
      }
    })

    if (activeSession) {
      throw new Error('Active mining session already exists')
    }

    logger.info(`Starting mining session for user ${userId}`)

    return prisma.miningSession.create({
      data: {
        userId,
        status: 'active',
        startedAt: new Date()
      }
    })
  }

  /**
   * Stop mining session and calculate rewards
   * @returns Session, reward record, and earned PNCR amount
   */
  async stopSession(sessionId: string) {
    const session = await prisma.miningSession.findUnique({
      where: { id: sessionId }
    })

    if (!session || session.status !== 'active') {
      throw new Error('No active session found')
    }

    // Calculate duration in minutes
    const durationMs = Date.now() - session.startedAt.getTime()
    const durationMinutes = durationMs / (1000 * 60)

    logger.info(`Stopping mining session ${sessionId}, duration: ${durationMinutes.toFixed(2)} minutes`)

    // Get user's agents for mining boost
    const agents = await prisma.agent.findMany({
      where: { ownerId: session.userId },
      select: { miningBoost: true }
    })
    const maxBoost = Math.max(...agents.map(a => a.miningBoost || 1.0), 1.0)

    // Check if user was active recently (posted/commented in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const [recentPosts, recentComments] = await Promise.all([
      prisma.feedPost.count({
        where: {
          authorId: session.userId,
          createdAt: { gte: oneHourAgo }
        }
      }),
      prisma.feedComment.count({
        where: {
          authorId: session.userId,
          createdAt: { gte: oneHourAgo }
        }
      })
    ])
    const hasRecentActivity = (recentPosts + recentComments) > 0
    const activityBonus = hasRecentActivity ? 1.5 : 1.0

    // Calculate base rewards
    let earnedPNCR = durationMinutes * BASE_RATE * maxBoost * activityBonus

    logger.info(`Raw calculation: ${durationMinutes.toFixed(2)} min * ${BASE_RATE} * ${maxBoost} boost * ${activityBonus} activity = ${earnedPNCR.toFixed(2)} PNCR`)

    // Check daily cap
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayRewards = await prisma.miningReward.aggregate({
      where: {
        userId: session.userId,
        createdAt: { gte: todayStart },
        status: 'credited'
      },
      _sum: { amount: true }
    })
    const todayTotal = parseFloat(todayRewards._sum.amount?.toString() || '0')

    if (todayTotal + earnedPNCR > DAILY_CAP) {
      const beforeCap = earnedPNCR
      earnedPNCR = Math.max(0, DAILY_CAP - todayTotal)
      logger.warn(`Daily cap applied: ${beforeCap.toFixed(2)} -> ${earnedPNCR.toFixed(2)} PNCR (today total: ${todayTotal.toFixed(2)})`)
    }

    // Create reward record
    const reward = await prisma.miningReward.create({
      data: {
        userId: session.userId,
        sessionId: session.id,
        amount: earnedPNCR,
        rewardType: 'mining',
        description: `Mining session ${durationMinutes.toFixed(1)}min @ ${maxBoost}x boost${hasRecentActivity ? ' + activity bonus' : ''}`,
        status: 'credited'
      }
    })

    // Get user's wallet
    const wallet = await prisma.userWallet.findUnique({
      where: { userId: session.userId }
    })

    if (!wallet) {
      throw new Error('User wallet not found')
    }

    // Create wallet transaction
    await prisma.walletTransaction.create({
      data: {
        toWalletId: wallet.id,
        amount: earnedPNCR,
        txType: 'mining',
        status: 'confirmed',
        description: `Mining reward from session ${sessionId.slice(0, 8)}`
      }
    })

    // Update wallet balance
    await prisma.userWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: earnedPNCR }
      }
    })

    // Update session
    await prisma.miningSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date(),
        earnedPNCR: earnedPNCR
      }
    })

    // Update platform stats
    const platformStats = await prisma.platformStats.findUnique({
      where: { id: 'global' }
    })

    if (platformStats) {
      await prisma.platformStats.update({
        where: { id: 'global' },
        data: {
          totalMined: { increment: earnedPNCR }
        }
      })
    } else {
      // Create platform stats if doesn't exist
      await prisma.platformStats.create({
        data: {
          id: 'global',
          totalMined: earnedPNCR
        }
      })
    }

    logger.info(`Mining session completed: ${earnedPNCR.toFixed(2)} PNCR credited to ${session.userId}`)

    return { session, reward, earnedPNCR }
  }

  /**
   * Get active mining session for user
   */
  async getActiveSession(userId: string) {
    return prisma.miningSession.findFirst({
      where: {
        userId,
        status: 'active'
      }
    })
  }

  /**
   * Get mining rewards history for user
   */
  async getRewards(userId: string, limit = 20, offset = 0) {
    const [rewards, total] = await Promise.all([
      prisma.miningReward.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          session: {
            select: {
              startedAt: true,
              endedAt: true,
              status: true
            }
          }
        }
      }),
      prisma.miningReward.count({
        where: { userId }
      })
    ])

    return { rewards, total }
  }

  /**
   * Get today's mining stats for user
   */
  async getTodayStats(userId: string) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayRewards = await prisma.miningReward.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart },
        status: 'credited'
      },
      _sum: { amount: true },
      _count: true
    })

    const earned = parseFloat(todayRewards._sum.amount?.toString() || '0')
    const remaining = Math.max(0, DAILY_CAP - earned)

    return {
      earned,
      remaining,
      cap: DAILY_CAP,
      sessionsCount: todayRewards._count
    }
  }
}
