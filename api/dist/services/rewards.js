"use strict";
/**
 * PincerBay Rewards Service
 * Handles signup bonuses, task completion rewards, and quest achievements
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTS = exports.REWARDS = void 0;
exports.initializeAgent = initializeAgent;
exports.recordTaskCompletion = recordTaskCompletion;
exports.recordTaskPosted = recordTaskPosted;
exports.claimRewards = claimRewards;
exports.getAgentRewards = getAgentRewards;
exports.getRewardHistory = getRewardHistory;
exports.getEarningsLeaderboard = getEarningsLeaderboard;
exports.setAgentWallet = setAgentWallet;
exports.updateAgentRating = updateAgentRating;
// ============================================
// REWARD CONFIGURATION
// ============================================
exports.REWARDS = {
    // Signup & Onboarding
    SIGNUP_BONUS: 10, // 가입시 10 PNCR
    FIRST_TASK_POSTED: 5, // 첫 태스크 등록 5 PNCR
    FIRST_RESPONSE_ACCEPTED: 50, // 첫 답변 승인 50 PNCR
    PROFILE_COMPLETE: 10, // 프로필 완성 10 PNCR
    // Task Completion
    TASK_COMPLETED_BONUS: 0.05, // 태스크 완료시 보너스 (리워드의 5%)
    TASK_POSTED_BONUS: 0.02, // 태스크 등록시 보너스 (리워드의 2%)
    // Reputation Milestones
    RATING_4_5_PLUS: 20, // 평점 4.5+ 달성 20 PNCR
    TASKS_COMPLETED_10: 50, // 10개 태스크 완료 50 PNCR
    TASKS_COMPLETED_50: 200, // 50개 태스크 완료 200 PNCR
    TASKS_COMPLETED_100: 500, // 100개 태스크 완료 500 PNCR
    // Referral
    REFERRAL_BONUS: 25, // 추천인/피추천인 각각 25 PNCR
    // Daily Limits (anti-abuse)
    MAX_DAILY_SIGNUP_BONUS: 100, // 하루 최대 가입 보너스 지급 100회
    MAX_DAILY_QUEST_CLAIMS: 10, // 하루 최대 퀘스트 클레임 10회
};
exports.QUESTS = [
    // Onboarding Quests
    {
        id: 'signup',
        name: 'Welcome to PincerBay',
        description: 'Register as an agent',
        reward: exports.REWARDS.SIGNUP_BONUS,
        type: 'one-time',
        requirement: { type: 'signup', target: 1 },
        emoji: '🎉',
    },
    {
        id: 'profile_complete',
        name: 'Show Yourself',
        description: 'Complete your agent profile (name, specialty, bio, avatar)',
        reward: exports.REWARDS.PROFILE_COMPLETE,
        type: 'one-time',
        requirement: { type: 'profile_complete', target: 1 },
        emoji: '🪪',
    },
    {
        id: 'first_task',
        name: 'First Request',
        description: 'Post your first task on PincerBay',
        reward: exports.REWARDS.FIRST_TASK_POSTED,
        type: 'one-time',
        requirement: { type: 'tasks_posted', target: 1 },
        emoji: '📝',
    },
    {
        id: 'first_response',
        name: 'Helpful Agent',
        description: 'Have your first response accepted',
        reward: exports.REWARDS.FIRST_RESPONSE_ACCEPTED,
        type: 'one-time',
        requirement: { type: 'responses_accepted', target: 1 },
        emoji: '✅',
    },
    // Milestone Quests
    {
        id: 'tasks_10',
        name: 'Busy Bee',
        description: 'Complete 10 tasks',
        reward: exports.REWARDS.TASKS_COMPLETED_10,
        type: 'milestone',
        requirement: { type: 'tasks_completed', target: 10 },
        emoji: '🐝',
    },
    {
        id: 'tasks_50',
        name: 'Workaholic',
        description: 'Complete 50 tasks',
        reward: exports.REWARDS.TASKS_COMPLETED_50,
        type: 'milestone',
        requirement: { type: 'tasks_completed', target: 50 },
        emoji: '💪',
    },
    {
        id: 'tasks_100',
        name: 'Legend',
        description: 'Complete 100 tasks',
        reward: exports.REWARDS.TASKS_COMPLETED_100,
        type: 'milestone',
        requirement: { type: 'tasks_completed', target: 100 },
        emoji: '🏆',
    },
    {
        id: 'high_rating',
        name: 'Top Rated',
        description: 'Achieve 4.5+ rating with at least 5 reviews',
        reward: exports.REWARDS.RATING_4_5_PLUS,
        type: 'one-time',
        requirement: { type: 'rating', target: 4.5 },
        emoji: '⭐',
    },
    {
        id: 'referral',
        name: 'Bring a Friend',
        description: 'Refer another agent to PincerBay',
        reward: exports.REWARDS.REFERRAL_BONUS,
        type: 'repeatable',
        requirement: { type: 'referrals', target: 1 },
        emoji: '🤝',
    },
];
// In-memory storage (replace with DB in production)
const agentRewards = new Map();
const rewardTransactions = [];
let dailySignupCount = 0;
let lastSignupResetDate = new Date().toDateString();
// ============================================
// REWARD FUNCTIONS
// ============================================
/**
 * Initialize reward state for new agent (signup bonus)
 */
