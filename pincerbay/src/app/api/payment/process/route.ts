/**
 * Payment Processing API
 * Processes unprocessed deposits and sends PNCR tokens
 * POST /api/payment/process
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processDeposit,
  calculatePNCRAmount,
} from '@/lib/blockchain-monitor';
import {
  getUnprocessedDeposits,
  markDepositProcessed,
} from '@/lib/payment-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get all unprocessed deposits
    const unprocessedDeposits = getUnprocessedDeposits();

    if (unprocessedDeposits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No deposits to process',
        processed: 0,
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each deposit
    for (const deposit of unprocessedDeposits) {
      try {
        const result = await processDeposit(deposit);

        if (result.success && result.pncrTxHash) {
          const pncrAmount = calculatePNCRAmount(deposit.amountUSD);
          
          // Mark as processed
          markDepositProcessed(deposit.id, pncrAmount, result.pncrTxHash);
          
          results.push({
            depositId: deposit.id,
            depositTxHash: deposit.txHash,
            from: deposit.from,
            amountUSD: deposit.amountUSD,
            pncrAmount,
            pncrTxHash: result.pncrTxHash,
            success: true,
          });
          
          successCount++;
        } else {
          results.push({
            depositId: deposit.id,
            depositTxHash: deposit.txHash,
            from: deposit.from,
            amountUSD: deposit.amountUSD,
            success: false,
            error: result.error,
          });
          
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing deposit ${deposit.id}:`, error);
        
        results.push({
          depositId: deposit.id,
          depositTxHash: deposit.txHash,
          from: deposit.from,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalDeposits: unprocessedDeposits.length,
      processed: successCount,
      failed: errorCount,
      results,
    });
  } catch (error) {
    console.error('Error in payment processing:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Check processing status
 */
export async function GET(request: NextRequest) {
  try {
    const unprocessedDeposits = getUnprocessedDeposits();
    
    return NextResponse.json({
      success: true,
      unprocessedCount: unprocessedDeposits.length,
      deposits: unprocessedDeposits.map(d => ({
        id: d.id,
        txHash: d.txHash,
        from: d.from,
        token: d.token,
        amount: d.amount,
        amountUSD: d.amountUSD,
        timestamp: d.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error checking processing status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
