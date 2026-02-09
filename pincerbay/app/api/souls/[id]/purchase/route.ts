import { NextRequest, NextResponse } from 'next/server';
import { getSoulById, recordPurchase, hasPurchased } from '@/lib/soulsDB';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { validateInput, PurchaseSoulSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

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
    
    // Get wallet address from session or request
    const walletAddress = (session.user as any)?.address || session.user?.email || "anonymous";
    
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
    const soul = getSoulById(id);
    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    // Check if already purchased
    if (hasPurchased(id, walletAddress)) {
      return NextResponse.json(
        { error: 'You have already purchased this soul' },
        { status: 400 }
      );
    }
    
    // Mock transaction for now
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    
    // Record purchase
    const purchase = recordPurchase(id, walletAddress, soul.price, mockTxHash);
    
    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase successful! Soul.md is now available for download.'
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
