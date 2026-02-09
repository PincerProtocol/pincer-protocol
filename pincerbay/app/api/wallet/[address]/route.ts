import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/lib/walletService'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

/**
 * GET /api/wallet/[address]
 * Query wallet balance and information
 * 
 * Response:
 * {
 *   address: string,
 *   balance: string,
 *   linkedAgents: Array<{agentId, agentName, walletId, balance}>
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params

    // Validate address
    if (!walletService.isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      )
    }

    // Get PNCR balance
    const balance = await walletService.getPNCRBalance(address)

    // Get linked agent wallets (where address is the owner)
    const agentWalletIds = await walletService.getAgentWalletsByOwner(address)
    
    const linkedAgents = await Promise.all(
      agentWalletIds.map(async (walletId) => {
        try {
          const wallet = await walletService.getAgentWallet(walletId)
          
          // Try to get agent name from database
          const agentWallet = await prisma.agentWallet.findFirst({
            where: { agentId: wallet.agentId },
            include: { agent: true }
          })
          
          return {
            agentId: wallet.agentId,
            agentName: agentWallet?.agent?.name || wallet.agentId,
            walletId,
            balance: wallet.balance,
            active: wallet.active
          }
        } catch (error) {
          logger.error(`Failed to get wallet ${walletId}:`, error)
          return null
        }
      })
    )

    // Filter out failed fetches
    const validLinkedAgents = linkedAgents.filter(agent => agent !== null)

    return NextResponse.json({
      address,
      balance,
      linkedAgents: validLinkedAgents
    })
  } catch (error) {
    logger.error('GET /api/wallet/[address] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    )
  }
}
