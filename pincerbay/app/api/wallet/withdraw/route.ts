import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { walletService } from '@/lib/walletService'
import { ethers } from 'ethers'

const MIN_WITHDRAW = 10 // Minimum 10 PNCR
const WITHDRAW_FEE = 1 // 1 PNCR withdrawal fee

/**
 * POST /api/wallet/withdraw
 * Withdraw PNCR from internal balance to on-chain address
 * 
 * Body: { amount: number, toAddress: string }
 * 
 * Flow:
 * 1. Verify user has sufficient internal balance
 * 2. Deduct from internal balance (amount + fee)
 * 3. Send PNCR to user's address from platform wallet
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, toAddress } = await req.json()

    // Validate inputs
    if (!amount || typeof amount !== 'number' || amount < MIN_WITHDRAW) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${MIN_WITHDRAW} PNCR` },
        { status: 400 }
      )
    }

    if (!toAddress || !ethers.isAddress(toAddress)) {
      return NextResponse.json(
        { error: 'Invalid destination address' },
        { status: 400 }
      )
    }

    const totalDeduction = amount + WITHDRAW_FEE

    // Get user's wallet
    const userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!userWallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 400 }
      )
    }

    // Check balance
    if (userWallet.balance < totalDeduction) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ${totalDeduction} PNCR (${amount} + ${WITHDRAW_FEE} fee), Available: ${userWallet.balance.toFixed(2)} PNCR`
        },
        { status: 402 }
      )
    }

    logger.info('Processing withdrawal', {
      userId: session.user.id,
      amount,
      toAddress,
      fee: WITHDRAW_FEE
    })

    // Check if platform wallet is configured
    const platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY

    if (!platformPrivateKey) {
      // Queue withdrawal for manual processing
      const transaction = await prisma.$transaction(async (tx) => {
        // Deduct from balance
        await tx.userWallet.update({
          where: { id: userWallet.id },
          data: { balance: { decrement: totalDeduction } }
        })

        // Create pending withdrawal record
        return tx.walletTransaction.create({
          data: {
            fromWalletId: userWallet.id,
            amount: amount,
            txType: 'withdrawal',
            txHash: null,
            status: 'pending',
            description: `Withdrawal to ${toAddress} - queued for manual processing`
          }
        })
      })

      logger.warn('Withdrawal queued for manual processing (no PLATFORM_PRIVATE_KEY)', {
        transactionId: transaction.id
      })

      return NextResponse.json({
        success: true,
        data: {
          transactionId: transaction.id,
          amount,
          fee: WITHDRAW_FEE,
          toAddress,
          status: 'pending',
          message: 'Withdrawal queued. It will be processed within 24 hours.'
        }
      })
    }

    // Process withdrawal automatically
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Deduct from balance first
        await tx.userWallet.update({
          where: { id: userWallet.id },
          data: { balance: { decrement: totalDeduction } }
        })

        // Create transaction record
        const transaction = await tx.walletTransaction.create({
          data: {
            fromWalletId: userWallet.id,
            amount: amount,
            txType: 'withdrawal',
            txHash: null,
            status: 'processing',
            description: `Withdrawal to ${toAddress}`
          }
        })

        return transaction
      })

      // Send on-chain transaction
      const signer = walletService.getSigner(platformPrivateKey)
      const txResult = await walletService.transferPNCR(signer, toAddress, amount.toString())

      // Update transaction with txHash
      await prisma.walletTransaction.update({
        where: { id: result.id },
        data: {
          txHash: txResult.txHash,
          status: 'confirmed'
        }
      })

      logger.info('Withdrawal completed', {
        userId: session.user.id,
        transactionId: result.id,
        txHash: txResult.txHash,
        amount,
        toAddress
      })

      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.id,
          amount,
          fee: WITHDRAW_FEE,
          toAddress,
          txHash: txResult.txHash,
          status: 'confirmed',
          explorerUrl: `https://basescan.org/tx/${txResult.txHash}`
        }
      })

    } catch (onChainError) {
      logger.error('On-chain withdrawal failed:', onChainError)

      // Refund balance if on-chain fails
      await prisma.userWallet.update({
        where: { id: userWallet.id },
        data: { balance: { increment: totalDeduction } }
      })

      return NextResponse.json(
        { error: 'On-chain transfer failed. Your balance has been refunded.' },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/wallet/withdraw
 * Get withdrawal information (fees, limits, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      success: true,
      data: {
        minWithdraw: MIN_WITHDRAW,
        fee: WITHDRAW_FEE,
        maxWithdraw: userWallet ? Math.max(0, userWallet.balance - WITHDRAW_FEE) : 0,
        balance: userWallet?.balance || 0,
        network: 'Base',
        estimatedTime: '1-5 minutes'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get withdrawal info' }, { status: 500 })
  }
}
