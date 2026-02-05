/**
 * Payment Status API
 * View overall payment system status
 * GET /api/payment/status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDeposits,
  getProcessedCount,
  getUnprocessedCount,
  getTotalVolumeUSD,
  getLastProcessedBlock,
} from '@/lib/payment-db';
import { getCurrentBlockNumber } from '@/lib/blockchain-monitor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
    
    // Get statistics
    const allDeposits = getAllDeposits();
    const processedCount = getProcessedCount();
    const unprocessedCount = getUnprocessedCount();
    const totalVolumeUSD = getTotalVolumeUSD();
    const lastProcessedBlock = getLastProcessedBlock(network);
    const currentBlock = await getCurrentBlockNumber();

    // Group by token
    const volumeByToken = allDeposits.reduce((acc, deposit) => {
      if (!acc[deposit.token]) {
        acc[deposit.token] = {
          count: 0,
          totalAmount: 0,
          totalUSD: 0,
        };
      }
      acc[deposit.token].count++;
      acc[deposit.token].totalAmount += parseFloat(deposit.amount);
      acc[deposit.token].totalUSD += deposit.amountUSD;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number; totalUSD: number }>);

    // Recent deposits (last 10)
    const recentDeposits = allDeposits.slice(0, 10).map(d => ({
      id: d.id,
      txHash: d.txHash,
      from: d.from,
      token: d.token,
      amount: d.amount,
      amountUSD: d.amountUSD,
      timestamp: d.timestamp,
      processed: d.processed,
      pncrAmount: d.pncrAmount,
      pncrTxHash: d.pncrTxHash,
    }));

    return NextResponse.json({
      success: true,
      network,
      blockchain: {
        lastProcessedBlock,
        currentBlock,
        blocksBehind: currentBlock - lastProcessedBlock,
      },
      statistics: {
        totalDeposits: allDeposits.length,
        processedDeposits: processedCount,
        unprocessedDeposits: unprocessedCount,
        totalVolumeUSD: totalVolumeUSD.toFixed(2),
        volumeByToken,
      },
      recentDeposits,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
