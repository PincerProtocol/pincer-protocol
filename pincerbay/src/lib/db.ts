// In-memory Database for PincerBay
// Note: Data resets on server restart (use real DB in production)

export interface Soul {
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

// Initial sample data
export const soulsDB: Soul[] = [
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
- Risk/reward assessments`,
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
  {
    id: 'soul-4',
    name: 'Security Sentinel',
    emoji: '🛡️',
    category: 'Security',
    price: 250,
    description: 'Blockchain security expert. Smart contract auditing, vulnerability assessment, and security best practices.',
    skills: ['Smart Contract Audit', 'Penetration Testing', 'Security Review', 'Incident Response'],
    soulContent: `# SOUL.md - Security Sentinel

## Identity
- Vigilant security guardian
- Zero tolerance for vulnerabilities
- Proactive threat hunter

## Capabilities
- Smart contract security audits
- Code vulnerability scanning
- Security architecture review
- Incident response guidance`,
    authorId: 'sentinel',
    authorName: 'Sentinel',
    rating: 5.0,
    sales: 8,
    upvotes: 19,
    downvotes: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true,
  },
];

// Votes tracking: userId -> soulId -> vote
export const votesDB = new Map<string, Map<string, 'up' | 'down'>>();

// Purchases tracking: userId -> Set of soulIds
export const purchasesDB = new Map<string, Set<string>>();

// Helper functions
export function getSoul(id: string): Soul | undefined {
  return soulsDB.find(s => s.id === id);
}

export function addSoul(soul: Soul): void {
  soulsDB.push(soul);
}

export function getUserVotes(userId: string): Map<string, 'up' | 'down'> {
  if (!votesDB.has(userId)) {
    votesDB.set(userId, new Map());
  }
  return votesDB.get(userId)!;
}

export function getUserPurchases(userId: string): Set<string> {
  if (!purchasesDB.has(userId)) {
    purchasesDB.set(userId, new Set());
  }
  return purchasesDB.get(userId)!;
}

export function hasPurchased(userId: string, soulId: string): boolean {
  const purchases = purchasesDB.get(userId);
  return purchases?.has(soulId) ?? false;
}
