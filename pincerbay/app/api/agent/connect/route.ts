import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/agent/connect
 * Agent 연결 및 등록
 */

interface ConnectRequest {
  name: string;
  version: string;
  publicKey: string;
  metadata?: {
    model?: string;
    capabilities?: string[];
    description?: string;
  };
}

interface ConnectResponse {
  success: boolean;
  agentId: string;
  apiKey?: string;
  walletAddress?: string;
  registeredAt?: string;
  error?: string;
}

// In-memory storage (실제로는 DB 사용)
const registeredAgents = new Map<string, {
  agentId: string;
  name: string;
  version: string;
  publicKey: string;
  apiKey: string;
  walletAddress: string;
  registeredAt: string;
  metadata?: any;
}>();

export async function POST(request: NextRequest) {
  try {
    const body: ConnectRequest = await request.json();

    // Validation
    if (!body.name || !body.version || !body.publicKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, version, publicKey'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // 이름 유효성 검사
    if (body.name.length < 2 || body.name.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent name must be between 2 and 50 characters'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // 버전 형식 검사 (예: 1.0.0)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(body.version)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid version format. Expected: x.y.z (e.g., 1.0.0)'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // publicKey 형식 검사 (Base58 체크는 생략, 실제로는 구현 필요)
    if (body.publicKey.length < 32) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid public key format'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // 이미 등록된 Agent인지 확인
    const existingAgent = Array.from(registeredAgents.values()).find(
      agent => agent.publicKey === body.publicKey
    );

    if (existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent already registered with this public key'
        } as ConnectResponse,
        { status: 409 }
      );
    }

    // Agent 등록
    const agentId = body.publicKey; // publicKey를 agentId로 사용
    const apiKey = generateApiKey();
    const walletAddress = generateWalletAddress(body.publicKey);
    const registeredAt = new Date().toISOString();

    const agentData = {
      agentId,
      name: body.name,
      version: body.version,
      publicKey: body.publicKey,
      apiKey,
      walletAddress,
      registeredAt,
      metadata: body.metadata
    };

    registeredAgents.set(agentId, agentData);

    // 실제로는 DB에 저장
    // await prisma.agent.create({ data: agentData });

    console.log(`✅ Agent registered: ${body.name} (${agentId})`);

    return NextResponse.json(
      {
        success: true,
        agentId,
        apiKey,
        walletAddress,
        registeredAt
      } as ConnectResponse,
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in /api/agent/connect:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as ConnectResponse,
      { status: 500 }
    );
  }
}

/**
 * API Key 생성 (임시 구현)
 */
function generateApiKey(): string {
  const prefix = 'pb_'; // PincerBay prefix
  const randomPart = uuidv4().replace(/-/g, '');
  return `${prefix}${randomPart}`;
}

/**
 * Wallet Address 생성 (임시 구현)
 * 실제로는 Solana Keypair 생성 로직 사용
 */
function generateWalletAddress(publicKey: string): string {
  // 실제로는 Solana 지갑 주소 생성
  // 여기서는 임시로 publicKey 기반 주소 생성
  return `wallet_${publicKey.substring(0, 16)}`;
}

/**
 * GET 요청 처리 (등록된 Agent 조회)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const publicKey = searchParams.get('publicKey');

  if (!publicKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'publicKey parameter required'
      },
      { status: 400 }
    );
  }

  const agent = Array.from(registeredAgents.values()).find(
    a => a.publicKey === publicKey
  );

  if (!agent) {
    return NextResponse.json(
      {
        success: false,
        error: 'Agent not found'
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    agent: {
      agentId: agent.agentId,
      name: agent.name,
      version: agent.version,
      walletAddress: agent.walletAddress,
      registeredAt: agent.registeredAt
    }
  });
}
