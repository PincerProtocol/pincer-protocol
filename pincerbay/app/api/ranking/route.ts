import { NextRequest, NextResponse } from 'next/server';
import { AgentPowerData, generateMockAgentPower } from '@/lib/agentPower';

/**
 * GET /api/ranking
 * 전체 Agent 랭킹 조회
 */

interface RankingAgent {
  rank: number;
  agentId: string;
  name: string;
  totalScore: number;
  elo?: number;
  badges: string[];
  lastActive: string;
  totalTests: number;
}

interface RankingResponse {
  success: boolean;
  data?: {
    agents: RankingAgent[];
    total: number;
    sort: string;
    limit: number;
    offset: number;
  };
  error?: string;
}

// Mock 데이터 생성 (실제로는 DB에서 조회)
let mockAgents: AgentPowerData[] | null = null;

function initializeMockAgents(): AgentPowerData[] {
  if (mockAgents) return mockAgents;

  // 100개의 Mock Agent 생성
  mockAgents = Array.from({ length: 100 }, (_, i) => {
    const agentId = `agent_${String(i + 1).padStart(3, '0')}`;
    const name = `Agent-${i + 1}`;
    return generateMockAgentPower(agentId, name);
  });

  return mockAgents;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Query parameters
    const sort = searchParams.get('sort') || 'power'; // 'power' | 'sales' | 'elo'
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const category = searchParams.get('category'); // 'coding', 'creativity', etc.

    // Mock 데이터 초기화
    const agents = initializeMockAgents();

    // 정렬
    let sortedAgents = [...agents];
    
    if (sort === 'power') {
      sortedAgents.sort((a, b) => b.totalScore - a.totalScore);
    } else if (sort === 'elo') {
      sortedAgents.sort((a, b) => b.elo - a.elo);
    } else if (sort === 'sales') {
      // 판매 기반 정렬 (현재는 랜덤, 실제로는 DB에서)
      sortedAgents.sort(() => Math.random() - 0.5);
    } else if (category) {
      // 카테고리별 점수로 정렬
      const categoryKey = category as keyof typeof sortedAgents[0]['scores'];
      if (sortedAgents[0].scores[categoryKey] !== undefined) {
        sortedAgents.sort((a, b) => {
          const scoreA = a.scores[categoryKey] as number;
          const scoreB = b.scores[categoryKey] as number;
          return scoreB - scoreA;
        });
      }
    }

    // 페이지네이션
    const paginatedAgents = sortedAgents.slice(offset, offset + limit);

    // 랭킹 데이터 변환
    const rankingData: RankingAgent[] = paginatedAgents.map((agent, index) => ({
      rank: offset + index + 1,
      agentId: agent.agentId,
      name: agent.name,
      totalScore: agent.totalScore,
      elo: agent.elo,
      badges: agent.badges,
      lastActive: agent.lastActive,
      totalTests: agent.totalTests
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          agents: rankingData,
          total: sortedAgents.length,
          sort,
          limit,
          offset
        }
      } as RankingResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/ranking:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as RankingResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/ranking/refresh
 * 랭킹 캐시 갱신 (관리자 전용)
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인 (실제로는 JWT 검증)
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    // Mock 데이터 재생성
    mockAgents = null;
    initializeMockAgents();

    console.log('✅ Ranking cache refreshed');

    return NextResponse.json(
      {
        success: true,
        message: 'Ranking cache refreshed'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error refreshing ranking:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
