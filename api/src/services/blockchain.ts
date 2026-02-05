import { ethers, Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from 'ethers';
import { config, PNCR_TOKEN_ABI, ESCROW_ABI, EscrowStatus } from '../config';
import logger from '../utils/logger';

export interface EscrowData {
  id: number;
  buyer: string;
  seller: string;
  amount: string;
  fee: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  escrowId?: number;
  error?: string;
}

class BlockchainService {
  private provider: JsonRpcProvider;
  private tokenContract: Contract;
  private escrowContract: Contract;
  private wallet: Wallet | null = null;

  constructor() {
    this.provider = new JsonRpcProvider(config.rpcUrl);
    this.tokenContract = new Contract(config.pncrTokenAddress, PNCR_TOKEN_ABI, this.provider);
    this.escrowContract = new Contract(config.escrowAddress, ESCROW_ABI, this.provider);

    if (config.privateKey) {
      this.wallet = new Wallet(config.privateKey, this.provider);
    }
  }

  private getSignedTokenContract(): Contract {
    if (!this.wallet) throw new Error('Wallet not configured');
    return new Contract(config.pncrTokenAddress, PNCR_TOKEN_ABI, this.wallet);
  }

  private getSignedEscrowContract(): Contract {
    if (!this.wallet) throw new Error('Wallet not configured');
    return new Contract(config.escrowAddress, ESCROW_ABI, this.wallet);
  }

  private statusToString(status: number): string {
    switch (status) {
      case EscrowStatus.PENDING: return 'PENDING';
      case EscrowStatus.COMPLETED: return 'COMPLETED';
      case EscrowStatus.CANCELLED: return 'CANCELLED';
      case 3: return 'DISPUTED'; // DISPUTED status
      default: return 'UNKNOWN';
    }
  }

  async getBalance(address: string): Promise<{ balance: string; formatted: string }> {
    try {
      if (!ethers.isAddress(address)) {
        logger.error(`Invalid address format: ${address}`);
        throw new Error('Invalid Ethereum address format');
      }

      const balance = await this.tokenContract.balanceOf(address);
      const decimals = await this.tokenContract.decimals();
      
      logger.debug(`Balance fetched for ${address}: ${formatUnits(balance, decimals)}`);
      
      return {
        balance: balance.toString(),
        formatted: formatUnits(balance, decimals),
      };
    } catch (error: any) {
      logger.error(`Failed to get balance for ${address}:`, error);
      
      if (error.message?.includes('Invalid')) {
        throw error;
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        throw new Error('Network connection failed. Please try again later.');
      }
      throw new Error('Failed to fetch balance. Please check the address and try again.');
    }
  }

  async getTokenInfo(): Promise<{ symbol: string; decimals: number }> {
    const [symbol, decimals] = await Promise.all([
      this.tokenContract.symbol(),
      this.tokenContract.decimals(),
    ]);
    return { symbol, decimals: Number(decimals) };
  }

  async createEscrow(
    seller: string,
    amount: string,
    _memo?: string // memo not supported in current contract
  ): Promise<TransactionResult> {
    try {
      // 입력 검증
      if (!ethers.isAddress(seller)) {
        logger.error(`Invalid seller address: ${seller}`);
        return { success: false, error: 'Invalid seller address format' };
      }

      const signedToken = this.getSignedTokenContract();
      const signedEscrow = this.getSignedEscrowContract();

      const decimals = await this.tokenContract.decimals();
      let amountWei: bigint;
      
      try {
        amountWei = parseUnits(amount, decimals);
      } catch (error) {
        logger.error(`Invalid amount format: ${amount}`);
        return { success: false, error: 'Invalid amount format' };
      }

      if (amountWei <= 0n) {
        logger.error(`Amount must be positive: ${amount}`);
        return { success: false, error: 'Amount must be greater than zero' };
      }

      // Check balance
      const balance = await this.tokenContract.balanceOf(this.wallet!.address);
      if (balance < amountWei) {
        logger.warn(`Insufficient balance: ${formatUnits(balance, decimals)} < ${amount}`);
        return { success: false, error: 'Insufficient token balance' };
      }

      // Check allowance
      const allowance = await this.tokenContract.allowance(this.wallet!.address, config.escrowAddress);
      if (allowance < amountWei) {
        logger.info(`Approving tokens: ${amount}`);
        const approveTx = await signedToken.approve(config.escrowAddress, amountWei);
        await approveTx.wait();
        logger.info(`Approval confirmed: ${approveTx.hash}`);
      }

      // Create escrow
      logger.info(`Creating escrow: seller=${seller}, amount=${amount}`);
      const tx = await signedEscrow.createEscrow(seller, amountWei);
      const receipt = await tx.wait();

      // Parse escrow ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = signedEscrow.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch { return false; }
      });

      let escrowId: number | undefined;
      if (event) {
        const parsed = signedEscrow.interface.parseLog(event);
        escrowId = Number(parsed?.args.txId);
      }

      logger.info(`Escrow created successfully: txHash=${receipt.hash}, escrowId=${escrowId}`);
      return { success: true, txHash: receipt.hash, escrowId };
    } catch (error: any) {
      logger.error('Failed to create escrow:', error);

      // 구체적인 에러 타입별 처리
      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed. Please try again.' };
      }
      if (error.message?.includes('user rejected')) {
        return { success: false, error: 'Transaction rejected by user' };
      }
      if (error.message?.includes('revert')) {
        // 컨트랙트에서 revert된 경우
        const reason = error.reason || error.message;
        logger.error(`Transaction reverted: ${reason}`);
        return { success: false, error: `Transaction failed: ${reason}` };
      }

      return { success: false, error: error.message || 'Failed to create escrow' };
    }
  }

  async getEscrow(escrowId: number): Promise<EscrowData | null> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID: ${escrowId}`);
        return null;
      }

      const txn = await this.escrowContract.getTransaction(escrowId);
      const decimals = await this.tokenContract.decimals();

      // Check if transaction exists (id will be 0 for non-existent)
      if (Number(txn.id) === 0) {
        logger.debug(`Escrow not found: ${escrowId}`);
        return null;
      }

      logger.debug(`Escrow fetched: ${escrowId}, status=${this.statusToString(Number(txn.status))}`);

      return {
        id: Number(txn.id),
        buyer: txn.buyer,
        seller: txn.seller,
        amount: formatUnits(txn.amount, decimals),
        fee: formatUnits(txn.fee, decimals),
        status: this.statusToString(Number(txn.status)),
        createdAt: new Date(Number(txn.createdAt) * 1000),
        expiresAt: new Date(Number(txn.expiresAt) * 1000),
      };
    } catch (error: any) {
      logger.error(`Failed to get escrow ${escrowId}:`, error);
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        logger.error('Network error while fetching escrow');
      }
      
      return null;
    }
  }

  async confirmEscrow(escrowId: number): Promise<TransactionResult> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for confirmation: ${escrowId}`);
        return { success: false, error: 'Invalid escrow ID' };
      }

      logger.info(`Confirming escrow: ${escrowId}`);
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.confirmDelivery(escrowId);
      const receipt = await tx.wait();
      
      logger.info(`Escrow confirmed successfully: ${escrowId}, txHash=${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      logger.error(`Failed to confirm escrow ${escrowId}:`, error);

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.message?.includes('revert')) {
        const reason = error.reason || 'Transaction reverted by contract';
        return { success: false, error: reason };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed' };
      }

      return { success: false, error: error.message || 'Failed to confirm escrow' };
    }
  }

  async cancelEscrow(escrowId: number): Promise<TransactionResult> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for cancellation: ${escrowId}`);
        return { success: false, error: 'Invalid escrow ID' };
      }

      logger.info(`Cancelling escrow: ${escrowId}`);
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.cancelEscrow(escrowId);
      const receipt = await tx.wait();
      
      logger.info(`Escrow cancelled successfully: ${escrowId}, txHash=${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      logger.error(`Failed to cancel escrow ${escrowId}:`, error);

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.message?.includes('revert')) {
        const reason = error.reason || 'Transaction reverted by contract';
        return { success: false, error: reason };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed' };
      }

      return { success: false, error: error.message || 'Failed to cancel escrow' };
    }
  }

  async getAgentHistory(address: string): Promise<EscrowData[]> {
    try {
      if (!ethers.isAddress(address)) {
        logger.error(`Invalid address format for history: ${address}`);
        throw new Error('Invalid Ethereum address format');
      }

      const history: EscrowData[] = [];
      const counter = await this.escrowContract.transactionCount();
      const decimals = await this.tokenContract.decimals();

      logger.debug(`Fetching history for ${address}, total transactions: ${counter}`);

      // Scan all escrows (in production, use events/indexer)
      for (let i = 1; i <= Number(counter); i++) {
        try {
          const txn = await this.escrowContract.getTransaction(i);
          if (
            txn.buyer.toLowerCase() === address.toLowerCase() ||
            txn.seller.toLowerCase() === address.toLowerCase()
          ) {
            history.push({
              id: Number(txn.id),
              buyer: txn.buyer,
              seller: txn.seller,
              amount: formatUnits(txn.amount, decimals),
              fee: formatUnits(txn.fee, decimals),
              status: this.statusToString(Number(txn.status)),
              createdAt: new Date(Number(txn.createdAt) * 1000),
              expiresAt: new Date(Number(txn.expiresAt) * 1000),
            });
          }
        } catch (error) {
          logger.warn(`Failed to fetch transaction ${i}, skipping`);
          continue;
        }
      }

      logger.info(`Fetched ${history.length} transactions for ${address}`);
      return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      logger.error(`Failed to get agent history for ${address}:`, error);

      if (error.message?.includes('Invalid')) {
        throw error;
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        throw new Error('Network connection failed. Please try again later.');
      }
      throw new Error('Failed to fetch transaction history');
    }
  }

  async getContractInfo(): Promise<{
    feeRate: number;
    escrowDuration: number;
    transactionCount: number;
  }> {
    const [feeRate, escrowDuration, transactionCount] = await Promise.all([
      this.escrowContract.feeRate(),
      this.escrowContract.DEFAULT_ESCROW_DURATION(),
      this.escrowContract.transactionCount(),
    ]);
    return {
      feeRate: Number(feeRate),
      escrowDuration: Number(escrowDuration),
      transactionCount: Number(transactionCount),
    };
  }

  // New seller protection methods

  async submitDeliveryProof(escrowId: number): Promise<TransactionResult> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for delivery proof: ${escrowId}`);
        return { success: false, error: 'Invalid escrow ID' };
      }

      logger.info(`Submitting delivery proof for escrow: ${escrowId}`);
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.submitDeliveryProof(escrowId);
      const receipt = await tx.wait();
      
      logger.info(`Delivery proof submitted: ${escrowId}, txHash=${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      logger.error(`Failed to submit delivery proof ${escrowId}:`, error);

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.message?.includes('revert')) {
        const reason = error.reason || 'Transaction reverted by contract';
        return { success: false, error: reason };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed' };
      }

      return { success: false, error: error.message || 'Failed to submit delivery proof' };
    }
  }

  async autoComplete(escrowId: number): Promise<TransactionResult> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for auto-complete: ${escrowId}`);
        return { success: false, error: 'Invalid escrow ID' };
      }

      logger.info(`Auto-completing escrow: ${escrowId}`);
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.autoComplete(escrowId);
      const receipt = await tx.wait();
      
      logger.info(`Escrow auto-completed: ${escrowId}, txHash=${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      logger.error(`Failed to auto-complete escrow ${escrowId}:`, error);

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.message?.includes('revert')) {
        const reason = error.reason || 'Transaction reverted by contract';
        return { success: false, error: reason };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed' };
      }

      return { success: false, error: error.message || 'Failed to auto-complete escrow' };
    }
  }

  async openDispute(escrowId: number): Promise<TransactionResult> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for dispute: ${escrowId}`);
        return { success: false, error: 'Invalid escrow ID' };
      }

      logger.info(`Opening dispute for escrow: ${escrowId}`);
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.openDispute(escrowId);
      const receipt = await tx.wait();
      
      logger.info(`Dispute opened: ${escrowId}, txHash=${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      logger.error(`Failed to open dispute ${escrowId}:`, error);

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'Insufficient funds for gas fees' };
      }
      if (error.message?.includes('revert')) {
        const reason = error.reason || 'Transaction reverted by contract';
        return { success: false, error: reason };
      }
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return { success: false, error: 'Network connection failed' };
      }

      return { success: false, error: error.message || 'Failed to open dispute' };
    }
  }

  async getEscrowStatus(escrowId: number): Promise<{
    escrow: EscrowData;
    canAutoComplete: boolean;
    canCancel: boolean;
    sellerClaimed: boolean;
    sellerClaimTime: Date | null;
    timeUntilAutoComplete: number | null; // seconds
    timeUntilExpiry: number | null; // seconds
  } | null> {
    try {
      if (!Number.isInteger(escrowId) || escrowId <= 0) {
        logger.error(`Invalid escrow ID for status: ${escrowId}`);
        return null;
      }

      const txn = await this.escrowContract.getTransaction(escrowId);
      const decimals = await this.tokenContract.decimals();

      if (Number(txn.id) === 0) {
        logger.debug(`Escrow not found for status: ${escrowId}`);
        return null;
      }

      const [canAutoComplete, canCancel] = await Promise.all([
        this.escrowContract.canAutoComplete(escrowId),
        this.escrowContract.canCancel(escrowId),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const sellerClaimTime = Number(txn.sellerClaimTime);
      const SELLER_CLAIM_WINDOW = 24 * 60 * 60; // 24 hours

      let timeUntilAutoComplete: number | null = null;
      if (txn.sellerClaimed && sellerClaimTime > 0) {
        const autoCompleteTime = sellerClaimTime + SELLER_CLAIM_WINDOW;
        timeUntilAutoComplete = Math.max(0, autoCompleteTime - now);
      }

      const expiresAt = Number(txn.expiresAt);
      const timeUntilExpiry = Math.max(0, expiresAt - now);

      logger.debug(`Escrow status fetched: ${escrowId}, status=${this.statusToString(Number(txn.status))}`);

      return {
        escrow: {
          id: Number(txn.id),
          buyer: txn.buyer,
          seller: txn.seller,
          amount: formatUnits(txn.amount, decimals),
          fee: formatUnits(txn.fee, decimals),
          status: this.statusToString(Number(txn.status)),
          createdAt: new Date(Number(txn.createdAt) * 1000),
          expiresAt: new Date(expiresAt * 1000),
        },
        canAutoComplete,
        canCancel,
        sellerClaimed: txn.sellerClaimed,
        sellerClaimTime: sellerClaimTime > 0 ? new Date(sellerClaimTime * 1000) : null,
        timeUntilAutoComplete,
        timeUntilExpiry,
      };
    } catch (error: any) {
      logger.error(`Failed to get escrow status ${escrowId}:`, error);
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        logger.error('Network error while fetching escrow status');
      }
      
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();
