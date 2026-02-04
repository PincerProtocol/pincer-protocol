"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ethers_1 = require("ethers");
const router = (0, express_1.Router)();
// AgentWallet ABI (essential functions only)
const AGENT_WALLET_ABI = [
    "function createWallet(string agentId, uint256 dailyLimit, bool whitelistEnabled) returns (bytes32)",
    "function deposit(bytes32 walletId, uint256 amount)",
    "function withdraw(bytes32 walletId, uint256 amount)",
    "function agentTransfer(bytes32 walletId, address to, uint256 amount, string memo)",
    "function setDailyLimit(bytes32 walletId, uint256 newLimit)",
    "function approveRecipient(bytes32 walletId, address recipient)",
    "function removeRecipient(bytes32 walletId, address recipient)",
    "function setOperator(bytes32 walletId, address operator, bool approved)",
    "function setWhitelistMode(bytes32 walletId, bool enabled)",
    "function getWalletId(address owner, string agentId) view returns (bytes32)",
    "function getWalletInfo(bytes32 walletId) view returns (address owner, string agentId, uint256 balance, uint256 dailyLimit, uint256 spentToday, uint256 remainingToday, bool whitelistEnabled, bool active, uint256 totalSpent, uint256 transactionCount)",
    "function getApprovedRecipients(bytes32 walletId) view returns (address[])",
    "function getOperators(bytes32 walletId) view returns (address[])",
    "function getWalletsByOwner(address owner) view returns (bytes32[])",
    "function getRemainingAllowance(bytes32 walletId) view returns (uint256)",
    "function canSpend(bytes32 walletId, address spender) view returns (bool)",
    "function getTransactionHistory(bytes32 walletId, uint256 offset, uint256 limit) view returns (tuple(bytes32 walletId, address to, uint256 amount, string memo, uint256 timestamp, address initiatedBy)[])",
    "event WalletCreated(bytes32 indexed walletId, address indexed owner, string agentId, uint256 dailyLimit)",
    "event AgentTransfer(bytes32 indexed walletId, address indexed to, uint256 amount, uint256 fee, string memo, address initiatedBy)",
];
// Helper to get provider and contract
function getProvider() {
    const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    return new ethers_1.ethers.JsonRpcProvider(rpcUrl);
}
function getWalletContract(signerOrProvider) {
    const address = process.env.AGENT_WALLET_ADDRESS;
    if (!address) {
        throw new Error('AGENT_WALLET_ADDRESS not configured');
    }
    return new ethers_1.ethers.Contract(address, AGENT_WALLET_ABI, signerOrProvider || getProvider());
}
function getSigner() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('PRIVATE_KEY not configured');
    }
    return new ethers_1.ethers.Wallet(privateKey, getProvider());
}
// ============ READ ENDPOINTS ============
// GET /wallet/info/:walletId
router.get('/info/:walletId', async (req, res) => {
    try {
        const { walletId } = req.params;
        if (!walletId || !walletId.startsWith('0x')) {
            return res.status(400).json({ error: 'Invalid wallet ID format' });
        }
        const contract = getWalletContract();
        const info = await contract.getWalletInfo(walletId);
        res.json({
            walletId,
            owner: info[0],
            agentId: info[1],
            balance: ethers_1.ethers.formatEther(info[2]),
            balanceRaw: info[2].toString(),
            dailyLimit: ethers_1.ethers.formatEther(info[3]),
            dailyLimitRaw: info[3].toString(),
            spentToday: ethers_1.ethers.formatEther(info[4]),
            remainingToday: ethers_1.ethers.formatEther(info[5]),
            whitelistEnabled: info[6],
            active: info[7],
            totalSpent: ethers_1.ethers.formatEther(info[8]),
            transactionCount: Number(info[9]),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/id/:owner/:agentId - Get wallet ID
router.get('/id/:owner/:agentId', async (req, res) => {
    try {
        const { owner, agentId } = req.params;
        if (!owner || !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
            return res.status(400).json({ error: 'Invalid owner address' });
        }
        const contract = getWalletContract();
        const walletId = await contract.getWalletId(owner, agentId);
        res.json({ owner, agentId, walletId });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/owner/:address - Get all wallets for owner
router.get('/owner/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid address format' });
        }
        const contract = getWalletContract();
        const walletIds = await contract.getWalletsByOwner(address);
        // Get info for each wallet
        const wallets = await Promise.all(walletIds.map(async (walletId) => {
            const info = await contract.getWalletInfo(walletId);
            return {
                walletId,
                agentId: info[1],
                balance: ethers_1.ethers.formatEther(info[2]),
                active: info[7],
            };
        }));
        res.json({ owner: address, wallets });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/:walletId/allowance - Get remaining daily allowance
router.get('/:walletId/allowance', async (req, res) => {
    try {
        const { walletId } = req.params;
        const contract = getWalletContract();
        const remaining = await contract.getRemainingAllowance(walletId);
        res.json({
            walletId,
            remainingAllowance: ethers_1.ethers.formatEther(remaining),
            remainingRaw: remaining.toString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/:walletId/recipients - Get approved recipients
router.get('/:walletId/recipients', async (req, res) => {
    try {
        const { walletId } = req.params;
        const contract = getWalletContract();
        const recipients = await contract.getApprovedRecipients(walletId);
        res.json({ walletId, recipients });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/:walletId/operators - Get operators
router.get('/:walletId/operators', async (req, res) => {
    try {
        const { walletId } = req.params;
        const contract = getWalletContract();
        const operators = await contract.getOperators(walletId);
        res.json({ walletId, operators });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/:walletId/history - Get transaction history
router.get('/:walletId/history', async (req, res) => {
    try {
        const { walletId } = req.params;
        const offset = parseInt(req.query.offset) || 0;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const contract = getWalletContract();
        const history = await contract.getTransactionHistory(walletId, offset, limit);
        const transactions = history.map((tx) => ({
            to: tx.to,
            amount: ethers_1.ethers.formatEther(tx.amount),
            memo: tx.memo,
            timestamp: new Date(Number(tx.timestamp) * 1000).toISOString(),
            initiatedBy: tx.initiatedBy,
        }));
        res.json({ walletId, offset, limit, transactions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /wallet/:walletId/can-spend/:address - Check if address can spend
router.get('/:walletId/can-spend/:address', async (req, res) => {
    try {
        const { walletId, address } = req.params;
        const contract = getWalletContract();
        const canSpend = await contract.canSpend(walletId, address);
        res.json({ walletId, address, canSpend });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============ WRITE ENDPOINTS ============
// Note: These require the API server's private key to execute
// In production, use signature-based authorization or a more secure approach
// POST /wallet/create - Create agent wallet
router.post('/create', async (req, res) => {
    try {
        const { agentId, dailyLimit, whitelistEnabled = true } = req.body;
        if (!agentId) {
            return res.status(400).json({ error: 'agentId is required' });
        }
        if (!dailyLimit || isNaN(Number(dailyLimit))) {
            return res.status(400).json({ error: 'dailyLimit is required (in PNCR)' });
        }
        const signer = getSigner();
        const contract = getWalletContract(signer);
        const limitWei = ethers_1.ethers.parseEther(dailyLimit.toString());
        const tx = await contract.createWallet(agentId, limitWei, whitelistEnabled);
        const receipt = await tx.wait();
        // Get wallet ID from event
        const event = receipt.logs.find((log) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'WalletCreated';
            }
            catch {
                return false;
            }
        });
        const walletId = event ? contract.interface.parseLog(event)?.args[0] : null;
        res.status(201).json({
            success: true,
            walletId,
            agentId,
            dailyLimit,
            whitelistEnabled,
            txHash: receipt.hash,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /wallet/:walletId/transfer - Agent transfer
router.post('/:walletId/transfer', async (req, res) => {
    try {
        const { walletId } = req.params;
        const { to, amount, memo = '' } = req.body;
        if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
            return res.status(400).json({ error: 'Invalid recipient address' });
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const signer = getSigner();
        const contract = getWalletContract(signer);
        const amountWei = ethers_1.ethers.parseEther(amount.toString());
        const tx = await contract.agentTransfer(walletId, to, amountWei, memo);
        const receipt = await tx.wait();
        res.json({
            success: true,
            txHash: receipt.hash,
            from: walletId,
            to,
            amount,
            memo,
        });
    }
    catch (error) {
        // Parse common errors
        if (error.message.includes('DailyLimitExceeded')) {
            return res.status(400).json({ error: 'Daily spending limit exceeded' });
        }
        if (error.message.includes('InsufficientBalance')) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        if (error.message.includes('RecipientNotApproved')) {
            return res.status(400).json({ error: 'Recipient not in whitelist' });
        }
        if (error.message.includes('NotAuthorized')) {
            return res.status(403).json({ error: 'Not authorized to spend from this wallet' });
        }
        res.status(500).json({ error: error.message });
    }
});
// POST /wallet/:walletId/deposit - Deposit to wallet
router.post('/:walletId/deposit', async (req, res) => {
    try {
        const { walletId } = req.params;
        const { amount } = req.body;
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        // Note: This requires the signer to have approved the AgentWallet contract
        const signer = getSigner();
        const contract = getWalletContract(signer);
        const amountWei = ethers_1.ethers.parseEther(amount.toString());
        const tx = await contract.deposit(walletId, amountWei);
        const receipt = await tx.wait();
        res.json({
            success: true,
            txHash: receipt.hash,
            walletId,
            deposited: amount,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /wallet/:walletId/settings - Update wallet settings
router.post('/:walletId/settings', async (req, res) => {
    try {
        const { walletId } = req.params;
        const { dailyLimit, whitelistEnabled, addRecipient, removeRecipient, addOperator, removeOperator } = req.body;
        const signer = getSigner();
        const contract = getWalletContract(signer);
        const results = { walletId, updates: [] };
        if (dailyLimit !== undefined) {
            const limitWei = ethers_1.ethers.parseEther(dailyLimit.toString());
            const tx = await contract.setDailyLimit(walletId, limitWei);
            await tx.wait();
            results.updates.push({ setting: 'dailyLimit', value: dailyLimit });
        }
        if (whitelistEnabled !== undefined) {
            const tx = await contract.setWhitelistMode(walletId, whitelistEnabled);
            await tx.wait();
            results.updates.push({ setting: 'whitelistEnabled', value: whitelistEnabled });
        }
        if (addRecipient) {
            const tx = await contract.approveRecipient(walletId, addRecipient);
            await tx.wait();
            results.updates.push({ setting: 'addRecipient', value: addRecipient });
        }
        if (removeRecipient) {
            const tx = await contract.removeRecipient(walletId, removeRecipient);
            await tx.wait();
            results.updates.push({ setting: 'removeRecipient', value: removeRecipient });
        }
        if (addOperator) {
            const tx = await contract.setOperator(walletId, addOperator, true);
            await tx.wait();
            results.updates.push({ setting: 'addOperator', value: addOperator });
        }
        if (removeOperator) {
            const tx = await contract.setOperator(walletId, removeOperator, false);
            await tx.wait();
            results.updates.push({ setting: 'removeOperator', value: removeOperator });
        }
        res.json({ success: true, ...results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=wallet.js.map