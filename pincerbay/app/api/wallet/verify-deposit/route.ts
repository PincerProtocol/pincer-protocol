import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ethers } from 'ethers'
import { PNCR_ADDRESS, TREASURY_ADDRESS } from '@/lib/contracts/PNCR'

const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'

// PNCR Transfer event signature
const TRANSFER_EVENT_TOPIC = ethers.id('Transfer(address,address,uint256)')

/**
 * POST /api/wallet/verify-deposit
 * Verify a deposit transaction and credit balance
 * 
 * Body: { txHash: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { txHash } = await req.json()

    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash required' }, { status: 400 })
    }

    // Normalize txHash
    const normalizedTxHash = txHash.toLowerCase()

    logger.info('Verifying deposit', { userId: session.user.id, txHash: normalizedTxHash })

    // Check if already verified
    const existingTx = await prisma.walletTransaction.findFirst({
      where: {
        txHash: { equals: normalizedTxHash, mode: 'insensitive' },
        status: 'confirmed'
      }
    })

    if (existingTx) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'already_verified',
          amount: existingTx.amount,
          message: 'This deposit has already been verified and credited.'
        }
      })
    }

    // Get user's wallet
    let userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!userWallet) {
      userWallet = await prisma.userWallet.create({
        data: {
          userId: session.user.id,
          address: '',
          type: 'custodial',
          balance: 0
        }
      })
    }

    // Verify transaction on-chain
    const provider = new ethers.JsonRpcProvider(BASE_RPC)

    let receipt
    try {
      receipt = await provider.getTransactionReceipt(normalizedTxHash)
    } catch (error) {
      return NextResponse.json(
        { error: 'Transaction not found. Please wait for confirmation and try again.' },
        { status: 404 }
      )
    }

    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction not found or not yet confirmed' },
        { status: 404 }
      )
    }

    if (receipt.status !== 1) {
      return NextResponse.json(
        { error: 'Transaction failed on-chain' },
        { status: 400 }
      )
    }

    // Find PNCR Transfer event to treasury
    let depositAmount: bigint | null = null
    let senderAddress: string | null = null

    for (const log of receipt.logs) {
      // Check if this is a PNCR contract event
      if (log.address.toLowerCase() !== PNCR_ADDRESS.toLowerCase()) continue

      // Check if this is a Transfer event
      if (log.topics[0] !== TRANSFER_EVENT_TOPIC) continue

      // Decode the Transfer event
      const from = ethers.getAddress('0x' + log.topics[1].slice(26))
      const to = ethers.getAddress('0x' + log.topics[2].slice(26))
      const amount = BigInt(log.data)

      // Check if transfer is to treasury
      if (to.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
        depositAmount = amount
        senderAddress = from
        break
      }
    }

    if (!depositAmount || !senderAddress) {
      return NextResponse.json(
        { error: 'No PNCR transfer to treasury found in this transaction' },
        { status: 400 }
      )
    }

    const depositAmountFormatted = parseFloat(ethers.formatUnits(depositAmount, 18))

    // Update user's wallet address if not set
    if (!userWallet.address) {
      await prisma.userWallet.update({
        where: { id: userWallet.id },
        data: { address: senderAddress }
      })
    }

    // Verify sender matches user's wallet (optional security check)
    if (userWallet.address && userWallet.address.toLowerCase() !== senderAddress.toLowerCase()) {
      logger.warn('Deposit sender mismatch', {
        userId: session.user.id,
        expectedAddress: userWallet.address,
        actualAddress: senderAddress
      })
      // Still allow - user might use different address
    }

    // Credit balance in transaction
    await prisma.$transaction(async (tx) => {
      // Update balance
      await tx.userWallet.update({
        where: { id: userWallet!.id },
        data: { balance: { increment: depositAmountFormatted } }
      })

      // Create transaction record
      await tx.walletTransaction.create({
        data: {
          toWalletId: userWallet!.id,
          amount: depositAmountFormatted,
          txType: 'deposit',
          txHash: normalizedTxHash,
          status: 'confirmed',
          description: `On-chain deposit from ${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`
        }
      })
    })

    logger.info('Deposit verified and credited', {
      userId: session.user.id,
      txHash: normalizedTxHash,
      amount: depositAmountFormatted,
      from: senderAddress
    })

    return NextResponse.json({
      success: true,
      data: {
        status: 'verified',
        amount: depositAmountFormatted,
        from: senderAddress,
        txHash: normalizedTxHash,
        explorerUrl: `https://basescan.org/tx/${normalizedTxHash}`,
        message: `${depositAmountFormatted.toFixed(2)} PNCR has been credited to your account!`
      }
    })

  } catch (error) {
    logger.error('Deposit verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify deposit' },
      { status: 500 }
    )
  }
}
