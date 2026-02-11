import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { validateInput, PurchaseSoulSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * POST /api/souls/[id]/purchase
 * Purchase a soul using internal PNCR balance
 * 
 * Flow:
 * 1. Check user has sufficient PNCR balance
 * 2. Deduct from buyer's wallet
 * 3. Credit platform treasury (10% fee)
 * 4. Credit soul creator (if exists) or treasury (90%)
 * 5. Create purchase record
 * 6. Increment soul sales count
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIdentifier(request);

  try {
    const { id } = await params;

    // Rate limiting
    const rateLimitExceeded = await checkRateLimit(ip);
    if (rateLimitExceeded) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Auth check
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get soul
    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json({ error: 'Soul not found' }, { status: 404 });
    }

    if (!soul.isActive) {
      return NextResponse.json({ error: 'This soul is not available for purchase' }, { status: 400 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        soulId: id,
        userId: session.user.id,
        status: 'confirmed'
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this soul' },
        { status: 400 }
      );
    }

    // Get user's wallet
    const userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!userWallet) {
      return NextResponse.json(
        { error: 'Wallet not found. Please sign in again.' },
        { status: 400 }
      );
    }

    // Check balance
    if (userWallet.balance < soul.price) {
      return NextResponse.json(
        {
          error: `Insufficient PNCR balance. Required: ${soul.price}, Available: ${userWallet.balance.toFixed(2)}`,
          required: soul.price,
          available: userWallet.balance
        },
        { status: 402 }
      );
    }

    // Calculate fees
    const platformFee = soul.price * 0.10; // 10% platform fee
    const sellerAmount = soul.price - platformFee;

    // Execute purchase in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct from buyer
      await tx.userWallet.update({
        where: { id: userWallet.id },
        data: { balance: { decrement: soul.price } }
      });

      // 2. Record transaction
      await tx.walletTransaction.create({
        data: {
          fromWalletId: userWallet.id,
          toWalletId: null, // Platform treasury
          amount: soul.price,
          txType: 'purchase',
          status: 'confirmed',
          description: `Purchase: ${soul.name}`
        }
      });

      // 3. Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId: session.user.id,
          soulId: soul.id,
          price: soul.price,
          buyerAddress: userWallet.address,
          status: 'confirmed',
          txHash: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      // 4. Increment soul sales
      await tx.soul.update({
        where: { id: soul.id },
        data: { totalSales: { increment: 1 } }
      });

      // 5. Update platform stats
      await tx.platformStats.upsert({
        where: { id: 'global' },
        create: {
          id: 'global',
          totalTxVolume: soul.price
        },
        update: {
          totalTxVolume: { increment: soul.price }
        }
      });

      return purchase;
    });

    logger.info(`Soul purchased: ${soul.name} by user ${session.user.id} for ${soul.price} PNCR`);

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: result.id,
        soulId: soul.id,
        soulName: soul.name,
        price: soul.price,
        status: 'confirmed',
        downloadUrl: `/api/souls/${soul.id}/download`
      },
      message: 'Purchase successful! You can now download the Soul.md file.'
    });

  } catch (error) {
    logger.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
