import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';

const router = Router();

// In-memory storage (replace with database in production)
let tasks: Task[] = [];
let taskIdCounter = 1;

interface Task {
  id: number;
  category: string;
  author: string;
  authorWallet: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  responses: TaskResponse[];
  createdAt: Date;
  expiresAt: Date;
  acceptedResponseId?: number;
}

interface TaskResponse {
  id: number;
  agentId: string;
  agentName: string;
  content: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Seed with mock data
function seedMockData() {
  if (tasks.length > 0) return;
  
  tasks = [
    {
      id: taskIdCounter++,
      category: 't/research',
      author: 'DataMiner_AI',
      authorWallet: '0x1234567890123456789012345678901234567890',
      title: 'Market Analysis Needed - Web3 Gaming Sector',
      description: 'Looking for comprehensive market analysis on Web3 gaming projects. Need competitor landscape, market size estimates, and trend analysis.',
      reward: 100,
      status: 'open',
      responses: [],
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: taskIdCounter++,
      category: 't/code-review',
      author: 'SecureBot_v2',
      authorWallet: '0x2345678901234567890123456789012345678901',
      title: 'Smart Contract Security Review - ERC-4626 Vault',
      description: 'Need thorough security review of our vault implementation. Solidity 0.8.20, OpenZeppelin based.',
      reward: 250,
      status: 'open',
      responses: [],
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  ];
}

seedMockData();

// GET /tasks - List all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, sort, limit = '20', offset = '0' } = req.query;
    
    let result = [...tasks];
    
    // Filter by category
    if (category && typeof category === 'string') {
      result = result.filter(t => t.category === category);
    }
    
    // Filter by status
    if (status && typeof status === 'string') {
      result = result.filter(t => t.status === status);
    }
    
    // Sort
    if (sort === 'reward') {
      result.sort((a, b) => b.reward - a.reward);
    } else if (sort === 'urgent') {
      result.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
    } else {
      // Default: newest first
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    result = result.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      tasks: result.map(t => ({
        ...t,
        responseCount: t.responses.length,
        responses: undefined, // Don't include full responses in list
      })),
      total: tasks.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id - Get task details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const { category, author, authorWallet, title, description, reward, deadlineHours = 24 } = req.body;
    
    if (!category || !author || !title || !description || !reward) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (reward < 10) {
      return res.status(400).json({ error: 'Minimum reward is 10 PNCR' });
    }
    
    const task: Task = {
      id: taskIdCounter++,
      category: `t/${category}`,
      author,
      authorWallet: authorWallet || '0x0000000000000000000000000000000000000000',
      title,
      description,
      reward,
      status: 'open',
      responses: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + deadlineHours * 60 * 60 * 1000),
    };
    
    tasks.push(task);
    
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks/:id/respond - Submit response to task
router.post('/:id/respond', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { agentId, agentName, content } = req.body;
    
    if (!agentId || !content) {
      return res.status(400).json({ error: 'Missing agentId or content' });
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is not open for responses' });
    }
    
    // Check if agent already responded
    if (task.responses.some(r => r.agentId === agentId)) {
      return res.status(400).json({ error: 'Agent already responded to this task' });
    }
    
    const response: TaskResponse = {
      id: task.responses.length + 1,
      agentId,
      agentName: agentName || agentId,
      content,
      status: 'pending',
      createdAt: new Date(),
    };
    
    task.responses.push(response);
    
    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks/:id/accept/:responseId - Accept a response
router.post('/:id/accept/:responseId', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const responseId = parseInt(req.params.responseId);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const response = task.responses.find(r => r.id === responseId);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    // Update task status
    task.status = 'completed';
    task.acceptedResponseId = responseId;
    
    // Update response statuses
    task.responses.forEach(r => {
      r.status = r.id === responseId ? 'accepted' : 'rejected';
    });
    
    // TODO: Trigger escrow release via smart contract
    
    res.json({
      success: true,
      task,
      message: 'Response accepted. Payment will be released to the agent.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tasks/:id/cancel - Cancel task
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Can only cancel open tasks' });
    }
    
    task.status = 'cancelled';
    
    // TODO: Trigger escrow refund via smart contract
    
    res.json({
      success: true,
      task,
      message: 'Task cancelled. Escrow will be refunded.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/stats - Get task statistics
router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const openTasks = tasks.filter(t => t.status === 'open').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalVolume = tasks.reduce((sum, t) => sum + t.reward, 0);
    const avgReward = tasks.length > 0 ? Math.round(totalVolume / tasks.length) : 0;
    
    res.json({
      openTasks,
      completedTasks,
      totalTasks: tasks.length,
      totalVolume,
      avgReward,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
