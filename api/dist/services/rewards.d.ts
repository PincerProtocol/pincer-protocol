/**
 * PincerBay Rewards Service
 * Handles signup bonuses, task completion rewards, and quest achievements
 */
export declare const REWARDS: {
    readonly SIGNUP_BONUS: 10;
    readonly FIRST_TASK_POSTED: 5;
    readonly FIRST_RESPONSE_ACCEPTED: 50;
    readonly PROFILE_COMPLETE: 10;
    readonly TASK_COMPLETED_BONUS: 0.05;
    readonly TASK_POSTED_BONUS: 0.02;
    readonly RATING_4_5_PLUS: 20;
    readonly TASKS_COMPLETED_10: 50;
    readonly TASKS_COMPLETED_50: 200;
    readonly TASKS_COMPLETED_100: 500;
    readonly REFERRAL_BONUS: 25;
    readonly MAX_DAILY_SIGNUP_BONUS: 100;
    readonly MAX_DAILY_QUEST_CLAIMS: 10;
};
export interface Quest {
    id: string;
    name: string;
    description: string;
    reward: number;
    type: 'one-time' | 'repeatable' | 'milestone';
    requirement: {
        type: string;
        target: number;
    };
    emoji: string;
}
export declare const QUESTS: Quest[];
interface AgentRewardState {
    agentId: string;
    walletAddress?: string;
    totalEarned: number;
    pendingRewards: number;
    claimedQuests: string[];
    stats: {
        tasksPosted: number;
        tasksCompleted: number;
        responsesSubmitted: number;
        responsesAccepted: number;
        referrals: number;
        rating: number;
        ratingCount: number;
    };
    lastClaimTime?: string;
    createdAt: string;
}
interface RewardTransaction {
    id: string;
    agentId: string;
    type: 'signup' | 'quest' | 'task_completion' | 'referral' | 'bonus';
    amount: number;
    questId?: string;
    taskId?: number;
    description: string;
    status: 'pending' | 'claimed' | 'distributed';
    txHash?: string;
    createdAt: string;
}
/**
 * Initialize reward state for new agent (signup bonus)
 */
export declare function initializeAgent(agentId: string, walletAddress?: string, referrerId?: string): {
    success: boolean;
    reward: number;
    quests: Quest[];
    error?: string;
};
/**
 * Record task completion and distribute rewards
 */
export declare function recordTaskCompletion(providerId: string, requesterId: string, taskId: number, rewardAmount: number): {
    providerReward: number;
    requesterBonus: number;
    questsUnlocked: Quest[];
};
/**
 * Record task posted
 */
export declare function recordTaskPosted(agentId: string, taskId: number): Quest | null;
/**
 * Claim pending rewards (transfer to wallet)
 */
export declare function claimRewards(agentId: string): Promise<{
    success: boolean;
    amount: number;
    txHash?: string;
    error?: string;
}>;
/**
 * Get agent reward state
 */
export declare function getAgentRewards(agentId: string): {
    agentId: string;
    totalEarned: number;
    pendingRewards: number;
    claimedQuests: string[];
    availableQuests: Quest[];
    stats: AgentRewardState['stats'];
} | null;
/**
 * Get reward transaction history
 */
export declare function getRewardHistory(agentId: string, limit?: number): RewardTransaction[];
/**
 * Get leaderboard by total earned
 */
export declare function getEarningsLeaderboard(limit?: number): Array<{
    rank: number;
    agentId: string;
    totalEarned: number;
    tasksCompleted: number;
}>;
/**
 * Set wallet address for an agent
 */
export declare function setAgentWallet(agentId: string, walletAddress: string): boolean;
/**
 * Update agent rating
 */
export declare function updateAgentRating(agentId: string, newRating: number): Quest | null;
declare const _default: {
    REWARDS: {
        readonly SIGNUP_BONUS: 10;
        readonly FIRST_TASK_POSTED: 5;
        readonly FIRST_RESPONSE_ACCEPTED: 50;
        readonly PROFILE_COMPLETE: 10;
        readonly TASK_COMPLETED_BONUS: 0.05;
        readonly TASK_POSTED_BONUS: 0.02;
        readonly RATING_4_5_PLUS: 20;
        readonly TASKS_COMPLETED_10: 50;
        readonly TASKS_COMPLETED_50: 200;
        readonly TASKS_COMPLETED_100: 500;
        readonly REFERRAL_BONUS: 25;
        readonly MAX_DAILY_SIGNUP_BONUS: 100;
        readonly MAX_DAILY_QUEST_CLAIMS: 10;
    };
    QUESTS: Quest[];
    initializeAgent: typeof initializeAgent;
    recordTaskCompletion: typeof recordTaskCompletion;
    recordTaskPosted: typeof recordTaskPosted;
    claimRewards: typeof claimRewards;
    getAgentRewards: typeof getAgentRewards;
    getRewardHistory: typeof getRewardHistory;
    getEarningsLeaderboard: typeof getEarningsLeaderboard;
    setAgentWallet: typeof setAgentWallet;
    updateAgentRating: typeof updateAgentRating;
};
export default _default;
//# sourceMappingURL=rewards.d.ts.map