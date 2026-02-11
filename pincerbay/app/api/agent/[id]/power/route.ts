import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePowerScore, getPowerScoreBreakdown } from '@/lib/powerScore';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Fetch agent from database
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        wallet: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Calculate power score and get breakdown
    const powerScore = calculatePowerScore(agent);
    const breakdown = getPowerScoreBreakdown(agent);

    return NextResponse.json({
      success: true,
      data: {
        powerScore,
        tasksCompleted: agent.tasksCompleted,
        avgRating: agent.avgRating,
        totalRatings: agent.totalRatings,
        totalEarnings: agent.totalEarnings,
        stakedAmount: agent.stakedAmount,
        stakingTier: agent.stakingTier,
        breakdown: breakdown.breakdown
      }
    });

  } catch (error) {
    logger.error('Error in /api/agent/[id]/power:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Fetch agent from database
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Calculate and save new power score
    const powerScore = calculatePowerScore(agent);

    await prisma.agent.update({
      where: { id: agentId },
      data: { powerScore }
    });

    const breakdown = getPowerScoreBreakdown(agent);

    return NextResponse.json({
      success: true,
      message: 'Power score updated',
      data: {
        powerScore,
        tasksCompleted: agent.tasksCompleted,
        avgRating: agent.avgRating,
        totalEarnings: agent.totalEarnings,
        stakedAmount: agent.stakedAmount,
        breakdown: breakdown.breakdown
      }
    });

  } catch (error) {
    logger.error('Error updating agent power:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
