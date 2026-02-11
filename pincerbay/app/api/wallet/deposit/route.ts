import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { walletService } from '@/lib/walletService'
import { TREASURY_ADDRESS } from '@/lib/contracts/PNCR'

/**
 * POST /api/wallet/deposit
 * Verify on-chain PNCR deposit and credit internal balance
 * 
 * Body: { txHash: string }
 * 
 * Flow:
 * 1. User sends PNCR to treasury address via MetaMask
 * 2. User submits txHash to this endpoint
 * 3. We verify the transaction on-chain
 * 4. Credit user's internal balance
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { txHash } = await req.json()

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      )
    }

    logger.info('Processing deposit', { userId: session.user.id, txHash })

    // Check if txHash already processed
    const existingTx = await prisma.walletTransaction.findFirst({
      where: { txHash }
    })

    if (existingTx) {
      return NextResponse.json(
        { error: 'This transaction has already been processed' },
        { status: 400 }
      )
    }

    // Get user's wallet
    let userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!userWallet) {
      // Create wallet if doesn't exist
      userWallet = await prisma.userWallet.create({
        data: {
          userId: session.user.id,
          address: '', // Will be set when user connects MetaMask
          type: 'custodial',
          balance: 0
        }
      })
    }

    // TODO: Verify transaction on-chain
    // For full implementation, we need to:
    // 1. Get transaction receipt from provider
    // 2. Verify it's a PNCR transfer to treasury
    // 3. Extract the amount and sender address
    // 4. Verify sender matches user's connected address
    
    // For now, require manual verification or use a webhook service
    // This is a placeholder that should be replaced with real verification
    
    // Create pending deposit record
    const transaction = await prisma.walletTransaction.create({
      data: {
        toWalletId: userWallet.id,
        amount: 0, // Will be updated after verification
        txType: 'deposit',
        txHash,
        status: 'pending',
        description: 'On-chain deposit - pending verification'
      }
    })

    logger.info('Deposit recorded, pending verification', {
      userId: session.user.id,
      txHash,
      transactionId: transaction.id
    })

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        status: 'pending',
        message: 'Deposit submitted. It will be credited after on-chain confirmation (usually 1-2 minutes).'
      }
    })

  } catch (error) {
    logger.error('Deposit error:', error)
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/wallet/deposit
 * Get deposit information (treasury address, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        treasuryAddress: TREASURY_ADDRESS,
        tokenAddress: '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c',
        network: 'Base',
        chainId: 8453,
        instructions: [
          '1. Connect your MetaMask wallet to Base network',
          '2. Send PNCR tokens to the treasury address',
          '3. After confirmation, submit the transaction hash',
          '4. Your internal balance will be credited automatically'
        ]
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get deposit info' }, { status: 500 })
  }
}
