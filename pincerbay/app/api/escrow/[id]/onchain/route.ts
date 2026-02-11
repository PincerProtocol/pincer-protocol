import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { escrowService } from '@/lib/escrowService'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { SIMPLE_ESCROW_ADDRESS } from '@/lib/contracts/SimpleEscrow'

/**
 * GET /api/escrow/[id]/onchain
 * Get on-chain escrow status (if linked to on-chain escrow)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: escrowId } = await params

    // Get escrow from DB
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      select: {
        id: true,
        status: true,
        amount: true,
        txHashFund: true,
        txHashRelease: true,
        buyerId: true,
        sellerAgentId: true
      }
    })

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    // Check if user is buyer or seller
    const sellerAgent = escrow.sellerAgentId
      ? await prisma.agent.findUnique({
          where: { id: escrow.sellerAgentId },
          select: { ownerId: true }
        })
      : null

    if (escrow.buyerId !== session.user.id && sellerAgent?.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if on-chain integration is enabled
    const isOnChainEnabled = SIMPLE_ESCROW_ADDRESS && 
      SIMPLE_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000'

    if (!isOnChainEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          onChainEnabled: false,
          message: 'On-chain escrow not configured. Using internal balance.',
          dbStatus: escrow.status
        }
      })
    }

    // Try to get on-chain status if we have an on-chain txId
    // The on-chain txId would be stored somewhere (e.g., in txHashFund with a prefix)
    // For now, return the DB status
    return NextResponse.json({
      success: true,
      data: {
        onChainEnabled: true,
        contractAddress: SIMPLE_ESCROW_ADDRESS,
        dbStatus: escrow.status,
        amount: escrow.amount,
        fundTxHash: escrow.txHashFund,
        releaseTxHash: escrow.txHashRelease,
        explorerUrl: escrow.txHashFund?.startsWith('0x') 
          ? `https://basescan.org/tx/${escrow.txHashFund}` 
          : null
      }
    })

  } catch (error) {
    logger.error('Error fetching on-chain escrow status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escrow status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/escrow/[id]/onchain
 * Create on-chain escrow from existing DB escrow
 * 
 * This requires the buyer to sign the transaction client-side.
 * The client should:
 * 1. Call this endpoint to get escrow details
 * 2. Use wagmi/ethers to create the escrow on-chain
 * 3. Call /api/escrow/[id]/fund with the txHash
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: escrowId } = await params

    // Get escrow
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        sellerAgent: {
          include: {
            wallet: true
          }
        }
      }
    })

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    // Verify buyer
    if (escrow.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only buyer can create on-chain escrow' }, { status: 403 })
    }

    // Verify escrow status
    if (escrow.status !== 'created') {
      return NextResponse.json(
        { error: `Cannot create on-chain escrow for status '${escrow.status}'` },
        { status: 400 }
      )
    }

    // Check if on-chain is enabled
    const isOnChainEnabled = SIMPLE_ESCROW_ADDRESS && 
      SIMPLE_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000'

    if (!isOnChainEnabled) {
      return NextResponse.json(
        { error: 'On-chain escrow not configured' },
        { status: 400 }
      )
    }

    // Get seller address
    const sellerAddress = escrow.sellerAgent?.wallet?.address

    if (!sellerAddress) {
      return NextResponse.json(
        { error: 'Seller agent wallet not configured' },
        { status: 400 }
      )
    }

    // Return details for client-side transaction
    return NextResponse.json({
      success: true,
      data: {
        escrowId: escrow.id,
        contractAddress: SIMPLE_ESCROW_ADDRESS,
        sellerAddress,
        amount: escrow.amount.toString(),
        pncrAddress: process.env.NEXT_PUBLIC_PNCR_TOKEN_ADDRESS,
        chainId: 8453, // Base mainnet
        instructions: [
          '1. Approve PNCR spending to escrow contract',
          '2. Call createEscrow(sellerAddress, amount)',
          '3. Submit the txHash to /api/escrow/[id]/fund'
        ]
      }
    })

  } catch (error) {
    logger.error('Error creating on-chain escrow:', error)
    return NextResponse.json(
      { error: 'Failed to create on-chain escrow' },
      { status: 500 }
    )
  }
}
