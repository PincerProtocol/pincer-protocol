import { NextRequest, NextResponse } from 'next/server';
import { getWallet, saveWithdrawal, updateWithdrawalStatus } from '@/lib/wallet-db';
import { sendTransaction, getETHBalance, getPNCRBalance } from '@/lib/wallet';
import { isRateLimited } from '@/lib/ratelimit';
import { ethers } from 'ethers';

export const runtime = 'nodejs';

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from custodial wallet to user's external wallet
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { userId, to, amount, asset } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!to || !ethers.isAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal address' },
        { status: 400 }
      );
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!asset || !['ETH', 'PNCR'].includes(asset)) {
      return NextResponse.json(
        { error: 'Asset must be either ETH or PNCR' },
        { status: 400 }
      );
    }

    // Rate limiting - max 10 withdrawals per hour per user
    if (isRateLimited(`wallet-withdraw:${userId}`, 10, 3600000)) {
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

    // Check balance
    const balance = asset === 'ETH' 
      ? await getETHBalance(wallet.address)
      : await getPNCRBalance(wallet.address);

    if (parseFloat(balance) < parseFloat(amount)) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record
    const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await saveWithdrawal({
      id: withdrawalId,
      userId,
      to,
      amount,
      asset,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Execute transaction (custodial signing)
    const result = await sendTransaction(
      wallet.encryptedPrivateKey,
      to,
      amount,
      asset === 'PNCR'
    );

    if (!result.success) {
      await updateWithdrawalStatus(withdrawalId, 'failed');
      return NextResponse.json(
        { error: result.error || 'Transaction failed' },
        { status: 500 }
      );
    }

    // Update withdrawal status
    await updateWithdrawalStatus(withdrawalId, 'completed', result.txHash);

    return NextResponse.json({
      success: true,
      data: {
        withdrawalId,
        txHash: result.txHash,
        to,
        amount,
        asset,
        status: 'completed',
      },
    });
  } catch (error) {
    // Log sanitized error (no sensitive data)
    console.error('Error processing withdrawal:', {
      userId: body?.userId,
      to: body?.to,
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
 * GET /api/wallet/withdraw?userId=xxx
 * Get withdrawal history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (isRateLimited(`wallet-withdraw-history:${userId}`, 30, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { getWithdrawalsByUser } = await import('@/lib/wallet-db');
    const withdrawals = await getWithdrawalsByUser(userId);

    return NextResponse.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    // Log sanitized error (no sensitive data)
    const url = new URL(request.url);
    console.error('Error fetching withdrawal history:', {
      userId: url.searchParams.get('userId'),
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
