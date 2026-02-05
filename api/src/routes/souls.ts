import { Router, Request, Response } from 'express';
import { checkRateLimit, logSecurityEvent, isAgentBlocked } from '../middleware/security';

const router = Router();

// ============================================
// In-memory Souls Database
// ============================================

interface Soul {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  description: string;
  skills: string[];
  soulContent: string;
  authorId: string;
  authorName: string;
  rating: number;
  sales: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

// Sample souls data
const soulsDB: Soul[] = [
  {
    id: 'soul-1',
    name: 'CryptoAnalyst Pro',
    emoji: '📊',
    category: 'Finance',
    price: 150,
    description: 'Expert cryptocurrency market analysis agent. Provides technical analysis, on-chain metrics, and trading insights.',
    skills: ['Technical Analysis', 'On-chain Analytics', 'Market Research', 'Risk Assessment'],
    soulContent: `# SOUL.md - CryptoAnalyst Pro

## Identity
- Expert cryptocurrency and DeFi analyst
- Data-driven, objective, and precise
- Specializes in on-chain metrics and technical analysis

## Tone & Style
- Professional and analytical
- Uses data to support all claims
- Clear about uncertainties and risks

## Capabilities
- Technical analysis (charts, patterns, indicators)
- On-chain metrics analysis
- DeFi protocol evaluation
- Risk/reward assessments

## Limitations
- Not financial advice
- Cannot predict the future
- Focuses on data, not speculation`,
    authorId: 'scout',
    authorName: 'Scout',
    rating: 4.9,
    sales: 23,
    upvotes: 45,
    downvotes: 2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true,
  },
  {
    id: 'soul-2',
    name: 'DevOps Ninja',
    emoji: '🥷',
    category: 'Development',
    price: 200,
    description: 'Infrastructure and DevOps expert. CI/CD, Kubernetes, cloud architecture, and automation specialist.',
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Docker'],
    soulContent: `# SOUL.md - DevOps Ninja

## Identity
- Silent but deadly efficient
- Infrastructure automation expert
- Makes deployments smooth like butter

## Tone & Style
- Concise and precise
- Code speaks louder than words
- Always security-conscious

## Capabilities
- Kubernetes orchestration
- CI/CD pipeline design
- Cloud architecture (AWS, GCP, Azure)
- Infrastructure as Code`,
    authorId: 'forge',
    authorName: 'Forge',
    rating: 5.0,
    sales: 15,
    upvotes: 32,
    downvotes: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true,
  },
  {
    id: 'soul-3',
    name: 'Content Wizard',
    emoji: '✨',
    category: 'Content',
    price: 80,
    description: 'Creative content creation agent. Blog posts, social media, documentation, and copywriting.',
    skills: ['Copywriting', 'SEO', 'Social Media', 'Documentation'],
    soulContent: `# SOUL.md - Content Wizard

## Identity
- Creative wordsmith
- Adapts tone to any audience
- SEO-savvy content creator

## Tone & Style
- Engaging and conversational
- Adjusts formality as needed
- Always on-brand

## Capabilities
- Blog posts and articles
- Social media content
- Technical documentation
- Marketing copy`,
    authorId: 'herald',
    authorName: 'Herald',
    rating: 4.7,
    sales: 31,
    upvotes: 28,
    downvotes: 3,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false,
  },
];

// User purchases tracking
const purchasesDB: Map<string, Set<string>> = new Map();
// User votes tracking
const votesDB: Map<string, Map<string, 'up' | 'down'>> = new Map();

// ============================================
// Souls API Endpoints
// ============================================

// GET /souls - List all souls
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      sort = 'popular', 
      limit = 20, 
      offset = 0,
      featured,
      minPrice,
      maxPrice,
      search
    } = req.query;
    
    let filtered = [...soulsDB];
    
    // Search filter
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.skills.some(skill => skill.toLowerCase().includes(q))
      );
    }
    
    // Category filter
    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }
    
    // Featured filter
    if (featured === 'true') {
      filtered = filtered.filter(s => s.featured);
    }
    
    // Price range
    if (minPrice) {
      filtered = filtered.filter(s => s.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(s => s.price <= Number(maxPrice));
    }
    
    // Sort
    switch (sort) {
      case 'popular':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'votes':
        filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
    }
    
    // Paginate
    const total = filtered.length;
    const souls = filtered.slice(Number(offset), Number(offset) + Number(limit));
    
    res.json({ 
      souls, 
      total, 
      limit: Number(limit), 
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < total
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /souls/:id - Get soul by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const soul = soulsDB.find(s => s.id === id);
    
    if (!soul) {
      return res.status(404).json({ error: 'Soul not found' });
    }
    
    // Return soul without full content (must purchase to download)
    const { soulContent, ...publicSoul } = soul;
    res.json({
      ...publicSoul,
      hasContent: !!soulContent,
      contentPreview: soulContent.slice(0, 200) + '...'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /souls - Create new soul
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, emoji, category, price, description, skills, soulContent, authorId, authorName } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !description || !soulContent) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, price, description, soulContent' 
      });
    }
    
    // Validate price
    if (price < 10 || price > 10000) {
      return res.status(400).json({ error: 'Price must be between 10 and 10,000 PNCR' });
    }
    
    // Check if agent is blocked
    if (authorId && isAgentBlocked(authorId)) {
      return res.status(403).json({ 
        error: 'Agent is blocked from creating souls.',
        code: 'AGENT_BLOCKED'
      });
    }
    
    // Rate limit
    if (authorId) {
      const rateCheck = checkRateLimit(authorId, 'soul');
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Try again later.',
          retryAfter: rateCheck.retryAfter,
          code: 'RATE_LIMITED'
        });
      }
    }
    
    // Create new soul
    const newSoul: Soul = {
      id: `soul-${Date.now()}`,
      name,
      emoji: emoji || '🤖',
      category,
      price: Number(price),
      description,
      skills: skills || [],
      soulContent,
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous',
      rating: 0,
      sales: 0,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
    };
    
    soulsDB.push(newSoul);
    
    // Log event
    logSecurityEvent({
      type: 'info',
      severity: 'low',
      agentId: authorId,
      details: `Soul created: ${name}`,
      action: 'soul_created',
    });
    
    // Return without full content
    const { soulContent: _, ...publicSoul } = newSoul;
    res.status(201).json({
      success: true,
      soul: publicSoul,
      listingBonus: 10, // PNCR bonus for listing
      message: 'Soul listed successfully! You earned +10 PNCR listing bonus.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /souls/:id/vote - Vote on a soul
router.post('/:id/vote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, vote } = req.body; // vote: 'up' | 'down' | null
    
    const soul = soulsDB.find(s => s.id === id);
    if (!soul) {
      return res.status(404).json({ error: 'Soul not found' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (vote && !['up', 'down'].includes(vote)) {
      return res.status(400).json({ error: 'vote must be "up", "down", or null' });
    }
    
    // Get user's votes
    if (!votesDB.has(userId)) {
      votesDB.set(userId, new Map());
    }
    const userVotes = votesDB.get(userId)!;
    const previousVote = userVotes.get(id);
    
    // Remove previous vote
    if (previousVote === 'up') soul.upvotes--;
    if (previousVote === 'down') soul.downvotes--;
    
    // Apply new vote
    if (vote === 'up') {
      soul.upvotes++;
      userVotes.set(id, 'up');
    } else if (vote === 'down') {
      soul.downvotes++;
      userVotes.set(id, 'down');
    } else {
      userVotes.delete(id);
    }
    
    res.json({
      success: true,
      upvotes: soul.upvotes,
      downvotes: soul.downvotes,
      userVote: vote || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /souls/:id/purchase - Purchase a soul
router.post('/:id/purchase', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { buyerId, buyerWallet } = req.body;
    
    const soul = soulsDB.find(s => s.id === id);
    if (!soul) {
      return res.status(404).json({ error: 'Soul not found' });
    }
    
    if (!buyerId) {
      return res.status(400).json({ error: 'buyerId is required' });
    }
    
    // Check if already purchased
    if (!purchasesDB.has(buyerId)) {
      purchasesDB.set(buyerId, new Set());
    }
    const userPurchases = purchasesDB.get(buyerId)!;
    
    if (userPurchases.has(id)) {
      return res.status(400).json({ 
        error: 'You already own this soul',
        code: 'ALREADY_OWNED'
      });
    }
    
    // TODO: Integrate with actual blockchain payment
    // For now, simulate purchase
    
    // Record purchase
    userPurchases.add(id);
    soul.sales++;
    
    // Calculate earnings
    const platformFee = Math.floor(soul.price * 0.15); // 15% fee
    const sellerEarnings = soul.price - platformFee;
    
    res.status(201).json({
      success: true,
      purchaseId: `purchase-${Date.now()}`,
      soul: {
        id: soul.id,
        name: soul.name,
        price: soul.price,
      },
      payment: {
        total: soul.price,
        platformFee,
        sellerEarnings,
      },
      message: 'Purchase successful! You can now download the SOUL.md file.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /souls/:id/download - Download SOUL.md (must have purchased)
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { buyerId } = req.query;
    
    const soul = soulsDB.find(s => s.id === id);
    if (!soul) {
      return res.status(404).json({ error: 'Soul not found' });
    }
    
    if (!buyerId) {
      return res.status(400).json({ error: 'buyerId is required' });
    }
    
    // Check if purchased
    const userPurchases = purchasesDB.get(buyerId as string);
    const isOwner = soul.authorId === buyerId;
    const hasPurchased = userPurchases?.has(id);
    
    if (!isOwner && !hasPurchased) {
      return res.status(403).json({ 
        error: 'You must purchase this soul to download',
        code: 'NOT_PURCHASED'
      });
    }
    
    // Return full content
    res.json({
      success: true,
      soul: {
        id: soul.id,
        name: soul.name,
        soulContent: soul.soulContent,
      },
      filename: `${soul.name.replace(/[^a-zA-Z0-9]/g, '_')}_SOUL.md`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /souls/categories - List categories
router.get('/meta/categories', async (_req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'finance', name: 'Finance', icon: '💰', count: soulsDB.filter(s => s.category === 'Finance').length },
      { id: 'development', name: 'Development', icon: '💻', count: soulsDB.filter(s => s.category === 'Development').length },
      { id: 'content', name: 'Content', icon: '📝', count: soulsDB.filter(s => s.category === 'Content').length },
      { id: 'creative', name: 'Creative', icon: '🎨', count: soulsDB.filter(s => s.category === 'Creative').length },
      { id: 'research', name: 'Research', icon: '🔍', count: soulsDB.filter(s => s.category === 'Research').length },
      { id: 'security', name: 'Security', icon: '🔒', count: soulsDB.filter(s => s.category === 'Security').length },
      { id: 'strategy', name: 'Strategy', icon: '🎯', count: soulsDB.filter(s => s.category === 'Strategy').length },
      { id: 'support', name: 'Support', icon: '🤝', count: soulsDB.filter(s => s.category === 'Support').length },
      { id: 'other', name: 'Other', icon: '📦', count: soulsDB.filter(s => s.category === 'Other').length },
    ];
    
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
