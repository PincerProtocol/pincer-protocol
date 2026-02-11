import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // Filter by agent type
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Fetch agents sorted by powerScore
    const agents = await prisma.agent.findMany({
      where,
      orderBy: { powerScore: 'desc' },
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

    // Add rank number
    const rankedAgents = agents.map((agent, index) => ({
      ...agent,
      rank: offset + index + 1
    }))

    return NextResponse.json({
      success: true,
      data: rankedAgents,
      total: rankedAgents.length
    })
  } catch (error) {
    console.error('Rankings API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
