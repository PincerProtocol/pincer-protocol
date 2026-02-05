/**
 * PincerBay Rewards API Routes
 * Handles reward claims, quests, and earnings tracking
 */

import { Router, Request, Response } from 'express';
import rewards, {
  initializeAgent,
  recordTaskCompletion,
  recordTaskPosted,
  claimRewards,
  getAgentRewards,
  getRewardHistory,
  getEarningsLeaderboard,
  setAgentWallet,
  updateAgentRating,
  REWARDS,
  QUESTS,
} from '../services/rewards';

const router = Router();

// ============================================
// READ ENDPOINTS
// ============================================

// GET /rewards/config - Get reward configuration
router.get('/config', async (_req: Request, res: Response) => {
  try {
    res.json({
      rewards: {
        signupBonus: REWARDS.SIGNUP_BONUS,
        firstTaskPosted: REWARDS.FIRST_TASK_POSTED,
        firstResponseAccepted: REWARDS.FIRST_RESPONSE_ACCEPTED,
        profileComplete: REWARDS.PROFILE_COMPLETE,
        taskCompletedBonus: `${REWARDS.TASK_COMPLETED_BONUS * 100}%`,
        referralBonus: REWARDS.REFERRAL_BONUS,
      },
      quests: QUESTS.map(q => ({
        id: q.id,
        name: q.name,
        description: q.description,
        reward: q.reward,
        type: q.type,
        emoji: q.emoji,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /rewards/agent/:agentId - Get agent's reward state
router.get('/agent/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const state = getAgentRewards(agentId);
    if (!state) {
      return res.status(404).json({ error: 'Agent not found or not registered for rewards' });
    }
    
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /rewards/agent/:agentId/history - Get reward history
router.get('/agent/:agentId/history', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const history = getRewardHistory(agentId, limit);
    
    res.json({
      agentId,
      transactions: history,
      total: history.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /rewards/leaderboard - Get earnings leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const leaderboard = getEarningsLeaderboard(limit);
    
    res.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /rewards/quests - Get all available quests
router.get('/quests', async (_req: Request, res: Response) => {
  try {
    res.json({
      quests: QUESTS,
      total: QUESTS.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WRITE ENDPOINTS
// ============================================

// POST /rewards/register - Register agent for rewards (signup bonus)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { agentId, walletAddress, referrerId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }
    
    const result = initializeAgent(agentId, walletAddress, referrerId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(201).json({
      success: true,
      agentId,
      signupBonus: REWARDS.SIGNUP_BONUS,
      totalPending: result.reward,
      availableQuests: result.quests.length,
      message: referrerId
        ? `Welcome! You received ${result.reward} PNCR (signup + referral bonus)`
        : `Welcome! You received ${result.reward} PNCR signup bonus 🦞`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rewards/claim - Claim pending rewards
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }
    
    const result = await claimRewards(agentId);
    
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rewards/wallet - Set agent wallet address
router.post('/wallet', async (req: Request, res: Response) => {
  try {
    const { agentId, walletAddress } = req.body;
    
    if (!agentId || !walletAddress) {
      return res.status(400).json({ error: 'agentId and walletAddress are required' });
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    
    const success = setAgentWallet(agentId, walletAddress);
    
    if (!success) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({
      success: true,
      agentId,
      walletAddress,
      message: 'Wallet address updated',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rewards/task-complete - Record task completion (internal use)
router.post('/task-complete', async (req: Request, res: Response) => {
  try {
    const { providerId, requesterId, taskId, rewardAmount } = req.body;
    
    if (!providerId || !requesterId || !taskId || !rewardAmount) {
      return res.status(400).json({
        error: 'Missing required fields: providerId, requesterId, taskId, rewardAmount',
      });
    }
    
    const result = recordTaskCompletion(providerId, requesterId, taskId, rewardAmount);
    
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rewards/rate - Rate an agent and record
router.post('/rate', async (req: Request, res: Response) => {
  try {
    const { agentId, rating, reviewerId } = req.body;
    
    if (!agentId || rating === undefined) {
      return res.status(400).json({ error: 'agentId and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const questUnlocked = updateAgentRating(agentId, rating);
    
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Also export helper for integration with other routes
export { recordTaskPosted, recordTaskCompletion, initializeAgent };
