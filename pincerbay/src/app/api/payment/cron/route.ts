/**
 * Payment Cron Job API
 * Automatically runs monitor + process
 * Called by Vercel Cron every 30 seconds
 * GET /api/payment/cron
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAllDeposits,
  getSafeBlockRange,
  processDeposit,
  calculatePNCRAmount,
} from '@/lib/blockchain-monitor';
import {
  getLastProcessedBlock,
  setLastProcessedBlock,
  saveDeposit,
  getDeposit,
  getUnprocessedDeposits,
  markDepositProcessed,
} from '@/lib/payment-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
    const results: any = {
      monitoring: {},
      processing: {},
    };

    // === STEP 1: Monitor for new deposits ===
    const lastProcessedBlock = getLastProcessedBlock(network);
    const blockRange = await getSafeBlockRange(lastProcessedBlock, 12);
    
    if (blockRange) {
      const deposits = await checkAllDeposits(
        blockRange.fromBlock,
        blockRange.toBlock
      );

      let newDepositsCount = 0;
      for (const deposit of deposits) {
        const existing = getDeposit(deposit.id);
        if (!existing) {
          saveDeposit(deposit);
          newDepositsCount++;
        }
      }

      setLastProcessedBlock(blockRange.toBlock, network);

      results.monitoring = {
        success: true,
        blocksScanned: blockRange.toBlock - blockRange.fromBlock + 1,
        lastProcessedBlock: blockRange.toBlock,
        newDeposits: newDepositsCount,
      };
    } else {
      results.monitoring = {
        success: true,
        message: 'No new blocks to process',
        lastProcessedBlock,
      };
    }

    // === STEP 2: Process unprocessed deposits ===
    const unprocessedDeposits = getUnprocessedDeposits();
    
    if (unprocessedDeposits.length > 0) {
      const processResults = [];
      let successCount = 0;
      let errorCount = 0;

      for (const deposit of unprocessedDeposits) {
        try {
          const result = await processDeposit(deposit);

          if (result.success && result.pncrTxHash) {
            const pncrAmount = calculatePNCRAmount(deposit.amountUSD);
            markDepositProcessed(deposit.id, pncrAmount, result.pncrTxHash);
            
            processResults.push({
              depositId: deposit.id,
              from: deposit.from,
              amountUSD: deposit.amountUSD,
              pncrAmount,
              pncrTxHash: result.pncrTxHash,
              success: true,
            });
            
            successCount++;
          } else {
            processResults.push({
              depositId: deposit.id,
              from: deposit.from,
              success: false,
              error: result.error,
            });
            
            errorCount++;
          }
        } catch (error) {
          console.error(`Cron: Error processing deposit ${deposit.id}:`, error);
          errorCount++;
        }
      }

      results.processing = {
        success: true,
        totalDeposits: unprocessedDeposits.length,
        processed: successCount,
        failed: errorCount,
        results: processResults,
      };
    } else {
      results.processing = {
        success: true,
        message: 'No deposits to process',
      };
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      network,
      ...results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    
    const executionTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: executionTime,
      },
      { status: 500 }
    );
  }
}
