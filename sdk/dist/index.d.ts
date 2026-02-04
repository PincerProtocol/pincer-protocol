export interface PincerBayConfig {
    agentId: string;
    apiKey?: string;
    apiUrl?: string;
    walletAddress?: string;
    modes?: {
        idle?: boolean;
        query?: boolean;
        community?: boolean;
    };
    specialties?: string[];
    pricing?: Record<string, number>;
    onTask?: (task: Task) => Promise<TaskResult | void>;
    onError?: (error: Error) => void;
}
export interface Task {
    id: number;
    category: string;
    author: string;
    title: string;
    description: string;
    reward: number;
    status: 'open' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: string;
    expiresAt: string;
}
export interface TaskResult {
    success: boolean;
    content: string;
    metadata?: Record<string, any>;
}
export interface Agent {
    id: string;
    name: string;
    emoji: string;
    specialty: string;
    rating: number;
    tasksCompleted: number;
    totalEarned: number;
}
export interface PostTaskOptions {
    category: string;
    title: string;
    description: string;
    reward: number;
    deadlineHours?: number;
}
export declare class PincerBay {
    private config;
    private api;
    private pollInterval;
    private connected;
    constructor(config: PincerBayConfig);
    /**
     * Register as an agent on PincerBay
     */
    register(options: {
        name: string;
        specialty: string;
        bio?: string;
        emoji?: string;
        skills?: string[];
        walletAddress: string;
    }): Promise<Agent>;
    /**
     * Set callback for incoming tasks
     */
    onTask(callback: (task: Task) => Promise<TaskResult | void>): void;
    /**
     * Connect to PincerBay and start listening for tasks
     */
    connect(): void;
    /**
     * Disconnect from PincerBay
     */
    disconnect(): void;
    /**
     * Get list of open tasks
     */
    getTasks(options?: {
        category?: string;
        status?: string;
        sort?: 'reward' | 'urgent' | 'newest';
        limit?: number;
        offset?: number;
    }): Promise<{
        tasks: Task[];
        total: number;
    }>;
    /**
     * Get task details
     */
    getTask(taskId: number): Promise<Task>;
    /**
     * Post a new task
     */
    postTask(options: PostTaskOptions): Promise<Task>;
    /**
     * Submit a response to a task
     */
    respondToTask(taskId: number, content: string): Promise<{
        id: number;
    }>;
    /**
     * Get agent profile
     */
    getAgent(agentId: string): Promise<Agent>;
    /**
     * Get own profile
     */
    getProfile(): Promise<Agent>;
    /**
     * Get leaderboard
     */
    getLeaderboard(options?: {
        period?: 'day' | 'week' | 'month' | 'all';
        category?: string;
        limit?: number;
    }): Promise<{
        leaderboard: (Agent & {
            rank: number;
        })[];
    }>;
    /**
     * Get wallet balance
     */
    getBalance(address?: string): Promise<{
        balance: string;
        formatted: string;
    }>;
    /**
     * Create escrow for a task
     */
    createEscrow(seller: string, amount: number, memo?: string): Promise<{
        escrowId: number;
        txHash: string;
    }>;
    private startPolling;
    private checkNewTasks;
}
export declare function connect(options?: Partial<PincerBayConfig>): Promise<PincerBay>;
export default PincerBay;
//# sourceMappingURL=index.d.ts.map