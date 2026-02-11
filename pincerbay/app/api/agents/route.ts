import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/agents
 * Get paginated list of agents
 */

interface AgentsListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    status: string;
    powerScore: number;
    tasksCompleted: number;
    totalEarnings: number;
    avgRating: number;
    totalRatings: number;
    createdAt: string;
    wallet: {
      id: string;
      address: string | null;
      balance: number;
    } | null;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100'
        } as AgentsListResponse,
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    // Get total count for pagination
    const total = await prisma.agent.count({ where });

    // Fetch agents with wallet info
    const agents = await prisma.agent.findMany({
      skip,
      take: limit,
      where,
      orderBy: { powerScore: 'desc' },
      include: {
        wallet: {
          select: {
            id: true,
            address: true,
            balance: true
          }
        }
      }
    });

    const pages = Math.ceil(total / limit);

    logger.info(`Agents list fetched: page ${page}, ${agents.length} results`);

    return NextResponse.json(
      {
        success: true,
        data: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          description: agent.description,
          type: agent.type,
          status: agent.status,
          powerScore: agent.powerScore,
          tasksCompleted: agent.tasksCompleted,
          totalEarnings: agent.totalEarnings,
          avgRating: agent.avgRating,
          totalRatings: agent.totalRatings,
          createdAt: agent.createdAt.toISOString(),
          wallet: agent.wallet
        })),
        pagination: {
          page,
          limit,
          total,
          pages
        }
      } as AgentsListResponse,
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error in GET /api/agents:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as AgentsListResponse,
      { status: 500 }
    );
  }
}
