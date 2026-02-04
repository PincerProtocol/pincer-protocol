import { ethers, Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from 'ethers';
import { config, PNCR_TOKEN_ABI, ESCROW_ABI, EscrowStatus } from '../config';

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
    const balance = await this.tokenContract.balanceOf(address);
    const decimals = await this.tokenContract.decimals();
    return {
      balance: balance.toString(),
      formatted: formatUnits(balance, decimals),
    };
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
      const signedToken = this.getSignedTokenContract();
      const signedEscrow = this.getSignedEscrowContract();

      const decimals = await this.tokenContract.decimals();
      const amountWei = parseUnits(amount, decimals);

      // Check allowance
      const allowance = await this.tokenContract.allowance(this.wallet!.address, config.escrowAddress);
      if (allowance < amountWei) {
        const approveTx = await signedToken.approve(config.escrowAddress, amountWei);
        await approveTx.wait();
      }

      // Create escrow
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

      return { success: true, txHash: receipt.hash, escrowId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getEscrow(escrowId: number): Promise<EscrowData | null> {
    try {
      const txn = await this.escrowContract.getTransaction(escrowId);
      const decimals = await this.tokenContract.decimals();

      // Check if transaction exists (id will be 0 for non-existent)
      if (Number(txn.id) === 0) {
        return null;
      }

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
    } catch (error) {
      return null;
    }
  }

  async confirmEscrow(escrowId: number): Promise<TransactionResult> {
    try {
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.confirmDelivery(escrowId);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async cancelEscrow(escrowId: number): Promise<TransactionResult> {
    try {
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.cancelEscrow(escrowId);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAgentHistory(address: string): Promise<EscrowData[]> {
    const history: EscrowData[] = [];
    const counter = await this.escrowContract.transactionCount();
    const decimals = await this.tokenContract.decimals();

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
      } catch { continue; }
    }

    return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.submitDeliveryProof(escrowId);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async autoComplete(escrowId: number): Promise<TransactionResult> {
    try {
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.autoComplete(escrowId);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async openDispute(escrowId: number): Promise<TransactionResult> {
    try {
      const signedEscrow = this.getSignedEscrowContract();
      const tx = await signedEscrow.openDispute(escrowId);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
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
      const txn = await this.escrowContract.getTransaction(escrowId);
      const decimals = await this.tokenContract.decimals();

      if (Number(txn.id) === 0) {
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
    } catch (error) {
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();
