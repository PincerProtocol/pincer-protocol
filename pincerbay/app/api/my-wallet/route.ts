import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { walletService } from '@/lib/walletService'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET /api/my-wallet
 * Logged-in user's wallet information with real on-chain PNCR balances
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     needsWallet?: boolean,
 *     userWallet?: { id, userId, address, type, balance },
 *     agentWallets?: Array<{ id, agentId, address, balance, agent: { id, name } }>,
 *     totalBalance?: string
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get UserWallet by userId
    let userWallet = await prisma.userWallet.findUnique({
      where: { userId: session.user.id }
    })

    // 2. If no wallet, return needsWallet flag
    if (!userWallet) {
      return NextResponse.json({
        success: true,
        data: { needsWallet: true }
      })
    }

    // 3. Get real on-chain balance via walletService
    let onChainBalance = '0'
    try {
      onChainBalance = await walletService.getPNCRBalance(userWallet.address)
    } catch (error) {
      // 4. If RPC fails, use cached DB balance
      logger.warn('RPC unavailable, using cached balance', { error })
      onChainBalance = userWallet.balance.toString()
    }

    // 5. Update cached balance in DB
    await prisma.userWallet.update({
      where: { id: userWallet.id },
      data: { balance: parseFloat(onChainBalance) }
    })

    // 6. Get agent wallets owned by this user
    const agentWallets = await prisma.agentWallet.findMany({
      where: { agent: { ownerId: session.user.id } },
      include: { agent: { select: { id: true, name: true } } }
    })

    // 7. Get on-chain balance for each agent wallet
    const agentWalletsWithBalance = await Promise.all(
      agentWallets.map(async (wallet) => {
        if (!wallet.address) {
          return { ...wallet, balance: wallet.balance }
        }

        try {
          const balance = await walletService.getPNCRBalance(wallet.address)
          await prisma.agentWallet.update({
            where: { id: wallet.id },
            data: { balance: parseFloat(balance) }
          })
          return { ...wallet, balance: parseFloat(balance) }
        } catch (error) {
          logger.warn(`Failed to fetch balance for agent wallet ${wallet.id}, using cached`, { error })
          return { ...wallet, balance: wallet.balance }
        }
      })
    )

    // 8. Return aggregated response
    const totalBalance = (
      parseFloat(onChainBalance) +
      agentWalletsWithBalance.reduce((sum, w) => sum + parseFloat(w.balance.toString()), 0)
    ).toFixed(4)

    return NextResponse.json({
      success: true,
      data: {
        userWallet: {
          ...userWallet,
          balance: parseFloat(onChainBalance)
        },
        agentWallets: agentWalletsWithBalance,
        totalBalance
      }
    })
  } catch (error) {
    logger.error('GET /api/my-wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/my-wallet
 * Link an existing wallet to the logged-in user
 *
 * Request:
 * {
 *   address: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address } = body

    // Validate address format
    if (!address || !walletService.isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Check if address is already linked to another user
    const existingWallet = await prisma.userWallet.findUnique({
      where: { address }
    })

    if (existingWallet && existingWallet.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Address already linked to another user' },
        { status: 409 }
      )
    }

    // Create or update UserWallet
    const userWallet = await prisma.userWallet.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        address,
        balance: 0,
        type: 'connected'
      },
      update: {
        address,
        type: 'connected'
      }
    })

    return NextResponse.json({
      success: true,
      data: userWallet
    })
  } catch (error) {
    logger.error('POST /api/my-wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to link wallet' },
      { status: 500 }
    )
  }
}
