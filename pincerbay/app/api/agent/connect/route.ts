import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

/**
 * POST /api/agent/connect
 * Agent connection and registration
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

// In-memory storage (in production, use DB)
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

    // Name validation
    if (body.name.length < 2 || body.name.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent name must be between 2 and 50 characters'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // Version format check (e.g., 1.0.0)
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

    // PublicKey format check (Base58 check omitted, should be implemented in production)
    if (body.publicKey.length < 32) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid public key format'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // Check if agent is already registered
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

    // Agent registration
    const agentId = body.publicKey; // Use publicKey as agentId
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

    // In production, save to DB
    // await prisma.agent.create({ data: agentData });

    logger.info(`✅ Agent registered: ${body.name} (${agentId})`);

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
    logger.error('Error in /api/agent/connect:', error);

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
 * API Key generation (temporary implementation)
 */
function generateApiKey(): string {
  const prefix = 'pb_'; // PincerBay prefix
  const randomPart = uuidv4().replace(/-/g, '');
  return `${prefix}${randomPart}`;
}

/**
 * Wallet Address generation (temporary implementation)
 * In production, use Solana Keypair generation logic
 */
function generateWalletAddress(publicKey: string): string {
  // In production, generate Solana wallet address
  // For now, generate address based on publicKey
  return `wallet_${publicKey.substring(0, 16)}`;
}

/**
 * Handle GET request (query registered Agent)
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
