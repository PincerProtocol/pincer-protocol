import { NextRequest, NextResponse } from 'next/server';
import { getWallet } from '@/lib/wallet-db';
import { getETHBalance, getPNCRBalance, getTransactionHistory } from '@/lib/wallet';
import { isRateLimited } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/**
 * GET /api/wallet/[userId]
 * Get wallet information, balances, and transaction history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Rate limiting - max 30 requests per minute per user
    if (isRateLimited(`wallet-get:${userId}`, 30, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get wallet from database
    const wallet = await getWallet(userId);
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Fetch balances
    const [ethBalance, pncrBalance, transactions] = await Promise.all([
      getETHBalance(wallet.address),
      getPNCRBalance(wallet.address),
      getTransactionHistory(wallet.address, 20),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        userId: wallet.userId,
        address: wallet.address,
        createdAt: wallet.createdAt,
        balances: {
          ETH: ethBalance,
          PNCR: pncrBalance,
        },
        transactions,
      },
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
