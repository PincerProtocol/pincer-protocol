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
declare class BlockchainService {
    private provider;
    private tokenContract;
    private escrowContract;
    private wallet;
    constructor();
    private getSignedTokenContract;
    private getSignedEscrowContract;
    private statusToString;
    getBalance(address: string): Promise<{
        balance: string;
        formatted: string;
    }>;
    getTokenInfo(): Promise<{
        symbol: string;
        decimals: number;
    }>;
    createEscrow(seller: string, amount: string, _memo?: string): Promise<TransactionResult>;
    getEscrow(escrowId: number): Promise<EscrowData | null>;
    confirmEscrow(escrowId: number): Promise<TransactionResult>;
    cancelEscrow(escrowId: number): Promise<TransactionResult>;
    getAgentHistory(address: string): Promise<EscrowData[]>;
    getContractInfo(): Promise<{
        feeRate: number;
        escrowDuration: number;
        transactionCount: number;
    }>;
    submitDeliveryProof(escrowId: number): Promise<TransactionResult>;
    autoComplete(escrowId: number): Promise<TransactionResult>;
    openDispute(escrowId: number): Promise<TransactionResult>;
    getEscrowStatus(escrowId: number): Promise<{
        escrow: EscrowData;
        canAutoComplete: boolean;
        canCancel: boolean;
        sellerClaimed: boolean;
        sellerClaimTime: Date | null;
        timeUntilAutoComplete: number | null;
        timeUntilExpiry: number | null;
    } | null>;
}
export declare const blockchainService: BlockchainService;
export {};
//# sourceMappingURL=blockchain.d.ts.map