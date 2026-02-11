import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { walletService } from '@/lib/walletService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/user/wallet
 * DEPRECATED: Use /api/my-wallet instead
 * This endpoint provides backward compatibility with a simplified response
 */
export async function GET() {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up UserWallet by userId
    const userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!userWallet) {
      return NextResponse.json({ error: 'No wallet connected' }, { status: 400 });
    }

    // Get real on-chain balance
    let balance = '0.00';
    try {
      const onChainBalance = await walletService.getPNCRBalance(userWallet.address);
      balance = parseFloat(onChainBalance).toFixed(2);

      // Update cached balance
      await prisma.userWallet.update({
        where: { id: userWallet.id },
        data: { balance: parseFloat(onChainBalance) }
      });
    } catch (error) {
      logger.warn('RPC unavailable, using cached balance', { error });
      balance = userWallet.balance.toFixed(2);
    }

    // Simplified response for backward compatibility
    const walletData = {
      address: userWallet.address,
      balance,
      soulTokens: 0 // Placeholder for future feature
    };

    return NextResponse.json(walletData);
  } catch (error) {
    logger.error('Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
