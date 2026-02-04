"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
class BlockchainService {
    provider;
    tokenContract;
    escrowContract;
    wallet = null;
    constructor() {
        this.provider = new ethers_1.JsonRpcProvider(config_1.config.rpcUrl);
        this.tokenContract = new ethers_1.Contract(config_1.config.pncrTokenAddress, config_1.PNCR_TOKEN_ABI, this.provider);
        this.escrowContract = new ethers_1.Contract(config_1.config.escrowAddress, config_1.ESCROW_ABI, this.provider);
        if (config_1.config.privateKey) {
            this.wallet = new ethers_1.Wallet(config_1.config.privateKey, this.provider);
        }
    }
    getSignedTokenContract() {
        if (!this.wallet)
            throw new Error('Wallet not configured');
        return new ethers_1.Contract(config_1.config.pncrTokenAddress, config_1.PNCR_TOKEN_ABI, this.wallet);
    }
    getSignedEscrowContract() {
        if (!this.wallet)
            throw new Error('Wallet not configured');
        return new ethers_1.Contract(config_1.config.escrowAddress, config_1.ESCROW_ABI, this.wallet);
    }
    statusToString(status) {
        switch (status) {
            case config_1.EscrowStatus.PENDING: return 'PENDING';
            case config_1.EscrowStatus.COMPLETED: return 'COMPLETED';
            case config_1.EscrowStatus.CANCELLED: return 'CANCELLED';
            case 3: return 'DISPUTED'; // DISPUTED status
            default: return 'UNKNOWN';
        }
    }
    async getBalance(address) {
        const balance = await this.tokenContract.balanceOf(address);
        const decimals = await this.tokenContract.decimals();
        return {
            balance: balance.toString(),
            formatted: (0, ethers_1.formatUnits)(balance, decimals),
        };
    }
    async getTokenInfo() {
        const [symbol, decimals] = await Promise.all([
            this.tokenContract.symbol(),
            this.tokenContract.decimals(),
        ]);
        return { symbol, decimals: Number(decimals) };
    }
    async createEscrow(seller, amount, _memo // memo not supported in current contract
    ) {
        try {
            const signedToken = this.getSignedTokenContract();
            const signedEscrow = this.getSignedEscrowContract();
            const decimals = await this.tokenContract.decimals();
            const amountWei = (0, ethers_1.parseUnits)(amount, decimals);
            // Check allowance
            const allowance = await this.tokenContract.allowance(this.wallet.address, config_1.config.escrowAddress);
            if (allowance < amountWei) {
                const approveTx = await signedToken.approve(config_1.config.escrowAddress, amountWei);
                await approveTx.wait();
            }
            // Create escrow
            const tx = await signedEscrow.createEscrow(seller, amountWei);
            const receipt = await tx.wait();
            // Parse escrow ID from events
            const event = receipt.logs.find((log) => {
                try {
                    const parsed = signedEscrow.interface.parseLog(log);
                    return parsed?.name === 'EscrowCreated';
                }
                catch {
                    return false;
                }
            });
            let escrowId;
            if (event) {
                const parsed = signedEscrow.interface.parseLog(event);
                escrowId = Number(parsed?.args.txId);
            }
            return { success: true, txHash: receipt.hash, escrowId };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async getEscrow(escrowId) {
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
                amount: (0, ethers_1.formatUnits)(txn.amount, decimals),
                fee: (0, ethers_1.formatUnits)(txn.fee, decimals),
                status: this.statusToString(Number(txn.status)),
                createdAt: new Date(Number(txn.createdAt) * 1000),
                expiresAt: new Date(Number(txn.expiresAt) * 1000),
            };
        }
        catch (error) {
            return null;
        }
    }
    async confirmEscrow(escrowId) {
        try {
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.confirmDelivery(escrowId);
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async cancelEscrow(escrowId) {
        try {
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.cancelEscrow(escrowId);
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async getAgentHistory(address) {
        const history = [];
        const counter = await this.escrowContract.transactionCount();
        const decimals = await this.tokenContract.decimals();
        // Scan all escrows (in production, use events/indexer)
        for (let i = 1; i <= Number(counter); i++) {
            try {
                const txn = await this.escrowContract.getTransaction(i);
                if (txn.buyer.toLowerCase() === address.toLowerCase() ||
                    txn.seller.toLowerCase() === address.toLowerCase()) {
                    history.push({
                        id: Number(txn.id),
                        buyer: txn.buyer,
                        seller: txn.seller,
                        amount: (0, ethers_1.formatUnits)(txn.amount, decimals),
                        fee: (0, ethers_1.formatUnits)(txn.fee, decimals),
                        status: this.statusToString(Number(txn.status)),
                        createdAt: new Date(Number(txn.createdAt) * 1000),
                        expiresAt: new Date(Number(txn.expiresAt) * 1000),
                    });
                }
            }
            catch {
                continue;
            }
        }
        return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getContractInfo() {
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
    async submitDeliveryProof(escrowId) {
        try {
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.submitDeliveryProof(escrowId);
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async autoComplete(escrowId) {
        try {
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.autoComplete(escrowId);
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async openDispute(escrowId) {
        try {
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.openDispute(escrowId);
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async getEscrowStatus(escrowId) {
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
            let timeUntilAutoComplete = null;
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
                    amount: (0, ethers_1.formatUnits)(txn.amount, decimals),
                    fee: (0, ethers_1.formatUnits)(txn.fee, decimals),
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
        }
        catch (error) {
            return null;
        }
    }
}
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchain.js.map