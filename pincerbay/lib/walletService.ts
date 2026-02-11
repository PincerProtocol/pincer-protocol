import { ethers } from 'ethers'
import { PNCR_ADDRESS, PNCR_ABI } from './contracts/PNCR'
import { AGENT_WALLET_ADDRESS, AGENT_WALLET_ABI } from './contracts/AgentWallet'

const BASESCAN_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'

/**
 * Wallet Service - Core blockchain interaction layer
 * Handles both Agent Wallets (on-chain) and Human Wallets (custodial)
 */
export class WalletService {
  private provider: ethers.JsonRpcProvider
  private agentWalletContract: ethers.Contract
  private pncrContract: ethers.Contract

  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASESCAN_RPC)
    this.agentWalletContract = new ethers.Contract(
      AGENT_WALLET_ADDRESS,
      AGENT_WALLET_ABI,
      this.provider
    )
    this.pncrContract = new ethers.Contract(
      PNCR_ADDRESS,
      PNCR_ABI,
      this.provider
    )
  }

  // ============================================
  // Agent Wallet Functions (On-Chain)
  // ============================================

  /**
   * Get Agent Wallet ID from owner and agentId
   */
  async getAgentWalletId(ownerAddress: string, agentId: string): Promise<string> {
    try {
      const walletId = await this.agentWalletContract.getWalletId(ownerAddress, agentId)
      return walletId
    } catch (error) {
      console.error('Failed to get wallet ID:', error)
      throw new Error('Failed to get wallet ID')
    }
  }

  /**
   * Get Agent Wallet details
   */
  async getAgentWallet(walletId: string) {
    try {
      const wallet = await this.agentWalletContract.getWallet(walletId)
      
      return {
        owner: wallet.owner,
        agentId: wallet.agentId,
        balance: ethers.formatUnits(wallet.balance, 18),
        dailyLimit: ethers.formatUnits(wallet.dailyLimit, 18),
        spentToday: ethers.formatUnits(wallet.spentToday, 18),
        remainingToday: ethers.formatUnits(
          BigInt(wallet.dailyLimit) - BigInt(wallet.spentToday),
          18
        ),
        lastResetTime: Number(wallet.lastResetTime),
        whitelistEnabled: wallet.whitelistEnabled,
        active: wallet.active,
        totalSpent: ethers.formatUnits(wallet.totalSpent, 18),
        transactionCount: Number(wallet.transactionCount)
      }
    } catch (error) {
      console.error('Failed to get wallet:', error)
      throw new Error('Failed to get wallet')
    }
  }

  /**
   * Get all Agent Wallets owned by an address
   */
  async getAgentWalletsByOwner(ownerAddress: string): Promise<string[]> {
    try {
      const walletIds = await this.agentWalletContract.getWalletsByOwner(ownerAddress)
      return walletIds
    } catch (error) {
      console.error('Failed to get wallets by owner:', error)
      throw new Error('Failed to get wallets by owner')
    }
  }

  /**
   * Create new Agent Wallet (requires signer)
   */
  async createAgentWallet(
    signer: ethers.Signer,
    agentId: string,
    dailyLimit: string = '100'
  ) {
    try {
      const contract = this.agentWalletContract.connect(signer)
      const dailyLimitWei = ethers.parseUnits(dailyLimit, 18)
      
      const tx = await (contract as any).createWallet(agentId, dailyLimitWei, true)
      const receipt = await tx.wait()
      
      // Find WalletCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'WalletCreated'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsed = contract.interface.parseLog(event)
        return {
          walletId: parsed?.args.walletId,
          owner: parsed?.args.owner,
          agentId: parsed?.args.agentId,
          txHash: receipt.hash
        }
      }
      
      throw new Error('WalletCreated event not found')
    } catch (error) {
      console.error('Failed to create wallet:', error)
      throw new Error('Failed to create wallet')
    }
  }

  /**
   * Deposit PNCR to Agent Wallet
   */
  async depositToAgentWallet(
    signer: ethers.Signer,
    walletId: string,
    amount: string
  ) {
    try {
      const amountWei = ethers.parseUnits(amount, 18)
      
      // 1. Approve PNCR spending
      const pncrContract = this.pncrContract.connect(signer)
      const approveTx = await (pncrContract as any).approve(AGENT_WALLET_ADDRESS, amountWei)
      await approveTx.wait()
      
      // 2. Deposit to wallet
      const contract = this.agentWalletContract.connect(signer)
      const depositTx = await (contract as any).deposit(walletId, amountWei)
      const receipt = await depositTx.wait()
      
      return {
        txHash: receipt.hash,
        amount,
        status: 'completed'
      }
    } catch (error) {
      console.error('Failed to deposit:', error)
      throw new Error('Failed to deposit to wallet')
    }
  }

  /**
   * Transfer from Agent Wallet to address (requires operator/owner)
   */
  async agentTransfer(
    signer: ethers.Signer,
    walletId: string,
    to: string,
    amount: string,
    memo: string = ''
  ) {
    try {
      const contract = this.agentWalletContract.connect(signer)
      const amountWei = ethers.parseUnits(amount, 18)
      
      const tx = await (contract as any).agentTransfer(walletId, to, amountWei, memo)
      const receipt = await tx.wait()
      
      return {
        txHash: receipt.hash,
        from: walletId,
        to,
        amount,
        status: 'completed'
      }
    } catch (error) {
      console.error('Failed to transfer:', error)
      throw new Error('Failed to transfer from agent wallet')
    }
  }

  /**
   * Owner withdraw from Agent Wallet
   */
  async ownerWithdraw(
    signer: ethers.Signer,
    walletId: string,
    amount: string
  ) {
    try {
      const contract = this.agentWalletContract.connect(signer)
      const amountWei = ethers.parseUnits(amount, 18)
      
      const tx = await (contract as any).ownerWithdraw(walletId, amountWei)
      const receipt = await tx.wait()
      
      return {
        txHash: receipt.hash,
        amount,
        status: 'completed'
      }
    } catch (error) {
      console.error('Failed to withdraw:', error)
      throw new Error('Failed to withdraw from wallet')
    }
  }

  // ============================================
  // PNCR Token Functions
  // ============================================

  /**
   * Get PNCR balance of an address
   */
  async getPNCRBalance(address: string): Promise<string> {
    try {
      const balance = await this.pncrContract.balanceOf(address)
      return ethers.formatUnits(balance, 18)
    } catch (error) {
      console.error('Failed to get PNCR balance:', error)
      throw new Error('Failed to get PNCR balance')
    }
  }

  /**
   * Transfer PNCR tokens
   */
  async transferPNCR(
    signer: ethers.Signer,
    to: string,
    amount: string
  ) {
    try {
      const contract = this.pncrContract.connect(signer)
      const amountWei = ethers.parseUnits(amount, 18)
      
      const tx = await (contract as any).transfer(to, amountWei)
      const receipt = await tx.wait()
      
      return {
        txHash: receipt.hash,
        to,
        amount,
        status: 'completed'
      }
    } catch (error) {
      console.error('Failed to transfer PNCR:', error)
      throw new Error('Failed to transfer PNCR')
    }
  }

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Get signer from private key
   */
  getSigner(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.provider)
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address)
  }

  /**
   * Format amount to human readable
   */
  formatAmount(amount: string | bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals)
  }

  /**
   * Parse amount to wei
   */
  parseAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals)
  }

  // ============================================
  // Server-Side Agent Wallet Creation
  // ============================================

  /**
   * Create agent wallet on-chain (server-side)
   * Used during agent registration to create on-chain wallet
   * Returns wallet address or null if creation fails
   */
  async createAgentWalletOnChain(agentId: string, dailyLimit: string = '100'): Promise<string | null> {
    const privateKey = process.env.PLATFORM_PRIVATE_KEY

    if (!privateKey) {
      console.warn('PLATFORM_PRIVATE_KEY not set, wallet creation queued')
      return null
    }

    try {
      const signer = new ethers.Wallet(privateKey, this.provider)
      const dailyLimitWei = ethers.parseEther(dailyLimit)

      // Call createAgentWallet with the platform signer
      const result = await this.createAgentWallet(signer, agentId, dailyLimit)

      return result.walletId
    } catch (error) {
      console.error('Agent wallet creation failed:', error)
      return null
    }
  }
}

// Singleton instance
export const walletService = new WalletService()
