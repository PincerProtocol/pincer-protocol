import { NextRequest, NextResponse } from 'next/server';
import { getSoulById, recordPurchase, hasPurchased } from '@/lib/soulsDB';
import { requireAuth, isSessionValid } from '@/lib/auth';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { validateInput, PurchaseSoulSchema } from '@/lib/validations';
import { logger, logApiRequest, logSecurityEvent, logError } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const ip = getIdentifier(request);
  const userAgent = request.headers.get("user-agent");
  
  try {
    const { id } = await params;
    
    // Log API request
    logApiRequest("POST", `/api/souls/${id}/purchase`, ip, userAgent);
    
    // Rate limiting check
    const rateLimitExceeded = await checkRateLimit(ip);
    if (rateLimitExceeded) {
      logSecurityEvent("rate_limit_exceeded", { ip, path: `/api/souls/${id}/purchase` });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    // Authentication check
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      logSecurityEvent("unauthorized_purchase_attempt", { ip, soulId: id });
      return authResult;
    }
    
    // Get wallet address from authenticated session
    const session = authResult;
    const walletAddress = (session.user as any)?.address || "0x123..."; 
    
    if (!walletAddress) {
      logSecurityEvent("missing_wallet_in_session", { ip, soulId: id });
      return NextResponse.json(
        { error: 'Invalid session - wallet address not found' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = validateInput(PurchaseSoulSchema, {
      wallet: walletAddress, // Use authenticated wallet, not body wallet
      ...body
    });
    
    if (!validation.success) {
      logger.warn("Invalid purchase request", { 
        error: validation.error, 
        ip, 
        soulId: id 
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Get soul
    const soul = await getSoulById(id);
    if (!soul) {
      logger.info("Soul not found", { soulId: id, ip });
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    // Check if already purchased
    if (await hasPurchased(id, walletAddress)) {
      logger.info("Duplicate purchase attempt", { 
        soulId: id, 
        wallet: walletAddress 
      });
      return NextResponse.json(
        { error: 'You have already purchased this soul' },
        { status: 400 }
      );
    }
    
    // TODO: Implement actual blockchain transaction
    // 1. Check wallet balance
    // 2. Transfer PNCR to treasury
    // 3. Wait for confirmation
    
    // Mock transaction for now
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    
    // Record purchase
    const purchase = await recordPurchase(id, walletAddress, soul.price, mockTxHash);
    
    logger.info("Purchase successful", {
      soulId: id,
      wallet: walletAddress,
      price: soul.price,
      txHash: mockTxHash,
      duration: Date.now() - startTime
    });
    
    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase successful! Soul.md is now available for download.'
    });
    
  } catch (error) {
    logError(error, { 
      path: `/api/souls/${await params.then(p => p.id)}/purchase`, 
      ip 
    });
    
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
