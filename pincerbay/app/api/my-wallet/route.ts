import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { walletService } from '@/lib/walletService'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { ethers } from 'ethers'

const prisma = new PrismaClient()

/**
 * GET /api/my-wallet
 * 로그인 사용자의 Human Wallet 정보
 * 
 * Response:
 * {
 *   address: string,
 *   balance: string,
 *   agents: Array<{
 *     agentId: string,
 *     agentName: string,
 *     walletId: string,
 *     balance: string,
 *     dailyLimit: string,
 *     active: boolean
 *   }>
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // In a real implementation, you would:
    // 1. Look up the user's custodial wallet from database
    // 2. Decrypt the private key to get the address
    // 3. Or store the address directly in the database
    
    // For now, we'll use the user's Ethereum address if available
    // @ts-ignore - session.user might have an address field
    const userAddress = session.user.address || session.user.email
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User wallet not found. Please connect a wallet.' },
        { status: 404 }
      )
    }

    // Validate address format
    let walletAddress = userAddress
    if (!walletService.isValidAddress(userAddress)) {
      // If not a valid address, try to look up from database
      // This would be where you'd look up custodial wallet
      return NextResponse.json(
        { error: 'Invalid wallet address. Please connect a wallet.' },
        { status: 400 }
      )
    }

    // Get user's PNCR balance
    const balance = await walletService.getPNCRBalance(walletAddress)

    // Get all agent wallets owned by this user
    const agentWalletIds = await walletService.getAgentWalletsByOwner(walletAddress)
    
    const agents = await Promise.all(
      agentWalletIds.map(async (walletId) => {
        try {
          const wallet = await walletService.getAgentWallet(walletId)
          
          // Get agent metadata from database
          const agentWallet = await prisma.agentWallet.findFirst({
            where: { agentId: wallet.agentId }
          })
          
          return {
            agentId: wallet.agentId,
            agentName: agentWallet?.agentName || wallet.agentId,
            walletId,
            balance: wallet.balance,
            dailyLimit: wallet.dailyLimit,
            remainingToday: wallet.remainingToday,
            active: wallet.active,
            transactionCount: wallet.transactionCount
          }
        } catch (error) {
          console.error(`Failed to get wallet ${walletId}:`, error)
          return null
        }
      })
    )

    // Filter out failed fetches
    const validAgents = agents.filter(agent => agent !== null)

    // Calculate total balance across all wallets
    const totalAgentBalance = validAgents.reduce(
      (sum, agent) => sum + parseFloat(agent!.balance),
      0
    )
    const totalBalance = (parseFloat(balance) + totalAgentBalance).toFixed(4)

    return NextResponse.json({
      address: walletAddress,
      balance,
      totalBalance,
      agents: validAgents,
      agentCount: validAgents.length
    })
  } catch (error) {
    console.error('GET /api/my-wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/my-wallet
 * Create or link a wallet for the logged-in user
 * 
 * Request:
 * {
 *   address?: string (to link existing wallet)
 *   createNew?: boolean (to create custodial wallet)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address, createNew } = body

    if (address) {
      // Link existing wallet
      if (!walletService.isValidAddress(address)) {
        return NextResponse.json(
          { error: 'Invalid Ethereum address' },
          { status: 400 }
        )
      }

      // In production, you would:
      // 1. Verify ownership of the address (signature challenge)
      // 2. Store the address in the user's profile
      // 3. Return the linked wallet info

      return NextResponse.json({
        success: true,
        message: 'Wallet linked successfully',
        address
      })
    } else if (createNew) {
      // Create new custodial wallet
      // This is a simplified version - in production you would:
      // 1. Generate a new wallet using ethers.Wallet.createRandom()
      // 2. Encrypt the private key with AES-256
      // 3. Store encrypted key in database
      // 4. Return only the address

      const newWallet = walletService.getSigner(
        ethers.Wallet.createRandom().privateKey
      )
      const newAddress = await newWallet.getAddress()

      // TODO: Store encrypted private key in database
      // await prisma.humanWallet.create({
      //   data: {
      //     userId: session.user.id,
      //     address: newAddress,
      //     encryptedPrivateKey: encryptedKey,
      //     provider: 'custodial'
      //   }
      // })

      return NextResponse.json({
        success: true,
        message: 'Custodial wallet created',
        address: newAddress,
        warning: 'This is a demo. In production, the private key would be securely encrypted and stored.'
      })
    } else {
      return NextResponse.json(
        { error: 'Either address or createNew must be provided' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('POST /api/my-wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to create/link wallet' },
      { status: 500 }
    )
  }
}
