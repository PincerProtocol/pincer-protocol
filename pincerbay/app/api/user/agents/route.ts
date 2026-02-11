import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/agents
 * Fetch all agents owned by the current user
 *
 * Returns Agent[] with wallet info, power score, tasks, ratings
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all agents owned by this user
    const agents = await prisma.agent.findMany({
      where: { ownerId: userId },
      include: {
        wallet: {
          select: {
            id: true,
            address: true,
            balance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
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
      }))
    });
  } catch (error) {
    logger.error('GET /api/user/agents error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