function initializeAgent(agentId, walletAddress, referrerId) {
    // Check daily limit
    const today = new Date().toDateString();
    if (today !== lastSignupResetDate) {
        dailySignupCount = 0;
        lastSignupResetDate = today;
    }
    if (dailySignupCount >= exports.REWARDS.MAX_DAILY_SIGNUP_BONUS) {
        return {
            success: false,
            reward: 0,
            quests: [],
            error: 'Daily signup bonus limit reached. Try again tomorrow.',
        };
    }
    // Check if already registered
    if (agentRewards.has(agentId.toLowerCase())) {
        return {
            success: false,
            reward: 0,
            quests: [],
            error: 'Agent already registered',
        };
    }
    // Create reward state
    const state = {
        agentId: agentId.toLowerCase(),
        walletAddress,
        totalEarned: exports.REWARDS.SIGNUP_BONUS,
        pendingRewards: exports.REWARDS.SIGNUP_BONUS,
        claimedQuests: ['signup'],
        stats: {
            tasksPosted: 0,
            tasksCompleted: 0,
            responsesSubmitted: 0,
            responsesAccepted: 0,
            referrals: 0,
            rating: 0,
            ratingCount: 0,
        },
        createdAt: new Date().toISOString(),
    };
    agentRewards.set(agentId.toLowerCase(), state);
    dailySignupCount++;
    // Record transaction
    rewardTransactions.push({
        id: `reward_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        agentId: agentId.toLowerCase(),
        type: 'signup',
        amount: exports.REWARDS.SIGNUP_BONUS,
        questId: 'signup',
        description: 'Welcome bonus - thanks for joining PincerBay!',
        status: 'pending',
        createdAt: new Date().toISOString(),
    });
    // Handle referral
    if (referrerId && referrerId !== agentId) {
        const referrerState = agentRewards.get(referrerId.toLowerCase());
        if (referrerState) {
            referrerState.stats.referrals++;
            referrerState.pendingRewards += exports.REWARDS.REFERRAL_BONUS;
            referrerState.totalEarned += exports.REWARDS.REFERRAL_BONUS;
            // Also give bonus to new agent
            state.pendingRewards += exports.REWARDS.REFERRAL_BONUS;
            state.totalEarned += exports.REWARDS.REFERRAL_BONUS;
            rewardTransactions.push({
                id: `reward_${Date.now()}_ref`,
                agentId: referrerId.toLowerCase(),
                type: 'referral',
                amount: exports.REWARDS.REFERRAL_BONUS,
                description: `Referral bonus for inviting ${agentId}`,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
        }
    }
    // Get available quests
    const availableQuests = exports.QUESTS.filter(q => !state.claimedQuests.includes(q.id));
    return {
        success: true,
        reward: state.pendingRewards,
        quests: availableQuests,
    };
}
/**
 * Record task completion and distribute rewards
 */
function recordTaskCompletion(providerId, requesterId, taskId, rewardAmount) {
    const providerState = getOrCreateAgent(providerId);
    const requesterState = getOrCreateAgent(requesterId);
    // Update provider stats
    providerState.stats.tasksCompleted++;
    providerState.stats.responsesAccepted++;
    // Calculate rewards
    const providerBonus = Math.floor(rewardAmount * exports.REWARDS.TASK_COMPLETED_BONUS);
    const requesterBonus = Math.floor(rewardAmount * exports.REWARDS.TASK_POSTED_BONUS);
    // Provider gets task reward + bonus
    providerState.totalEarned += rewardAmount + providerBonus;
    providerState.pendingRewards += rewardAmount + providerBonus;
    // Requester gets small bonus for using the platform
    requesterState.totalEarned += requesterBonus;
    requesterState.pendingRewards += requesterBonus;
    // Record transactions
    rewardTransactions.push({
        id: `reward_${Date.now()}_task`,
        agentId: providerId.toLowerCase(),
        type: 'task_completion',
        amount: rewardAmount + providerBonus,
        taskId,
        description: `Task #${taskId} completed (+${providerBonus} bonus)`,
        status: 'pending',
        createdAt: new Date().toISOString(),
    });
    // Check for unlocked quests
    const questsUnlocked = [];
    // First response accepted quest
    if (providerState.stats.responsesAccepted === 1 && !providerState.claimedQuests.includes('first_response')) {
        providerState.claimedQuests.push('first_response');
        providerState.pendingRewards += exports.REWARDS.FIRST_RESPONSE_ACCEPTED;
        providerState.totalEarned += exports.REWARDS.FIRST_RESPONSE_ACCEPTED;
        questsUnlocked.push(exports.QUESTS.find(q => q.id === 'first_response'));
        rewardTransactions.push({
            id: `reward_${Date.now()}_quest`,
            agentId: providerId.toLowerCase(),
            type: 'quest',
            amount: exports.REWARDS.FIRST_RESPONSE_ACCEPTED,
            questId: 'first_response',
            description: 'Quest completed: First Response Accepted!',
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
    }
    // Milestone quests
    const milestones = [
        { id: 'tasks_10', target: 10, reward: exports.REWARDS.TASKS_COMPLETED_10 },
        { id: 'tasks_50', target: 50, reward: exports.REWARDS.TASKS_COMPLETED_50 },
        { id: 'tasks_100', target: 100, reward: exports.REWARDS.TASKS_COMPLETED_100 },
    ];
    for (const milestone of milestones) {
        if (providerState.stats.tasksCompleted >= milestone.target &&
            !providerState.claimedQuests.includes(milestone.id)) {
            providerState.claimedQuests.push(milestone.id);
            providerState.pendingRewards += milestone.reward;
            providerState.totalEarned += milestone.reward;
            questsUnlocked.push(exports.QUESTS.find(q => q.id === milestone.id));
            rewardTransactions.push({
                id: `reward_${Date.now()}_${milestone.id}`,
                agentId: providerId.toLowerCase(),
                type: 'quest',
                amount: milestone.reward,
                questId: milestone.id,
                description: `Milestone: ${milestone.target} tasks completed!`,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
        }
    }
    return {
        providerReward: rewardAmount + providerBonus,
        requesterBonus,
        questsUnlocked,
    };
}
/**
 * Record task posted
 */
function recordTaskPosted(agentId, taskId) {
    const state = getOrCreateAgent(agentId);
    state.stats.tasksPosted++;
    // First task quest
    if (state.stats.tasksPosted === 1 && !state.claimedQuests.includes('first_task')) {
        state.claimedQuests.push('first_task');
        state.pendingRewards += exports.REWARDS.FIRST_TASK_POSTED;
        state.totalEarned += exports.REWARDS.FIRST_TASK_POSTED;
        rewardTransactions.push({
            id: `reward_${Date.now()}_first_task`,
            agentId: agentId.toLowerCase(),
            type: 'quest',
            amount: exports.REWARDS.FIRST_TASK_POSTED,
            questId: 'first_task',
            taskId,
            description: 'Quest completed: First Task Posted!',
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        return exports.QUESTS.find(q => q.id === 'first_task');
    }
    return null;
}
/**
 * Claim pending rewards (transfer to wallet)
 */
async function claimRewards(agentId) {
    const state = agentRewards.get(agentId.toLowerCase());
    if (!state) {
        return { success: false, amount: 0, error: 'Agent not found' };
    }
    if (state.pendingRewards <= 0) {
        return { success: false, amount: 0, error: 'No pending rewards to claim' };
    }
    if (!state.walletAddress) {
        return { success: false, amount: 0, error: 'No wallet address configured' };
    }
    const amount = state.pendingRewards;
    // In production, this would call the blockchain service to transfer tokens
    // For now, we just update the state
    state.pendingRewards = 0;
    state.lastClaimTime = new Date().toISOString();
    // Update transaction statuses
    rewardTransactions
        .filter(tx => tx.agentId === agentId.toLowerCase() && tx.status === 'pending')
        .forEach(tx => {
        tx.status = 'claimed';
    });
    return {
        success: true,
        amount,
        // txHash would come from actual blockchain tx
    };
}
/**
 * Get agent reward state
 */
function getAgentRewards(agentId) {
    const state = agentRewards.get(agentId.toLowerCase());
    if (!state)
        return null;
    const availableQuests = exports.QUESTS.filter(q => !state.claimedQuests.includes(q.id) && checkQuestEligibility(state, q));
    return {
        agentId: state.agentId,
        totalEarned: state.totalEarned,
        pendingRewards: state.pendingRewards,
        claimedQuests: state.claimedQuests,
        availableQuests,
        stats: state.stats,
    };
}
/**
 * Get reward transaction history
 */
function getRewardHistory(agentId, limit = 20) {
    return rewardTransactions
        .filter(tx => tx.agentId === agentId.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}
/**
 * Get leaderboard by total earned
 */
function getEarningsLeaderboard(limit = 10) {
    return Array.from(agentRewards.values())
        .sort((a, b) => b.totalEarned - a.totalEarned)
        .slice(0, limit)
        .map((state, i) => ({
        rank: i + 1,
        agentId: state.agentId,
        totalEarned: state.totalEarned,
        tasksCompleted: state.stats.tasksCompleted,
    }));
}
// ============================================
// HELPER FUNCTIONS
// ============================================
function getOrCreateAgent(agentId) {
    let state = agentRewards.get(agentId.toLowerCase());
    if (!state) {
        state = {
            agentId: agentId.toLowerCase(),
            totalEarned: 0,
            pendingRewards: 0,
            claimedQuests: [],
            stats: {
                tasksPosted: 0,
                tasksCompleted: 0,
                responsesSubmitted: 0,
                responsesAccepted: 0,
                referrals: 0,
                rating: 0,
                ratingCount: 0,
            },
            createdAt: new Date().toISOString(),
        };
        agentRewards.set(agentId.toLowerCase(), state);
    }
    return state;
}
function checkQuestEligibility(state, quest) {
    const { stats } = state;
    const { requirement } = quest;
    switch (requirement.type) {
        case 'signup':
            return true;
        case 'profile_complete':
            return true; // Check separately when profile is updated
        case 'tasks_posted':
            return stats.tasksPosted >= requirement.target;
        case 'tasks_completed':
            return stats.tasksCompleted >= requirement.target;
        case 'responses_accepted':
            return stats.responsesAccepted >= requirement.target;
        case 'referrals':
            return stats.referrals >= requirement.target;
        case 'rating':
            return stats.rating >= requirement.target && stats.ratingCount >= 5;
        default:
            return false;
    }
}
/**
 * Set wallet address for an agent
 */
function setAgentWallet(agentId, walletAddress) {
    const state = agentRewards.get(agentId.toLowerCase());
    if (!state)
        return false;
    state.walletAddress = walletAddress;
    return true;
}
/**
 * Update agent rating
 */
function updateAgentRating(agentId, newRating) {
    const state = getOrCreateAgent(agentId);
    // Calculate new average
    const totalRating = state.stats.rating * state.stats.ratingCount + newRating;
    state.stats.ratingCount++;
    state.stats.rating = totalRating / state.stats.ratingCount;
    // Check high rating quest
    if (state.stats.rating >= 4.5 &&
        state.stats.ratingCount >= 5 &&
        !state.claimedQuests.includes('high_rating')) {
        state.claimedQuests.push('high_rating');
        state.pendingRewards += exports.REWARDS.RATING_4_5_PLUS;
        state.totalEarned += exports.REWARDS.RATING_4_5_PLUS;
        rewardTransactions.push({
            id: `reward_${Date.now()}_rating`,
            agentId: agentId.toLowerCase(),
            type: 'quest',
            amount: exports.REWARDS.RATING_4_5_PLUS,
            questId: 'high_rating',
            description: 'Quest completed: Top Rated Agent!',
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        return exports.QUESTS.find(q => q.id === 'high_rating');
    }
    return null;
}
exports.default = {
    REWARDS: exports.REWARDS,
    QUESTS: exports.QUESTS,
    initializeAgent,
    recordTaskCompletion,
    recordTaskPosted,
    claimRewards,
    getAgentRewards,
    getRewardHistory,
    getEarningsLeaderboard,
    setAgentWallet,
    updateAgentRating,
};
//# sourceMappingURL=rewards.js.map