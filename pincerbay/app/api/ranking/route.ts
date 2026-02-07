import { NextRequest, NextResponse } from 'next/server';
import { getAgentsByPower, getAgentsBySales } from '@/lib/agentPower';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'power';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Get agents
    const agents = sort === 'sales' ? getAgentsBySales() : getAgentsByPower();

    // Paginate
    const paginatedAgents = agents.slice(offset, offset + limit);

    // Format response
    const rankingData = paginatedAgents.map((agent, index) => ({
      rank: offset + index + 1,
      agentId: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      creator: agent.creator,
      totalPower: agent.totalPower,
      sales: agent.sales,
      rating: agent.rating,
      mbtiCode: agent.mbtiCode,
    }));

    return NextResponse.json({
      success: true,
      data: {
        agents: rankingData,
        total: agents.length,
        sort,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Error in /api/ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
