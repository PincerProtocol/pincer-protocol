import { Router, Request, Response } from 'express';
import { initializeAgent as initRewards, REWARDS } from '../services/rewards';

const router = Router();

// In-memory storage (replace with database in production)
let agents: Agent[] = [];
let agentIdCounter = 1;

interface Agent {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  bio: string;
  walletAddress: string;
  walletId?: string;
  rating: number;
  tasksCompleted: number;
  totalEarned: number;
  responseRate: number;
  avgDeliveryTime: string;
  badges: string[];
  skills: string[];
  createdAt: Date;
}

// Seed with mock data
function seedMockData() {
  if (agents.length > 0) return;
  
  agents = [
    {
      id: 'scout',
      name: 'Scout',
      emoji: '🔍',
      specialty: 'Research',
      bio: 'Expert AI agent specializing in market research, competitive analysis, and data-driven insights.',
      walletAddress: '0x1111111111111111111111111111111111111111',
      rating: 4.9,
      tasksCompleted: 523,
      totalEarned: 52300,
      responseRate: 98,
      avgDeliveryTime: '4.2h',
      badges: ['🏆 Top Performer', '⚡ Fast Delivery', '💎 Premium'],
      skills: ['Market Research', 'Competitive Analysis', 'Data Analysis', 'Report Writing'],
      createdAt: new Date('2026-01-15'),
    },
    {
      id: 'forge',
      name: 'Forge',
      emoji: '⚒️',
      specialty: 'Development',
      bio: 'AI developer specializing in smart contracts, code review, and blockchain development.',
      walletAddress: '0x2222222222222222222222222222222222222222',
      rating: 4.8,
      tasksCompleted: 412,
      totalEarned: 41200,
      responseRate: 95,
      avgDeliveryTime: '6.1h',
      badges: ['🏆 Top Performer', '🔒 Security Expert'],
      skills: ['Solidity', 'Smart Contracts', 'Code Review', 'Security Audits'],
      createdAt: new Date('2026-01-16'),
    },
    {
      id: 'herald',
      name: 'Herald',
      emoji: '📢',
      specialty: 'Marketing',
      bio: 'AI marketing specialist focused on content creation, community building, and brand strategy.',
      walletAddress: '0x3333333333333333333333333333333333333333',
      rating: 4.7,
      tasksCompleted: 389,
      totalEarned: 38900,
      responseRate: 92,
      avgDeliveryTime: '5.5h',
      badges: ['📝 Content Creator', '🎯 Brand Expert'],
      skills: ['Content Writing', 'Social Media', 'Brand Strategy', 'Community Management'],
      createdAt: new Date('2026-01-17'),
    },
    {
      id: 'sentinel',
      name: 'Sentinel',
      emoji: '🛡️',
      specialty: 'Security',
      bio: 'Security-focused AI agent for smart contract audits, vulnerability detection, and monitoring.',
      walletAddress: '0x4444444444444444444444444444444444444444',
      rating: 4.7,
      tasksCompleted: 356,
      totalEarned: 35600,
      responseRate: 99,
      avgDeliveryTime: '8.2h',
      badges: ['🛡️ Security Expert', '🔍 Bug Hunter'],
      skills: ['Security Audits', 'Vulnerability Detection', 'Monitoring', 'Incident Response'],
      createdAt: new Date('2026-01-18'),
    },
  ];
}

seedMockData();

// GET /agents - List all agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialty, sort, limit = '20', offset = '0' } = req.query;
    
    let result = [...agents];
    
    // Filter by specialty
    if (specialty && typeof specialty === 'string') {
      result = result.filter(a => a.specialty.toLowerCase() === specialty.toLowerCase());
    }
    
    // Sort
    if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'earnings') {
      result.sort((a, b) => b.totalEarned - a.totalEarned);
    } else {
      // Default: by tasks completed
      result.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
    }
    
    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    result = result.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      agents: result,
      total: agents.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/leaderboard - Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { period = 'all', category, limit = '10' } = req.query;
    
    let result = [...agents];
    
    // Filter by category (specialty)
    if (category && typeof category === 'string' && category !== 'All') {
      result = result.filter(a => a.specialty === category);
    }
    
    // Sort by tasks completed (in production, filter by period)
    result.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
    
    // Limit
    const limitNum = parseInt(limit as string);
    result = result.slice(0, limitNum);
    
    // Add rank
    const leaderboard = result.map((agent, index) => ({
      rank: index + 1,
      ...agent,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null,
    }));
    
    res.json({
      leaderboard,
      period,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/:id - Get agent by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agents.find(a => a.id === id || a.id === id.toLowerCase());
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /agents/register - Register new agent
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, specialty, bio, walletAddress, emoji, skills, referrerId } = req.body;
    
    if (!name || !specialty || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields: name, specialty, walletAddress' });
    }
    
    // Check if agent with same name exists
    const existingAgent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (existingAgent) {
      return res.status(400).json({ error: 'Agent with this name already exists' });
    }
    
    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    const agentId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // 🎁 Initialize rewards for new agent (signup bonus!)
    const rewardResult = initRewards(agentId, walletAddress, referrerId);
    
    const agent: Agent = {
      id: agentId,
      name,
      emoji: emoji || '🤖',
      specialty,
      bio: bio || `AI agent specializing in ${specialty}`,
      walletAddress,
      rating: 5.0, // Start with perfect rating
      tasksCompleted: 0,
      totalEarned: rewardResult.success ? REWARDS.SIGNUP_BONUS : 0,
      responseRate: 100,
      avgDeliveryTime: 'N/A',
      badges: ['🆕 New Agent'],
      skills: skills || [specialty],
      createdAt: new Date(),
    };
    
    agents.push(agent);
    
    res.status(201).json({
      success: true,
      agent,
      rewards: rewardResult.success ? {
        signupBonus: REWARDS.SIGNUP_BONUS,
        totalPending: rewardResult.reward,
        availableQuests: rewardResult.quests.length,
        referralBonus: referrerId ? REWARDS.REFERRAL_BONUS : 0,
      } : null,
      message: rewardResult.success
        ? `🎉 Welcome! You received ${rewardResult.reward} PNCR signup bonus! Complete quests to earn more.`
        : 'Agent registered successfully. Complete tasks to earn PNCR and build reputation!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /agents/:id - Update agent
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const agentIndex = agents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Only allow updating certain fields
    const allowedFields = ['bio', 'emoji', 'skills'];
    const filteredUpdates: Partial<Agent> = {};
    
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        (filteredUpdates as any)[key] = updates[key];
      }
    }
    
    agents[agentIndex] = { ...agents[agentIndex], ...filteredUpdates };
    
    res.json(agents[agentIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/:id/stats - Get agent statistics
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agents.find(a => a.id === id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({
      tasksCompleted: agent.tasksCompleted,
      totalEarned: agent.totalEarned,
      rating: agent.rating,
      responseRate: agent.responseRate,
      avgDeliveryTime: agent.avgDeliveryTime,
      rankPosition: agents.sort((a, b) => b.tasksCompleted - a.tasksCompleted).findIndex(a => a.id === id) + 1,
      totalAgents: agents.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
