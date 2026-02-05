import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction, getPNCRContractAddress } from '@/lib/wallet';
import { isRateLimited } from '@/lib/ratelimit';
import { getWallet } from '@/lib/wallet-db';

export const runtime = 'nodejs';

/**
 * POST /api/payment/verify
 * Verify payment transaction and credit PNCR tokens
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { userId, txHash, expectedAmount } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: 'txHash is required' },
        { status: 400 }
      );
    }

    // Rate limiting - max 20 verifications per minute per user
    if (isRateLimited(`payment-verify:${userId}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get user's wallet
    const wallet = await getWallet(userId);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found. Please create a wallet first.' },
        { status: 404 }
      );
    }

    // Verify transaction
    const verification = await verifyTransaction(txHash);

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Transaction not found or not confirmed yet' },
        { status: 404 }
      );
    }

    // Check if transaction is to the user's wallet
    if (verification.to?.toLowerCase() !== wallet.address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Transaction is not sent to your wallet' },
        { status: 400 }
      );
    }

    // Optional: Verify amount if provided
    if (expectedAmount && verification.value) {
      const receivedAmount = parseFloat(verification.value);
      const expected = parseFloat(expectedAmount);
      
      if (Math.abs(receivedAmount - expected) > 0.0001) {
        return NextResponse.json(
          { 
            error: 'Amount mismatch',
            expected: expectedAmount,
            received: verification.value,
          },
          { status: 400 }
        );
      }
    }

    // Transaction verified successfully
    // In a real system, you would:
    // 1. Check if this transaction was already credited (prevent double-spend)
    // 2. Credit PNCR tokens to user's account
    // 3. Update payment status in database
    // 4. Send notification to user

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        txHash,
        from: verification.from,
        to: verification.to,
        amount: verification.value,
        blockNumber: verification.blockNumber,
        message: 'Payment verified successfully',
        // TODO: Add PNCR credit amount here
      },
    });
  } catch (error) {
    // Log sanitized error (no sensitive data)
    console.error('Error verifying payment:', {
      userId: body?.userId,
      txHash: body?.txHash,
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/verify?txHash=xxx
 * Quick transaction verification (no credit)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');

    if (!txHash) {
      return NextResponse.json(
        { error: 'txHash is required' },
        { status: 400 }
      );
    }

    // Rate limiting by IP or session
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(`payment-verify-get:${clientIp}`, 30, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const verification = await verifyTransaction(txHash);

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Transaction not found or not confirmed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    // Log sanitized error (no sensitive data)
    const url = new URL(request.url);
    console.error('Error verifying transaction:', {
      txHash: url.searchParams.get('txHash'),
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
