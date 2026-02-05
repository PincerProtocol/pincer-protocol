import { NextRequest, NextResponse } from 'next/server';
import { createWallet } from '@/lib/wallet';
import { saveWallet, walletExists } from '@/lib/wallet-db';
import { isRateLimited } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/**
 * POST /api/wallet/create
 * Create a new temporary custodial wallet
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { userId } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    // Rate limiting - max 5 wallet creations per hour per user
    if (isRateLimited(`wallet-create:${userId}`, 5, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if wallet already exists
    const exists = await walletExists(userId);
    if (exists) {
      return NextResponse.json(
        { error: 'Wallet already exists for this user' },
        { status: 409 }
      );
    }

    // Create wallet
    const wallet = createWallet(userId);

    // Save to database (encrypted private key)
    await saveWallet({
      userId: wallet.userId,
      address: wallet.address,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      createdAt: wallet.createdAt,
    });

    // Return address only (never expose private key)
    return NextResponse.json(
      {
        success: true,
        data: {
          userId: wallet.userId,
          address: wallet.address,
          createdAt: wallet.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Log sanitized error (no sensitive data)
    console.error('Error creating wallet:', {
      userId: body?.userId,
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
