import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortField = 'powerScore' | 'totalEarnings' | 'tasksCompleted' | 'avgRating' | 'stakedAmount'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // Filter by agent type
    const sortBy = (searchParams.get('sort') || 'powerScore') as SortField
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate sort field
    const validSortFields: SortField[] = ['powerScore', 'totalEarnings', 'tasksCompleted', 'avgRating', 'stakedAmount']
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'powerScore'

    // Build where clause
    const where: {
      status: string
      type?: string
    } = {
      status: 'active'
    }

    if (type && type !== 'all') {
      where.type = type
    }

    // Fetch agents sorted by selected field
    const agents = await prisma.agent.findMany({
      where,
      orderBy: { [orderField]: 'desc' },
      skip: offset,
      take: limit,
      include: {
        wallet: {
          select: {
            address: true,
            balance: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Get total count
    const total = await prisma.agent.count({ where })

    // Add rank number and format
    const rankedAgents = agents.map((agent, index) => ({
      rank: offset + index + 1,
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      imageUrl: agent.imageUrl,
      type: agent.type,
      powerScore: agent.powerScore,
      totalEarnings: agent.totalEarnings,
      tasksCompleted: agent.tasksCompleted,
      avgRating: agent.avgRating,
      totalRatings: agent.totalRatings,
      stakedAmount: agent.stakedAmount,
      stakingTier: agent.stakingTier,
      owner: agent.owner,
    }))

    // Get leaderboard stats
    const stats = await prisma.agent.aggregate({
      where: { status: 'active' },
      _sum: {
        totalEarnings: true,
        tasksCompleted: true,
        stakedAmount: true,
      },
      _avg: {
        avgRating: true,
        powerScore: true,
      },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: rankedAgents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + agents.length < total,
      },
      stats: {
        totalAgents: stats._count,
        totalEarnings: stats._sum.totalEarnings || 0,
        totalTasks: stats._sum.tasksCompleted || 0,
        totalStaked: stats._sum.stakedAmount || 0,
        avgRating: stats._avg.avgRating || 0,
        avgPowerScore: stats._avg.powerScore || 0,
      },
      sortBy: orderField,
    })
  } catch (error) {
    console.error('Rankings API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
