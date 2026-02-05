"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
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
        try {
            if (!ethers_1.ethers.isAddress(address)) {
                logger_1.default.error(`Invalid address format: ${address}`);
                throw new Error('Invalid Ethereum address format');
            }
            const balance = await this.tokenContract.balanceOf(address);
            const decimals = await this.tokenContract.decimals();
            logger_1.default.debug(`Balance fetched for ${address}: ${(0, ethers_1.formatUnits)(balance, decimals)}`);
            return {
                balance: balance.toString(),
                formatted: (0, ethers_1.formatUnits)(balance, decimals),
            };
        }
        catch (error) {
            logger_1.default.error(`Failed to get balance for ${address}:`, error);
            if (error.message?.includes('Invalid')) {
                throw error;
            }
            if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
                throw new Error('Network connection failed. Please try again later.');
            }
            throw new Error('Failed to fetch balance. Please check the address and try again.');
        }
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
            // 입력 검증
            if (!ethers_1.ethers.isAddress(seller)) {
                logger_1.default.error(`Invalid seller address: ${seller}`);
                return { success: false, error: 'Invalid seller address format' };
            }
            const signedToken = this.getSignedTokenContract();
            const signedEscrow = this.getSignedEscrowContract();
            const decimals = await this.tokenContract.decimals();
            let amountWei;
            try {
                amountWei = (0, ethers_1.parseUnits)(amount, decimals);
            }
            catch (error) {
                logger_1.default.error(`Invalid amount format: ${amount}`);
                return { success: false, error: 'Invalid amount format' };
            }
            if (amountWei <= 0n) {
                logger_1.default.error(`Amount must be positive: ${amount}`);
                return { success: false, error: 'Amount must be greater than zero' };
            }
            // Check balance
            const balance = await this.tokenContract.balanceOf(this.wallet.address);
            if (balance < amountWei) {
                logger_1.default.warn(`Insufficient balance: ${(0, ethers_1.formatUnits)(balance, decimals)} < ${amount}`);
                return { success: false, error: 'Insufficient token balance' };
            }
            // Check allowance
            const allowance = await this.tokenContract.allowance(this.wallet.address, config_1.config.escrowAddress);
            if (allowance < amountWei) {
                logger_1.default.info(`Approving tokens: ${amount}`);
                const approveTx = await signedToken.approve(config_1.config.escrowAddress, amountWei);
                await approveTx.wait();
                logger_1.default.info(`Approval confirmed: ${approveTx.hash}`);
            }
            // Create escrow
            logger_1.default.info(`Creating escrow: seller=${seller}, amount=${amount}`);
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
            logger_1.default.info(`Escrow created successfully: txHash=${receipt.hash}, escrowId=${escrowId}`);
            return { success: true, txHash: receipt.hash, escrowId };
        }
        catch (error) {
            logger_1.default.error('Failed to create escrow:', error);
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
                logger_1.default.error(`Transaction reverted: ${reason}`);
                return { success: false, error: `Transaction failed: ${reason}` };
            }
            return { success: false, error: error.message || 'Failed to create escrow' };
        }
    }
    async getEscrow(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID: ${escrowId}`);
                return null;
            }
            const txn = await this.escrowContract.getTransaction(escrowId);
            const decimals = await this.tokenContract.decimals();
            // Check if transaction exists (id will be 0 for non-existent)
            if (Number(txn.id) === 0) {
                logger_1.default.debug(`Escrow not found: ${escrowId}`);
                return null;
            }
            logger_1.default.debug(`Escrow fetched: ${escrowId}, status=${this.statusToString(Number(txn.status))}`);
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
            logger_1.default.error(`Failed to get escrow ${escrowId}:`, error);
            if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
                logger_1.default.error('Network error while fetching escrow');
            }
            return null;
        }
    }
    async confirmEscrow(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for confirmation: ${escrowId}`);
                return { success: false, error: 'Invalid escrow ID' };
            }
            logger_1.default.info(`Confirming escrow: ${escrowId}`);
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.confirmDelivery(escrowId);
            const receipt = await tx.wait();
            logger_1.default.info(`Escrow confirmed successfully: ${escrowId}, txHash=${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            logger_1.default.error(`Failed to confirm escrow ${escrowId}:`, error);
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
    async cancelEscrow(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for cancellation: ${escrowId}`);
                return { success: false, error: 'Invalid escrow ID' };
            }
            logger_1.default.info(`Cancelling escrow: ${escrowId}`);
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.cancelEscrow(escrowId);
            const receipt = await tx.wait();
            logger_1.default.info(`Escrow cancelled successfully: ${escrowId}, txHash=${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            logger_1.default.error(`Failed to cancel escrow ${escrowId}:`, error);
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
    async getAgentHistory(address) {
        try {
            if (!ethers_1.ethers.isAddress(address)) {
                logger_1.default.error(`Invalid address format for history: ${address}`);
                throw new Error('Invalid Ethereum address format');
            }
            const history = [];
            const counter = await this.escrowContract.transactionCount();
            const decimals = await this.tokenContract.decimals();
            logger_1.default.debug(`Fetching history for ${address}, total transactions: ${counter}`);
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
                catch (error) {
                    logger_1.default.warn(`Failed to fetch transaction ${i}, skipping`);
                    continue;
                }
            }
            logger_1.default.info(`Fetched ${history.length} transactions for ${address}`);
            return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        catch (error) {
            logger_1.default.error(`Failed to get agent history for ${address}:`, error);
            if (error.message?.includes('Invalid')) {
                throw error;
            }
            if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
                throw new Error('Network connection failed. Please try again later.');
            }
            throw new Error('Failed to fetch transaction history');
        }
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
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for delivery proof: ${escrowId}`);
                return { success: false, error: 'Invalid escrow ID' };
            }
            logger_1.default.info(`Submitting delivery proof for escrow: ${escrowId}`);
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.submitDeliveryProof(escrowId);
            const receipt = await tx.wait();
            logger_1.default.info(`Delivery proof submitted: ${escrowId}, txHash=${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            logger_1.default.error(`Failed to submit delivery proof ${escrowId}:`, error);
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
    async autoComplete(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for auto-complete: ${escrowId}`);
                return { success: false, error: 'Invalid escrow ID' };
            }
            logger_1.default.info(`Auto-completing escrow: ${escrowId}`);
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.autoComplete(escrowId);
            const receipt = await tx.wait();
            logger_1.default.info(`Escrow auto-completed: ${escrowId}, txHash=${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            logger_1.default.error(`Failed to auto-complete escrow ${escrowId}:`, error);
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
    async openDispute(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for dispute: ${escrowId}`);
                return { success: false, error: 'Invalid escrow ID' };
            }
            logger_1.default.info(`Opening dispute for escrow: ${escrowId}`);
            const signedEscrow = this.getSignedEscrowContract();
            const tx = await signedEscrow.openDispute(escrowId);
            const receipt = await tx.wait();
            logger_1.default.info(`Dispute opened: ${escrowId}, txHash=${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        }
        catch (error) {
            logger_1.default.error(`Failed to open dispute ${escrowId}:`, error);
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
    async getEscrowStatus(escrowId) {
        try {
            if (!Number.isInteger(escrowId) || escrowId <= 0) {
                logger_1.default.error(`Invalid escrow ID for status: ${escrowId}`);
                return null;
            }
            const txn = await this.escrowContract.getTransaction(escrowId);
            const decimals = await this.tokenContract.decimals();
            if (Number(txn.id) === 0) {
                logger_1.default.debug(`Escrow not found for status: ${escrowId}`);
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
            logger_1.default.debug(`Escrow status fetched: ${escrowId}, status=${this.statusToString(Number(txn.status))}`);
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
            logger_1.default.error(`Failed to get escrow status ${escrowId}:`, error);
            if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
                logger_1.default.error('Network error while fetching escrow status');
            }
            return null;
        }
    }
}
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchain.js.map