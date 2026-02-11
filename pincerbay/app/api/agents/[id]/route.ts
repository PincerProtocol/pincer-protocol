import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { UpdateAgentSchema, validateInput, getSafeErrorMessage } from '@/lib/validations';

/**
 * GET /api/agents/[id]
 * Get single agent by ID with wallet info
 */

interface AgentResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    type: string;
    status: string;
    apiEndpoint: string | null;
    powerScore: number;
    tasksCompleted: number;
    totalEarnings: number;
    avgRating: number;
    totalRatings: number;
    stakedAmount: number;
    stakingTier: string;
    miningBoost: number;
    createdAt: string;
    updatedAt: string;
    wallet: {
      id: string;
      address: string | null;
      balance: number;
      dailyLimit: number;
      spentToday: number;
      lastResetAt: string;
    } | null;
    owner: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        wallet: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found'
        } as AgentResponse,
        { status: 404 }
      );
    }

    logger.info(`Agent retrieved: ${agent.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          description: agent.description,
          imageUrl: agent.imageUrl,
          type: agent.type,
          status: agent.status,
          apiEndpoint: agent.apiEndpoint,
          powerScore: agent.powerScore,
          tasksCompleted: agent.tasksCompleted,
          totalEarnings: agent.totalEarnings,
          avgRating: agent.avgRating,
          totalRatings: agent.totalRatings,
          stakedAmount: agent.stakedAmount,
          stakingTier: agent.stakingTier,
          miningBoost: agent.miningBoost,
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
          wallet: agent.wallet ? {
            id: agent.wallet.id,
            address: agent.wallet.address,
            balance: agent.wallet.balance,
            dailyLimit: agent.wallet.dailyLimit,
            spentToday: agent.wallet.spentToday,
            lastResetAt: agent.wallet.lastResetAt.toISOString()
          } : null,
          owner: agent.owner
        }
      } as AgentResponse,
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error in GET /api/agents/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      } as AgentResponse,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agents/[id]
 * Update agent metadata (requires auth + ownership check)
 */

interface UpdateAgentRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  type?: string;
  apiEndpoint?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const session = await requireAuth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        } as AgentResponse,
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found'
        } as AgentResponse,
        { status: 404 }
      );
    }

    if (agent.ownerId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not own this agent'
        } as AgentResponse,
        { status: 403 }
      );
    }

    // Parse and validate update data
    const body = await request.json();

    const validation = validateInput(UpdateAgentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        } as AgentResponse,
        { status: 400 }
      );
    }

    // Update agent with validated data
    const updateData: any = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.imageUrl !== undefined) updateData.imageUrl = validation.data.imageUrl;
    if (validation.data.type !== undefined) updateData.type = validation.data.type;
    if (validation.data.apiEndpoint !== undefined) updateData.apiEndpoint = validation.data.apiEndpoint;

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: updateData,
      include: {
        wallet: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info(`Agent updated: ${updatedAgent.id} by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedAgent.id,
          name: updatedAgent.name,
          slug: updatedAgent.slug,
          description: updatedAgent.description,
          imageUrl: updatedAgent.imageUrl,
          type: updatedAgent.type,
          status: updatedAgent.status,
          apiEndpoint: updatedAgent.apiEndpoint,
          powerScore: updatedAgent.powerScore,
          tasksCompleted: updatedAgent.tasksCompleted,
          totalEarnings: updatedAgent.totalEarnings,
          avgRating: updatedAgent.avgRating,
          totalRatings: updatedAgent.totalRatings,
          stakedAmount: updatedAgent.stakedAmount,
          stakingTier: updatedAgent.stakingTier,
          miningBoost: updatedAgent.miningBoost,
          createdAt: updatedAgent.createdAt.toISOString(),
          updatedAt: updatedAgent.updatedAt.toISOString(),
          wallet: updatedAgent.wallet ? {
            id: updatedAgent.wallet.id,
            address: updatedAgent.wallet.address,
            balance: updatedAgent.wallet.balance,
            dailyLimit: updatedAgent.wallet.dailyLimit,
            spentToday: updatedAgent.wallet.spentToday,
            lastResetAt: updatedAgent.wallet.lastResetAt.toISOString()
          } : null,
          owner: updatedAgent.owner
        }
      } as AgentResponse,
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error in PUT /api/agents/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      } as AgentResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * Soft-delete agent (set status to 'suspended')
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const session = await requireAuth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        } as AgentResponse,
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found'
        } as AgentResponse,
        { status: 404 }
      );
    }

    if (agent.ownerId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not own this agent'
        } as AgentResponse,
        { status: 403 }
      );
    }

    // Soft delete: update status to 'suspended'
    const deletedAgent = await prisma.agent.update({
      where: { id },
      data: { status: 'suspended' }
    });

    logger.info(`Agent suspended: ${deletedAgent.id} by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: deletedAgent.id,
          name: deletedAgent.name,
          slug: deletedAgent.slug,
          description: deletedAgent.description,
          imageUrl: deletedAgent.imageUrl,
          type: deletedAgent.type,
          status: deletedAgent.status,
          apiEndpoint: deletedAgent.apiEndpoint,
          powerScore: deletedAgent.powerScore,
          tasksCompleted: deletedAgent.tasksCompleted,
          totalEarnings: deletedAgent.totalEarnings,
          avgRating: deletedAgent.avgRating,
          totalRatings: deletedAgent.totalRatings,
          stakedAmount: deletedAgent.stakedAmount,
          stakingTier: deletedAgent.stakingTier,
          miningBoost: deletedAgent.miningBoost,
          createdAt: deletedAgent.createdAt.toISOString(),
          updatedAt: deletedAgent.updatedAt.toISOString(),
          wallet: null,
          owner: {
            id: userId,
            name: null,
            email: null
          }
        }
      } as AgentResponse,
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error in DELETE /api/agents/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: getSafeErrorMessage(error)
      } as AgentResponse,
      { status: 500 }
    );
  }
}
