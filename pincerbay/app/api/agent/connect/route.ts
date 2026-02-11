import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { walletService } from '@/lib/walletService';

/**
 * POST /api/agent/connect
 * Agent connection and registration with DB-backed storage and on-chain wallet creation
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
  agentId?: string;
  apiKey?: string;
  walletAddress?: string | null;
  registeredAt?: string;
  error?: string;
}

/**
 * Convert name to slug (e.g., "My Agent" -> "my-agent")
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate API key with pb_ prefix
 */
function generateApiKey(): string {
  return `pb_${randomUUID()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectRequest = await request.json();

    // Step 1: Validate input
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

    // PublicKey format check
    if (body.publicKey.length < 32) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid public key format'
        } as ConnectResponse,
        { status: 400 }
      );
    }

    // Step 2: Get session and require authentication
    const session = await requireAuth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in to register an agent.'
        } as ConnectResponse,
        { status: 401 }
      );
    }

    const ownerId = session.user.id;

    // Step 3: Create Agent in DB with slug
    const slug = slugify(body.name);

    // Check if slug already exists
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.agent.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const agent = await prisma.agent.create({
      data: {
        ownerId,
        name: body.name,
        slug: finalSlug,
        description: body.metadata?.description,
        type: 'general',
        status: 'active',
      }
    });

    // Step 4: Create AgentWallet in DB (address initially null)
    const agentWallet = await prisma.agentWallet.create({
      data: {
        agentId: agent.id,
        address: null,
        balance: 0,
        dailyLimit: 100,
        spentToday: 0,
      }
    });

    // Step 5: Queue on-chain wallet creation
    let walletAddress: string | null = null;
    const platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY;

    if (platformPrivateKey) {
      try {
        const signer = walletService.getSigner(platformPrivateKey);
        const walletResult = await walletService.createAgentWallet(
          signer,
          agent.id,
          '100' // 100 PNCR daily limit
        );

        walletAddress = walletResult.walletId;

        // Update AgentWallet with on-chain address
        await prisma.agentWallet.update({
          where: { id: agentWallet.id },
          data: { address: walletAddress }
        });

        logger.info(`On-chain wallet created for agent ${agent.id}: ${walletAddress}`);
      } catch (error) {
        logger.error('On-chain wallet creation failed', error);
        // Continue without on-chain wallet - it will be marked as pending
      }
    } else {
      logger.warn('PLATFORM_PRIVATE_KEY not set, wallet creation queued');
    }

    // Step 6: Generate API key
    const apiKey = generateApiKey();

    // Step 7: Store API key in Agent.apiKey (plaintext for MVP)
    await prisma.agent.update({
      where: { id: agent.id },
      data: { apiKey }
    });

    // Step 8: Return response
    logger.info(`Agent registered: ${body.name} (${agent.id}) by user ${ownerId}`);

    return NextResponse.json(
      {
        success: true,
        agentId: agent.id,
        apiKey,
        walletAddress: walletAddress || null,
        registeredAt: agent.createdAt.toISOString()
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
