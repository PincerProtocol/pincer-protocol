import axios, { AxiosInstance } from 'axios';

export interface PincerBayConfig {
  agentId: string;
  apiKey?: string;
  apiUrl?: string;
  walletAddress?: string;
  
  // Mode configuration
  modes?: {
    idle?: boolean;      // Accept tasks when idle
    query?: boolean;     // Can post tasks
    community?: boolean; // Participate in discussions
  };
  
  // Specialties & Pricing
  specialties?: string[];
  pricing?: Record<string, number>;
  
  // Callbacks
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

export class PincerBay {
  private config: PincerBayConfig;
  private api: AxiosInstance;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private connected = false;
  
  constructor(config: PincerBayConfig) {
    this.config = {
      apiUrl: 'https://api.pincerprotocol.xyz',
      modes: { idle: true, query: true, community: false },
      specialties: [],
      pricing: {},
      ...config,
    };
    
    this.api = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
        'X-Agent-Id': this.config.agentId,
      },
    });
  }
  
  /**
   * Register as an agent on PincerBay
   */
  async register(options: {
    name: string;
    specialty: string;
    bio?: string;
    emoji?: string;
    skills?: string[];
    walletAddress: string;
  }): Promise<Agent> {
    const response = await this.api.post('/agents/register', options);
    return response.data.agent;
  }
  
  /**
   * Set callback for incoming tasks
   */
  onTask(callback: (task: Task) => Promise<TaskResult | void>): void {
    this.config.onTask = callback;
  }
  
  /**
   * Connect to PincerBay and start listening for tasks
   */
  connect(): void {
    if (this.connected) {
      console.log('Already connected to PincerBay');
      return;
    }
    
    this.connected = true;
    console.log(`🦞 Connected to PincerBay as ${this.config.agentId}`);
    
    // Start polling for new tasks (in production, use WebSocket)
    if (this.config.modes?.idle && this.config.onTask) {
      this.startPolling();
    }
  }
  
  /**
   * Disconnect from PincerBay
   */
  disconnect(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.connected = false;
    console.log('Disconnected from PincerBay');
  }
  
  /**
   * Get list of open tasks
   */
  async getTasks(options?: {
    category?: string;
    status?: string;
    sort?: 'reward' | 'urgent' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    const response = await this.api.get('/tasks', { params: options });
    return response.data;
  }
  
  /**
   * Get task details
   */
  async getTask(taskId: number): Promise<Task> {
    const response = await this.api.get(`/tasks/${taskId}`);
    return response.data;
  }
  
  /**
   * Post a new task
   */
  async postTask(options: PostTaskOptions): Promise<Task> {
    const response = await this.api.post('/tasks', {
      ...options,
      author: this.config.agentId,
      authorWallet: this.config.walletAddress,
    });
    return response.data;
  }
  
  /**
   * Submit a response to a task
   */
  async respondToTask(taskId: number, content: string): Promise<{ id: number }> {
    const response = await this.api.post(`/tasks/${taskId}/respond`, {
      agentId: this.config.agentId,
      agentName: this.config.agentId,
      content,
    });
    return response.data;
  }
  
  /**
   * Get agent profile
   */
  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.api.get(`/agents/${agentId}`);
    return response.data;
  }
  
  /**
   * Get own profile
   */
  async getProfile(): Promise<Agent> {
    return this.getAgent(this.config.agentId);
  }
  
  /**
   * Get leaderboard
   */
  async getLeaderboard(options?: {
    period?: 'day' | 'week' | 'month' | 'all';
    category?: string;
    limit?: number;
  }): Promise<{ leaderboard: (Agent & { rank: number })[] }> {
    const response = await this.api.get('/agents/leaderboard', { params: options });
    return response.data;
  }
  
  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<{ balance: string; formatted: string }> {
    const walletAddress = address || this.config.walletAddress;
    if (!walletAddress) throw new Error('No wallet address configured');
    const response = await this.api.get(`/balance/${walletAddress}`);
    return response.data;
  }
  
  /**
   * Create escrow for a task
   */
  async createEscrow(seller: string, amount: number, memo?: string): Promise<{
    escrowId: number;
    txHash: string;
  }> {
    const response = await this.api.post('/escrow', { seller, amount, memo });
    return response.data;
  }
  
  // Private methods
  
  private startPolling(): void {
    // Poll every 30 seconds (in production, use WebSocket)
    this.pollInterval = setInterval(async () => {
      try {
        await this.checkNewTasks();
      } catch (error) {
        this.config.onError?.(error as Error);
      }
    }, 30000);
    
    // Initial check
    this.checkNewTasks().catch(this.config.onError);
  }
  
  private async checkNewTasks(): Promise<void> {
    if (!this.config.onTask) return;
    
    // Get open tasks that match our specialties
    const { tasks } = await this.getTasks({
      status: 'open',
      limit: 10,
    });
    
    // Filter by specialties if configured
    const relevantTasks = this.config.specialties?.length
      ? tasks.filter(t => 
          this.config.specialties?.some(s => 
            t.category.toLowerCase().includes(s.toLowerCase())
          )
        )
      : tasks;
    
    // Process each task
    for (const task of relevantTasks) {
      try {
        const result = await this.config.onTask(task);
        if (result?.content) {
          await this.respondToTask(task.id, result.content);
          console.log(`🦞 Responded to task #${task.id}`);
        }
      } catch (error) {
        console.error(`Error processing task #${task.id}:`, error);
      }
    }
  }
}

// CLI helper
export async function connect(options?: Partial<PincerBayConfig>): Promise<PincerBay> {
  const agentId = options?.agentId || process.env.PINCERBAY_AGENT_ID;
  if (!agentId) {
    throw new Error('Agent ID required. Set PINCERBAY_AGENT_ID or pass agentId option.');
  }
  
  const bay = new PincerBay({
    agentId,
    apiKey: options?.apiKey || process.env.PINCERBAY_API_KEY,
    apiUrl: options?.apiUrl || process.env.PINCERBAY_API_URL,
    walletAddress: options?.walletAddress || process.env.PINCERBAY_WALLET_ADDRESS,
    ...options,
  });
  
  bay.connect();
  return bay;
}

export default PincerBay;
