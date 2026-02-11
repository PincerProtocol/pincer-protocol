import { prisma } from './prisma'
import { logger } from './logger'
import { ethers } from 'ethers'
import { SIMPLE_ESCROW_ADDRESS, SIMPLE_ESCROW_ABI } from './contracts/SimpleEscrow'
import { PNCR_ADDRESS, PNCR_ABI } from './contracts/PNCR'

/**
 * Escrow Service - Complete escrow lifecycle management
 * Handles state transitions: created -> funded -> delivered -> completed
 *                                   \-> disputed -> resolved
 */
export class EscrowService {
  /**
   * Create new escrow record
   * Status: created
   */
  async createEscrow(data: {
    buyerId: string
    sellerId?: string
    sellerAgentId?: string
    buyerAgentId?: string
    listingId?: string
    postId?: string
    amount: string
    terms?: string
  }) {
    try {
      logger.info('Creating escrow', { buyerId: data.buyerId, amount: data.amount })

      const escrow = await prisma.escrow.create({
        data: {
          buyerId: data.buyerId,
          sellerAgentId: data.sellerAgentId,
          buyerAgentId: data.buyerAgentId,
          listingId: data.listingId,
          postId: data.postId,
          amount: parseFloat(data.amount),
          currency: 'PNCR',
          status: 'created',
          createdAt: new Date()
        },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        }
      })

      logger.info('Escrow created', { escrowId: escrow.id })
      return escrow
    } catch (error) {
      logger.error('Failed to create escrow', { error })
      throw new Error('Failed to create escrow')
    }
  }

  /**
   * Fund escrow (deposit PNCR)
   * Status: created -> funded
   */
  async fundEscrow(escrowId: string, txHash: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
        include: { sellerAgent: true }
      })

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      if (escrow.status !== 'created') {
        throw new Error(`Invalid state transition: cannot fund escrow with status '${escrow.status}'`)
      }

      logger.info('Funding escrow', { escrowId, txHash })

      const updated = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'funded',
          txHashFund: txHash,
          updatedAt: new Date()
        },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        }
      })

      logger.info('Escrow funded', { escrowId, txHash })
      return updated
    } catch (error) {
      logger.error('Failed to fund escrow', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to fund escrow')
    }
  }

  /**
   * Mark work as delivered
   * Status: funded -> delivered
   */
  async markDelivered(escrowId: string) {
    try {
      const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } })

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      if (escrow.status !== 'funded') {
        throw new Error(`Invalid state transition: cannot mark delivered for escrow with status '${escrow.status}'`)
      }

      logger.info('Marking escrow as delivered', { escrowId })

      const updated = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'delivered',
          updatedAt: new Date()
        },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        }
      })

      logger.info('Escrow marked as delivered', { escrowId })
      return updated
    } catch (error) {
      logger.error('Failed to mark escrow as delivered', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to mark escrow as delivered')
    }
  }

  /**
   * Release funds to seller
   * Status: funded|delivered -> completed
   * Updates seller agent's totalEarnings and tasksCompleted
   */
  async releaseEscrow(escrowId: string, txHash?: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
        include: { sellerAgent: true }
      })

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      // Can release from 'funded' or 'delivered' state
      if (escrow.status !== 'funded' && escrow.status !== 'delivered') {
        throw new Error(`Invalid state transition: cannot release escrow with status '${escrow.status}'`)
      }

      logger.info('Releasing escrow funds', { escrowId, sellerId: escrow.sellerAgentId, amount: escrow.amount })

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update escrow status
        const updated = await tx.escrow.update({
          where: { id: escrowId },
          data: {
            status: 'completed',
            txHashRelease: txHash,
            updatedAt: new Date()
          },
          include: {
            listing: true,
            post: true,
            sellerAgent: true,
            buyerAgent: true
          }
        })

        // Update seller agent's metrics if seller is an agent
        if (escrow.sellerAgentId) {
          await tx.agent.update({
            where: { id: escrow.sellerAgentId },
            data: {
              totalEarnings: { increment: escrow.amount },
              tasksCompleted: { increment: 1 },
              updatedAt: new Date()
            }
          })

          logger.info('Seller agent metrics updated', {
            agentId: escrow.sellerAgentId,
            earnings: escrow.amount,
            tasksCompleted: 1
          })
        }

        return updated
      })

      logger.info('Escrow funds released', { escrowId, txHash })

      // Note: Power score recalculation will be triggered by Phase 1 powerScore service
      // when it's implemented. For now, we just update the raw metrics.

      return result
    } catch (error) {
      logger.error('Failed to release escrow', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to release escrow')
    }
  }

  /**
   * Dispute escrow
   * Status: funded|delivered -> disputed
   */
  async disputeEscrow(escrowId: string, disputeReason: string, disputedBy: string) {
    try {
      const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } })

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      // Can dispute from 'funded' or 'delivered' state
      if (escrow.status !== 'funded' && escrow.status !== 'delivered') {
        throw new Error(`Invalid state transition: cannot dispute escrow with status '${escrow.status}'`)
      }

      logger.info('Disputing escrow', { escrowId, disputedBy, reason: disputeReason })

      const updated = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'disputed',
          updatedAt: new Date()
          // Note: disputeReason field doesn't exist in schema yet
          // Add this in a future migration if needed
        },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        }
      })

      logger.info('Escrow disputed', { escrowId })

      // TODO: Create dispute record in a future DisputeResolution table
      // TODO: Send notifications to both parties

      return updated
    } catch (error) {
      logger.error('Failed to dispute escrow', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to dispute escrow')
    }
  }

  /**
   * Get escrow by ID
   */
  async getEscrow(escrowId: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
        include: {
          listing: true,
          post: true,
          sellerAgent: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          buyerAgent: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      return escrow
    } catch (error) {
      logger.error('Failed to get escrow', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to get escrow')
    }
  }

  /**
   * Get escrows by buyer
   */
  async getEscrowsByBuyer(buyerId: string) {
    try {
      const escrows = await prisma.escrow.findMany({
        where: { buyerId },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return escrows
    } catch (error) {
      logger.error('Failed to get escrows by buyer', { buyerId, error })
      throw new Error('Failed to get escrows by buyer')
    }
  }

  /**
   * Get escrows by seller agent
   */
  async getEscrowsBySellerAgent(sellerAgentId: string) {
    try {
      const escrows = await prisma.escrow.findMany({
        where: { sellerAgentId },
        include: {
          listing: true,
          post: true,
          sellerAgent: true,
          buyerAgent: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return escrows
    } catch (error) {
      logger.error('Failed to get escrows by seller', { sellerAgentId, error })
      throw new Error('Failed to get escrows by seller')
    }
  }

  /**
   * Validate state transition
   */
  private validateStateTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'created': ['funded'],
      'funded': ['delivered', 'completed', 'disputed'],
      'delivered': ['completed', 'disputed'],
      'disputed': ['refunded', 'completed'],
      'completed': [],
      'refunded': []
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  // ============================================
  // On-Chain Integration Methods
  // ============================================

  /**
   * Fund escrow on-chain via SimpleEscrow contract
   * @param escrowId - Database escrow ID (used as reference, not on-chain txId)
   * @param buyerSigner - Buyer's ethers signer (wallet with private key)
   * @param amount - Amount of PNCR to deposit (in PNCR units, e.g., "100")
   * @returns Transaction hash and on-chain txId
   *
   * Prerequisites:
   * - Buyer must have sufficient PNCR balance
   * - Buyer must approve PNCR spending to SimpleEscrow contract
   * - SimpleEscrow contract must be deployed (not 0x000...000)
   */
  async fundEscrowOnChain(
    escrowId: string,
    buyerSigner: ethers.Signer,
    sellerAddress: string,
    amount: string
  ): Promise<{ txHash: string; onChainTxId: string }> {
    try {
      // Check if contract is deployed
      if (!SIMPLE_ESCROW_ADDRESS || SIMPLE_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('SimpleEscrow contract not deployed. Set SIMPLE_ESCROW_CONTRACT_ADDRESS environment variable.')
      }

      const amountWei = ethers.parseUnits(amount, 18)

      logger.info('Funding escrow on-chain', {
        escrowId,
        sellerAddress,
        amount,
        contractAddress: SIMPLE_ESCROW_ADDRESS
      })

      // 1. Approve PNCR spending to SimpleEscrow contract
      const pncrContract = new ethers.Contract(PNCR_ADDRESS, PNCR_ABI, buyerSigner)
      const approveTx = await pncrContract.approve(SIMPLE_ESCROW_ADDRESS, amountWei)
      logger.info('PNCR approval sent', { txHash: approveTx.hash })
      await approveTx.wait()
      logger.info('PNCR approval confirmed', { txHash: approveTx.hash })

      // 2. Create escrow on-chain
      const escrowContract = new ethers.Contract(SIMPLE_ESCROW_ADDRESS, SIMPLE_ESCROW_ABI, buyerSigner)
      const createTx = await escrowContract.createEscrow(sellerAddress, amountWei)
      logger.info('Escrow creation sent', { txHash: createTx.hash })
      const receipt = await createTx.wait()
      logger.info('Escrow creation confirmed', { txHash: receipt.hash })

      // 3. Extract on-chain txId from EscrowCreated event
      const escrowCreatedEvent = receipt.logs
        .map((log: any) => {
          try {
            return escrowContract.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((parsed: any) => parsed?.name === 'EscrowCreated')

      if (!escrowCreatedEvent) {
        throw new Error('EscrowCreated event not found in transaction receipt')
      }

      const onChainTxId = escrowCreatedEvent.args.txId.toString()

      logger.info('Escrow funded on-chain', {
        escrowId,
        txHash: receipt.hash,
        onChainTxId
      })

      return {
        txHash: receipt.hash,
        onChainTxId
      }
    } catch (error) {
      logger.error('Failed to fund escrow on-chain', { escrowId, error })
      throw error instanceof Error ? error : new Error('Failed to fund escrow on-chain')
    }
  }

  /**
   * Release escrow on-chain via SimpleEscrow contract
   * @param onChainTxId - On-chain transaction ID (from SimpleEscrow contract)
   * @param buyerSigner - Buyer's ethers signer (buyer must confirm delivery)
   * @returns Transaction hash
   *
   * Prerequisites:
   * - Escrow must be in 'funded' state on-chain (status = 0)
   * - Only buyer can confirm delivery and release funds
   * - SimpleEscrow contract must be deployed (not 0x000...000)
   */
  async releaseEscrowOnChain(
    onChainTxId: string,
    buyerSigner: ethers.Signer
  ): Promise<{ txHash: string }> {
    try {
      // Check if contract is deployed
      if (!SIMPLE_ESCROW_ADDRESS || SIMPLE_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('SimpleEscrow contract not deployed. Set SIMPLE_ESCROW_CONTRACT_ADDRESS environment variable.')
      }

      logger.info('Releasing escrow on-chain', {
        onChainTxId,
        contractAddress: SIMPLE_ESCROW_ADDRESS
      })

      // Call confirmDelivery on SimpleEscrow contract
      const escrowContract = new ethers.Contract(SIMPLE_ESCROW_ADDRESS, SIMPLE_ESCROW_ABI, buyerSigner)
      const releaseTx = await escrowContract.confirmDelivery(onChainTxId)
      logger.info('Escrow release sent', { txHash: releaseTx.hash })
      const receipt = await releaseTx.wait()
      logger.info('Escrow release confirmed', { txHash: receipt.hash })

      return {
        txHash: receipt.hash
      }
    } catch (error) {
      logger.error('Failed to release escrow on-chain', { onChainTxId, error })
      throw error instanceof Error ? error : new Error('Failed to release escrow on-chain')
    }
  }

  /**
   * Get on-chain escrow status
   * @param onChainTxId - On-chain transaction ID
   * @returns On-chain escrow details
   */
  async getOnChainEscrow(onChainTxId: string): Promise<any> {
    try {
      if (!SIMPLE_ESCROW_ADDRESS || SIMPLE_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('SimpleEscrow contract not deployed')
      }

      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
      const escrowContract = new ethers.Contract(SIMPLE_ESCROW_ADDRESS, SIMPLE_ESCROW_ABI, provider)

      const transaction = await escrowContract.getTransaction(onChainTxId)

      return {
        id: transaction.id.toString(),
        buyer: transaction.buyer,
        seller: transaction.seller,
        amount: ethers.formatUnits(transaction.amount, 18),
        fee: ethers.formatUnits(transaction.fee, 18),
        status: transaction.status,
        createdAt: Number(transaction.createdAt),
        expiresAt: Number(transaction.expiresAt),
        sellerClaimed: transaction.sellerClaimed,
        sellerClaimTime: Number(transaction.sellerClaimTime)
      }
    } catch (error) {
      logger.error('Failed to get on-chain escrow', { onChainTxId, error })
      throw error instanceof Error ? error : new Error('Failed to get on-chain escrow')
    }
  }
}

// Singleton instance
export const escrowService = new EscrowService()
