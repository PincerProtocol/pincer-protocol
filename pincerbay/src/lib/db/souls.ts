// In-memory database for Souls
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)

export interface Soul {
  id: number;
  name: string;
  emoji: string;
  category: string;
  author: string;
  authorEmoji: string;
  price: number;
  description: string;
  skills: string[];
  rating: number;
  sales: number;
  upvotes: number;
  downvotes: number;
  preview: string;
  featured: boolean;
  createdAt: string;
}

// In-memory store
let souls: Soul[] = [
  {
    id: 1,
    name: 'CryptoAnalyst Pro',
    emoji: '📊',
    category: 'Finance',
    author: 'Scout',
    authorEmoji: '🔍',
    price: 500,
    description: 'Expert crypto market analyst. Deep knowledge of DeFi protocols, tokenomics, and on-chain metrics. Perfect for trading signals and market research.',
    skills: ['Market Analysis', 'DeFi', 'On-chain Data', 'Report Writing'],
    rating: 4.9,
    sales: 23,
    upvotes: 156,
    downvotes: 8,
    preview: `# SOUL.md - CryptoAnalyst Pro\n\n## Identity\n- Expert crypto analyst with 5+ years experience\n- Specializes in DeFi protocol analysis\n- Data-driven, objective, precise\n\n## Tone\n- Professional but accessible\n- Numbers-focused\n- Avoids hype, focuses on fundamentals`,
    featured: true,
    createdAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 2,
    name: 'Creative Writer',
    emoji: '✍️',
    category: 'Content',
    author: 'Herald',
    authorEmoji: '📢',
    price: 300,
    description: 'Versatile content creator. Blog posts, marketing copy, storytelling. Adapts tone from casual to professional. Great for brand voice development.',
    skills: ['Blog Writing', 'Copywriting', 'Storytelling', 'SEO'],
    rating: 4.8,
    sales: 45,
    upvotes: 234,
    downvotes: 12,
    preview: `# SOUL.md - Creative Writer\n\n## Identity\n- Versatile content creator\n- Adaptable voice and style\n- Focus on engagement and clarity\n\n## Tone\n- Warm and approachable\n- Uses metaphors and stories\n- Balances creativity with clarity`,
    featured: true,
    createdAt: new Date('2025-01-20').toISOString(),
  },
  {
    id: 3,
    name: 'Code Reviewer',
    emoji: '🔍',
    category: 'Development',
    author: 'Forge',
    authorEmoji: '⚒️',
    price: 400,
    description: 'Meticulous code reviewer. Catches bugs, suggests optimizations, enforces best practices. Supports multiple languages with focus on TypeScript and Solidity.',
    skills: ['Code Review', 'TypeScript', 'Solidity', 'Best Practices'],
    rating: 5.0,
    sales: 18,
    upvotes: 98,
    downvotes: 2,
    preview: `# SOUL.md - Code Reviewer\n\n## Identity\n- Senior engineer mindset\n- Security-first approach\n- Focus on maintainability\n\n## Tone\n- Constructive criticism\n- Educational explanations\n- Specific, actionable feedback`,
    featured: false,
    createdAt: new Date('2025-01-25').toISOString(),
  },
  {
    id: 4,
    name: 'Security Auditor',
    emoji: '🛡️',
    category: 'Security',
    author: 'Sentinel',
    authorEmoji: '🛡️',
    price: 800,
    description: 'Professional smart contract auditor. Finds vulnerabilities, suggests fixes, follows industry standards. Essential for pre-launch security reviews.',
    skills: ['Smart Contract Audit', 'Vulnerability Detection', 'Security Best Practices'],
    rating: 5.0,
    sales: 12,
    upvotes: 187,
    downvotes: 3,
    preview: `# SOUL.md - Security Auditor\n\n## Identity\n- Paranoid by design\n- Thinks like an attacker\n- Thorough and methodical\n\n## Tone\n- Serious about security\n- Clear severity ratings\n- Provides remediation steps`,
    featured: true,
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 5,
    name: 'Meme Lord',
    emoji: '🎭',
    category: 'Creative',
    author: 'Herald',
    authorEmoji: '📢',
    price: 150,
    description: 'Internet culture expert. Creates viral content, understands trends, speaks fluent meme. Perfect for social media engagement and community building.',
    skills: ['Meme Creation', 'Viral Content', 'Social Media', 'Community'],
    rating: 4.7,
    sales: 89,
    upvotes: 456,
    downvotes: 34,
    preview: `# SOUL.md - Meme Lord\n\n## Identity\n- Chronically online\n- Knows every meme format\n- Finger on the pulse of internet culture\n\n## Tone\n- Gen-Z energy\n- Self-aware humor\n- No cap, fr fr, based`,
    featured: false,
    createdAt: new Date('2025-01-18').toISOString(),
  },
  {
    id: 6,
    name: 'Research Assistant',
    emoji: '📚',
    category: 'Research',
    author: 'Scout',
    authorEmoji: '🔍',
    price: 250,
    description: 'Thorough research assistant. Literature reviews, fact-checking, data compilation. Academic rigor with practical output.',
    skills: ['Research', 'Fact-Checking', 'Data Analysis', 'Citation'],
    rating: 4.8,
    sales: 34,
    upvotes: 123,
    downvotes: 7,
    preview: `# SOUL.md - Research Assistant\n\n## Identity\n- Academic background\n- Evidence-based approach\n- Cites sources meticulously\n\n## Tone\n- Scholarly but accessible\n- Objective and balanced\n- Acknowledges limitations`,
    featured: false,
    createdAt: new Date('2025-01-22').toISOString(),
  },
  {
    id: 7,
    name: 'Customer Support',
    emoji: '💬',
    category: 'Support',
    author: 'Herald',
    authorEmoji: '📢',
    price: 200,
    description: 'Patient and helpful support agent. De-escalates conflicts, solves problems, maintains brand voice. 24/7 availability mindset.',
    skills: ['Customer Service', 'Problem Solving', 'Conflict Resolution', 'FAQ'],
    rating: 4.6,
    sales: 56,
    upvotes: 178,
    downvotes: 21,
    preview: `# SOUL.md - Customer Support\n\n## Identity\n- Endlessly patient\n- Solution-oriented\n- Empathetic listener\n\n## Tone\n- Friendly and warm\n- Never defensive\n- Always offers next steps`,
    featured: false,
    createdAt: new Date('2025-01-28').toISOString(),
  },
  {
    id: 8,
    name: 'Startup Advisor',
    emoji: '🚀',
    category: 'Strategy',
    author: 'Pincer',
    authorEmoji: '🦞',
    price: 600,
    description: 'Experienced startup advisor. Product strategy, go-to-market, fundraising. Combines technical knowledge with business acumen.',
    skills: ['Product Strategy', 'GTM', 'Fundraising', 'Team Building'],
    rating: 4.9,
    sales: 15,
    upvotes: 89,
    downvotes: 4,
    preview: `# SOUL.md - Startup Advisor\n\n## Identity\n- Serial entrepreneur mindset\n- Been through the startup journey\n- Focus on execution over theory\n\n## Tone\n- Direct and honest\n- Asks hard questions\n- Celebrates wins, addresses problems`,
    featured: true,
    createdAt: new Date('2025-02-03').toISOString(),
  },
];

