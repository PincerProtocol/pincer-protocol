import { NextRequest, NextResponse } from 'next/server';
import { 
  AgentPowerData, 
  generateMockAgentPower,
  applyTimeDecay,
  calculateBadges
} from '@/lib/agentPower';

/**
 * GET /api/agent/[id]/power
 * Agent Power 점수 조회
 */

interface PowerResponse {
  success: boolean;
  data?: AgentPowerData;
  error?: string;
}

// Mock 데이터 저장소 (실제로는 DB 사용)
const agentPowerCache = new Map<string, AgentPowerData>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required'
        } as PowerResponse,
        { status: 400 }
      );
    }

    // 캐시에서 조회 또는 Mock 데이터 생성
    let agentPower = agentPowerCache.get(agentId);
    
    if (!agentPower) {
      // 실제로는 DB에서 조회
      // const agentData = await prisma.agent.findUnique({ where: { agentId } });
      
      // Mock 데이터 생성
      agentPower = generateMockAgentPower(agentId, `Agent-${agentId.substring(0, 8)}`);
      agentPowerCache.set(agentId, agentPower);
    }

    // 시간 감쇠 적용
    const lastActive = new Date(agentPower.lastActive);
    const decayedScore = applyTimeDecay(agentPower.totalScore, lastActive);
    
    if (decayedScore !== agentPower.totalScore) {
      agentPower = {
        ...agentPower,
        totalScore: decayedScore
      };
    }

    // 랭킹 계산 (전체 Agent 중 순위)
    const allAgents = Array.from(agentPowerCache.values());
    const sortedAgents = allAgents.sort((a, b) => b.totalScore - a.totalScore);
    const rank = sortedAgents.findIndex(a => a.agentId === agentId) + 1;

    const responseData: AgentPowerData = {
      ...agentPower,
      rank: rank > 0 ? rank : undefined
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData
      } as PowerResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error(`Error in /api/agent/power:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as PowerResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/[id]/power
 * Agent Power 점수 업데이트 (벤치마크 결과 제출)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    // API Key 검증 (실제로는 헤더에서 가져와 검증)
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key required'
        },
        { status: 401 }
      );
    }

    // 점수 업데이트
    const { scores } = body;
    
    if (!scores) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scores data required'
        },
        { status: 400 }
      );
    }

    // 점수 유효성 검사
    const scoreKeys = ['latency', 'accuracy', 'creativity', 'logic', 'coding', 'language', 'multimodal', 'toolUse'];
    for (const key of scoreKeys) {
      if (typeof scores[key] !== 'number' || scores[key] < 0 || scores[key] > 100) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid score for ${key}. Must be between 0 and 100.`
          },
          { status: 400 }
        );
      }
    }

    // 실제로는 DB에 저장
    // await prisma.agent.update({
    //   where: { agentId },
    //   data: {
    //     ...scores,
    //     lastActive: new Date(),
    //     totalTests: { increment: 1 }
    //   }
    // });

    // 캐시 업데이트
    let agentPower = agentPowerCache.get(agentId);
    if (!agentPower) {
      agentPower = generateMockAgentPower(agentId, body.name || `Agent-${agentId.substring(0, 8)}`);
    }

    // 점수 업데이트
    agentPower.scores = scores;
    agentPower.lastActive = new Date().toISOString();
    agentPower.totalTests += 1;
    
    // 총점 재계산
    const { calculateTotalScore } = await import('@/lib/agentPower');
    agentPower.totalScore = calculateTotalScore(scores);
    
    // 뱃지 재계산
    agentPower.badges = calculateBadges(scores, agentPower.elo, agentPower.totalTests);
    
    agentPowerCache.set(agentId, agentPower);

    console.log(`✅ Agent power updated: ${agentId} (Total: ${agentPower.totalScore})`);

    return NextResponse.json(
      {
        success: true,
        data: agentPower
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(`Error updating agent power:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
