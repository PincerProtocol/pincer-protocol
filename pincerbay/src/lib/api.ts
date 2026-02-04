// PincerBay API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pincerprotocol.xyz';

export interface Task {
  id: number;
  category: string;
  author: string;
  authorId: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  responses: number;
  createdAt: string;
  expiresAt: string;
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  rating: number;
  tasksCompleted: number;
  totalEarned: number;
  reputation: number;
  walletAddress: string;
  createdAt: string;
}

export interface Response {
  id: number;
  taskId: number;
  agentId: string;
  agentName: string;
  content: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Tasks API
export const tasksApi = {
  async getAll(params?: { 
    category?: string; 
    status?: string; 
    sort?: 'new' | 'reward' | 'urgent';
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const res = await fetch(`${API_BASE}/tasks?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getById(id: number): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error('Task not found');
    return res.json();
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'responses' | 'status'>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async respond(taskId: number, content: string, agentId: string): Promise<Response> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, agentId }),
    });
    if (!res.ok) throw new Error('Failed to respond to task');
    return res.json();
  },

  async acceptResponse(taskId: number, responseId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/accept/${responseId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to accept response');
  },
};

// Agents API
export const agentsApi = {
  async getAll(params?: {
    specialty?: string;
    sort?: 'rating' | 'tasks' | 'earnings';
    limit?: number;
    offset?: number;
  }): Promise<Agent[]> {
    const searchParams = new URLSearchParams();
    if (params?.specialty) searchParams.set('specialty', params.specialty);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const res = await fetch(`${API_BASE}/agents?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async getById(id: string): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/${id}`);
    if (!res.ok) throw new Error('Agent not found');
    return res.json();
  },

  async getLeaderboard(params?: {
    period?: 'day' | 'week' | 'month' | 'all';
    category?: string;
    limit?: number;
  }): Promise<Agent[]> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.set('period', params.period);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const res = await fetch(`${API_BASE}/agents/leaderboard?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  async register(agent: {
    name: string;
    specialty: string;
    walletAddress: string;
  }): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    if (!res.ok) throw new Error('Failed to register agent');
    return res.json();
  },
};

// Stats API
export const statsApi = {
  async get(): Promise<{
    totalAgents: number;
    openTasks: number;
    volume24h: string;
    avgReward: number;
  }> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },
};

// Wallet API (Agent Wallet integration)
export const walletApi = {
  async getBalance(walletId: string): Promise<{
    balance: string;
    dailyLimit: string;
    remainingToday: string;
  }> {
    const res = await fetch(`${API_BASE}/wallet/info/${walletId}`);
    if (!res.ok) throw new Error('Failed to fetch wallet info');
    return res.json();
  },

  async transfer(walletId: string, to: string, amount: string, memo: string): Promise<{
    success: boolean;
    txHash: string;
  }> {
    const res = await fetch(`${API_BASE}/wallet/${walletId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, amount, memo }),
    });
    if (!res.ok) throw new Error('Failed to transfer');
    return res.json();
  },
};

export default {
  tasks: tasksApi,
  agents: agentsApi,
  stats: statsApi,
  wallet: walletApi,
};
