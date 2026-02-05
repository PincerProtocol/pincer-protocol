"use strict";
/**
 * PincerBay Rewards API Routes
 * Handles reward claims, quests, and earnings tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAgent = exports.recordTaskCompletion = exports.recordTaskPosted = void 0;
const express_1 = require("express");
const rewards_1 = require("../services/rewards");
Object.defineProperty(exports, "initializeAgent", { enumerable: true, get: function () { return rewards_1.initializeAgent; } });
Object.defineProperty(exports, "recordTaskCompletion", { enumerable: true, get: function () { return rewards_1.recordTaskCompletion; } });
Object.defineProperty(exports, "recordTaskPosted", { enumerable: true, get: function () { return rewards_1.recordTaskPosted; } });
const router = (0, express_1.Router)();
// ============================================
// READ ENDPOINTS
// ============================================
// GET /rewards/config - Get reward configuration
router.get('/config', async (_req, res) => {
    try {
        res.json({
            rewards: {
                signupBonus: rewards_1.REWARDS.SIGNUP_BONUS,
                firstTaskPosted: rewards_1.REWARDS.FIRST_TASK_POSTED,
                firstResponseAccepted: rewards_1.REWARDS.FIRST_RESPONSE_ACCEPTED,
                profileComplete: rewards_1.REWARDS.PROFILE_COMPLETE,
                taskCompletedBonus: `${rewards_1.REWARDS.TASK_COMPLETED_BONUS * 100}%`,
                referralBonus: rewards_1.REWARDS.REFERRAL_BONUS,
            },
            quests: rewards_1.QUESTS.map(q => ({
                id: q.id,
                name: q.name,
                description: q.description,
                reward: q.reward,
                type: q.type,
                emoji: q.emoji,
            })),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /rewards/agent/:agentId - Get agent's reward state
router.get('/agent/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const state = (0, rewards_1.getAgentRewards)(agentId);
        if (!state) {
            return res.status(404).json({ error: 'Agent not found or not registered for rewards' });
        }
        res.json(state);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /rewards/agent/:agentId/history - Get reward history
router.get('/agent/:agentId/history', async (req, res) => {
    try {
        const { agentId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const history = (0, rewards_1.getRewardHistory)(agentId, limit);
        res.json({
            agentId,
            transactions: history,
            total: history.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /rewards/leaderboard - Get earnings leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const leaderboard = (0, rewards_1.getEarningsLeaderboard)(limit);
        res.json({
            leaderboard,
            total: leaderboard.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /rewards/quests - Get all available quests
router.get('/quests', async (_req, res) => {
    try {
        res.json({
            quests: rewards_1.QUESTS,
            total: rewards_1.QUESTS.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// WRITE ENDPOINTS
// ============================================
// POST /rewards/register - Register agent for rewards (signup bonus)
router.post('/register', async (req, res) => {
    try {
        const { agentId, walletAddress, referrerId } = req.body;
        if (!agentId) {
            return res.status(400).json({ error: 'agentId is required' });
        }
        const result = (0, rewards_1.initializeAgent)(agentId, walletAddress, referrerId);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json({
            success: true,
            agentId,
            signupBonus: rewards_1.REWARDS.SIGNUP_BONUS,
            totalPending: result.reward,
            availableQuests: result.quests.length,
            message: referrerId
                ? `Welcome! You received ${result.reward} PNCR (signup + referral bonus)`
                : `Welcome! You received ${result.reward} PNCR signup bonus 🦞`,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /rewards/claim - Claim pending rewards
router.post('/claim', async (req, res) => {
    try {
        const { agentId } = req.body;
        if (!agentId) {
            return res.status(400).json({ error: 'agentId is required' });
        }
        const result = await (0, rewards_1.claimRewards)(agentId);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        res.json({
            success: true,
            agentId,
            amountClaimed: result.amount,
            txHash: result.txHash,
            message: `Successfully claimed ${result.amount} PNCR!`,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /rewards/wallet - Set agent wallet address
router.post('/wallet', async (req, res) => {
    try {
        const { agentId, walletAddress } = req.body;
        if (!agentId || !walletAddress) {
            return res.status(400).json({ error: 'agentId and walletAddress are required' });
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }
        const success = (0, rewards_1.setAgentWallet)(agentId, walletAddress);
        if (!success) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({
            success: true,
            agentId,
            walletAddress,
            message: 'Wallet address updated',
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /rewards/task-complete - Record task completion (internal use)
router.post('/task-complete', async (req, res) => {
    try {
        const { providerId, requesterId, taskId, rewardAmount } = req.body;
        if (!providerId || !requesterId || !taskId || !rewardAmount) {
            return res.status(400).json({
                error: 'Missing required fields: providerId, requesterId, taskId, rewardAmount',
            });
        }
        const result = (0, rewards_1.recordTaskCompletion)(providerId, requesterId, taskId, rewardAmount);
        res.json({
            success: true,
            taskId,
            provider: {
                agentId: providerId,
                earned: result.providerReward,
            },
            requester: {
                agentId: requesterId,
                bonus: result.requesterBonus,
            },
            questsUnlocked: result.questsUnlocked.map(q => ({
                id: q.id,
                name: q.name,
                reward: q.reward,
                emoji: q.emoji,
            })),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /rewards/rate - Rate an agent and record
router.post('/rate', async (req, res) => {
    try {
        const { agentId, rating, reviewerId } = req.body;
        if (!agentId || rating === undefined) {
            return res.status(400).json({ error: 'agentId and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const questUnlocked = (0, rewards_1.updateAgentRating)(agentId, rating);
        res.json({
            success: true,
            agentId,
            rating,
            questUnlocked: questUnlocked ? {
                id: questUnlocked.id,
                name: questUnlocked.name,
                reward: questUnlocked.reward,
                emoji: questUnlocked.emoji,
            } : null,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=rewards.js.map