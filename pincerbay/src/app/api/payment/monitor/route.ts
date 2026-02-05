/**
 * Payment Monitor API
 * Monitors blockchain for new deposits to Treasury
 * GET /api/payment/monitor
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAllDeposits,
  getCurrentBlockNumber,
  getSafeBlockRange,
} from '@/lib/blockchain-monitor';
import {
  getLastProcessedBlock,
  setLastProcessedBlock,
  saveDeposit,
  getDeposit,
} from '@/lib/payment-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
    
    // Get last processed block
    const lastProcessedBlock = getLastProcessedBlock(network);
    
    // Get current block
    const currentBlock = await getCurrentBlockNumber();
    
    // Get safe block range (with confirmations)
    const blockRange = await getSafeBlockRange(lastProcessedBlock, 12);
    
    if (!blockRange) {
      return NextResponse.json({
        success: true,
        message: 'No new blocks to process',
        lastProcessedBlock,
        currentBlock,
        newDeposits: 0,
      });
    }

    // Check for new deposits
    const deposits = await checkAllDeposits(
      blockRange.fromBlock,
      blockRange.toBlock
    );

    // Save new deposits to DB
    let newDepositsCount = 0;
    for (const deposit of deposits) {
      const existing = getDeposit(deposit.id);
      if (!existing) {
        saveDeposit(deposit);
        newDepositsCount++;
      }
    }

    // Update last processed block
    setLastProcessedBlock(blockRange.toBlock, network);

    return NextResponse.json({
      success: true,
      lastProcessedBlock: blockRange.toBlock,
      currentBlock,
      blocksScanned: blockRange.toBlock - blockRange.fromBlock + 1,
      newDeposits: newDepositsCount,
      deposits: deposits.map(d => ({
        id: d.id,
        txHash: d.txHash,
        from: d.from,
        token: d.token,
        amount: d.amount,
        amountUSD: d.amountUSD,
        blockNumber: d.blockNumber,
        processed: d.processed,
      })),
    });
  } catch (error) {
    console.error('Error monitoring deposits:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
