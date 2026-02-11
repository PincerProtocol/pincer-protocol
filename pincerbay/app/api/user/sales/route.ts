import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/sales
 * Fetch all wallet transactions for the current user's wallet(s)
 *
 * Returns WalletTransaction[] with type, amount, status, createdAt
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Get user's UserWallet
    const userWallet = await prisma.userWallet.findUnique({
      where: { userId }
    });

    // 2. Get user's AgentWallets
    const agentWallets = await prisma.agentWallet.findMany({
      where: { agent: { ownerId: userId } }
    });

    const walletIds = userWallet ? [userWallet.id] : [];
    const agentWalletIds = agentWallets.map(w => w.id);

    // 3. Fetch all transactions involving user's wallets
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        OR: [
          { fromWalletId: { in: walletIds } },
          { toWalletId: { in: walletIds } },
          { fromAgentWalletId: { in: agentWalletIds } },
          { toAgentWalletId: { in: agentWalletIds } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 transactions
    });

    return NextResponse.json({
      success: true,
      data: transactions.map(tx => ({
        id: tx.id,
        type: tx.txType,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        txHash: tx.txHash,
        createdAt: tx.createdAt.toISOString()
      }))
    });
  } catch (error) {
    logger.error('Sales API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
