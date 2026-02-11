import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { validateInput, PurchaseSoulSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { walletService } from '@/lib/walletService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIdentifier(request);

  try {
    const { id } = await params;

    // Rate limiting check
    const rateLimitExceeded = await checkRateLimit(ip);
    if (rateLimitExceeded) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Authentication check
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get wallet address from session
    const walletAddress = session.user.address || session.user.email || "anonymous";

    // Parse and validate request body
    const body = await request.json();
    const validation = validateInput(PurchaseSoulSchema, {
      wallet: walletAddress,
      ...body
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get soul
    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        soulId: id,
        userId: session.user.id
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this soul' },
        { status: 400 }
      );
    }

    // Get user's wallet
    const userWallet = await prisma.userWallet.findFirst({
      where: { userId: session.user.id }
    });

    if (!userWallet?.address) {
      return NextResponse.json(
        { error: 'Please link your wallet first at /mypage' },
        { status: 400 }
      );
    }

    // Verify balance
    try {
      const balanceStr = await walletService.getPNCRBalance(userWallet.address);
      const balance = parseFloat(balanceStr);

      if (balance < soul.price) {
        return NextResponse.json(
          {
            error: `Insufficient PNCR balance. Required: ${soul.price}, Available: ${balance.toFixed(2)}`,
            required: soul.price,
            available: balance
          },
          { status: 402 } // 402 Payment Required
        );
      }
    } catch (error) {
      logger.error('Balance check failed:', error);
      return NextResponse.json(
        { error: 'Unable to verify wallet balance. Please try again.' },
        { status: 503 }
      );
    }

    // Create pending purchase (awaiting payment)
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        soulId: soul.id,
        price: soul.price,
        buyerAddress: userWallet.address,
        txHash: null, // Will be updated when payment confirmed
        status: 'pending_payment' // Changed from 'confirmed'
      }
    });

    // Create wallet transaction record
    const userWalletRecord = await prisma.userWallet.findFirst({
      where: { address: userWallet.address }
    });

    await prisma.walletTransaction.create({
      data: {
        fromWalletId: userWalletRecord?.id || null,
        toWalletId: null, // TODO: Get soul owner's wallet ID
        amount: soul.price,
        txType: 'purchase',
        txHash: null, // Will be updated when confirmed
        status: 'pending',
        description: `Purchase of Soul: ${soul.name}`
      }
    });

    // TODO: Payment Integration Required
    // Current limitation: This API creates a pending purchase but does NOT execute the payment.
    // To complete the purchase flow, implement:
    // 1. Client-side: User signs PNCR transfer transaction in their wallet
    // 2. Backend: Webhook or polling service monitors blockchain for transaction
    // 3. Backend: POST /api/souls/[id]/confirm-payment endpoint that:
    //    - Verifies transaction on-chain
    //    - Updates purchase.status to 'confirmed'
    //    - Updates purchase.txHash with real transaction hash
    //    - Increments soul.totalSales
    //    - Credits seller

    return NextResponse.json({
      success: true,
      data: {
        ...purchase,
        paymentRequired: true,
        paymentAddress: '0x...', // TODO: Get soul owner's wallet
        paymentAmount: soul.price,
        paymentToken: 'PNCR'
      },
      message: 'Purchase initiated. Please complete payment in your wallet to access Soul.md.'
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