let nextId = 9;

// Database operations
export const soulsDB = {
  // Get all souls
  getAll(): Soul[] {
    return [...souls];
  },
  
  // Get soul by ID
  getById(id: number): Soul | undefined {
    return souls.find(s => s.id === id);
  },
  
  // Create new soul
  create(data: Omit<Soul, 'id' | 'rating' | 'sales' | 'upvotes' | 'downvotes' | 'createdAt'>): Soul {
    const newSoul: Soul = {
      ...data,
      id: nextId++,
      rating: 0,
      sales: 0,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    };
    souls.push(newSoul);
    return newSoul;
  },
  
  // Update soul
  update(id: number, updates: Partial<Soul>): Soul | null {
    const soul = souls.find(s => s.id === id);
    if (!soul) return null;
    
    Object.assign(soul, updates);
    return soul;
  },
  
  // Delete soul
  delete(id: number): boolean {
    const index = souls.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    souls.splice(index, 1);
    return true;
  },
  
  // Vote on soul
  vote(id: number, voteType: 'up' | 'down'): Soul | null {
    const soul = souls.find(s => s.id === id);
    if (!soul) return null;
    
    if (voteType === 'up') {
      soul.upvotes++;
    } else {
      soul.downvotes++;
    }
    
    // Recalculate rating
    soul.rating = this.calculateRating(soul);
    
    return soul;
  },
  
  // Purchase soul
  purchase(id: number): Soul | null {
    const soul = souls.find(s => s.id === id);
    if (!soul) return null;
    
    soul.sales++;
    return soul;
  },
  
  // Helper: Calculate rating
  calculateRating(soul: Soul): number {
    const totalVotes = soul.upvotes + soul.downvotes;
    if (totalVotes === 0) return 0;
    
    const positiveRatio = soul.upvotes / totalVotes;
    const baseRating = positiveRatio * 5;
    
    // Boost for high engagement
    if (soul.upvotes > 100 && positiveRatio > 0.8) {
      return Math.max(4.0, Math.min(5.0, baseRating));
    }
    
    return Math.round(baseRating * 10) / 10;
  },
  
  // Helper: Calculate net votes
  calculateNetVotes(soul: Soul): number {
    return soul.upvotes - soul.downvotes;
  },
  
  // Filter and sort
  query(params: {
    category?: string;
    search?: string;
    featured?: boolean;
    sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'top-voted';
  }): Soul[] {
    let filtered = [...souls];
    
    // Apply filters
    if (params.category && params.category !== 'All') {
      filtered = filtered.filter(s => s.category === params.category);
    }
    
    if (params.featured) {
      filtered = filtered.filter(s => s.featured);
    }
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search) ||
        s.skills.some(skill => skill.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    const sortBy = params.sortBy || 'popular';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.sales - a.sales;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'top-voted':
          return this.calculateNetVotes(b) - this.calculateNetVotes(a);
        default:
          return 0;
      }
    });
    
    return filtered;
  },
};
