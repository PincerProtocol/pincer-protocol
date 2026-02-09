import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, generateMockAgentPower } from '@/lib/agentPower';
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

    // Try to get existing agent
    const agent = getAgentById(agentId);
    
    if (agent) {
      return NextResponse.json({
        success: true,
        data: {
          agentId: agent.id,
          name: agent.name,
          totalPower: agent.totalPower,
          capabilities: agent.capabilities,
          personality: agent.personality,
          mbtiCode: agent.mbtiCode,
        }
      });
    }

    // Generate mock data for unknown agents
    const mockPower = generateMockAgentPower(agentId);
    
    return NextResponse.json({
      success: true,
      data: mockPower
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
    const body = await request.json();

    // For now, just generate and return power data
    // In production, this would save to database
    const mockPower = generateMockAgentPower(agentId);

    return NextResponse.json({
      success: true,
      message: 'Power data submitted',
      data: mockPower
    });

  } catch (error) {
    logger.error('Error updating agent power:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
