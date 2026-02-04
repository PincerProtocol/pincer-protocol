export declare const config: {
    port: string | number;
    rpcUrl: string;
    pncrTokenAddress: string;
    escrowAddress: string;
    stakingAddress: string;
    reputationAddress: string;
    privateKey: string;
};
export declare const PNCR_TOKEN_ABI: string[];
export declare const ESCROW_ABI: string[];
export declare enum EscrowStatus {
    PENDING = 0,
    COMPLETED = 1,
    CANCELLED = 2,
    DISPUTED = 3
}
//# sourceMappingURL=config.d.ts.map