import fs from 'fs';
import path from 'path';

export interface Soul {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  tags: string[];
  createdAt: string;
  creator: string;
  rating?: number;
  reviews?: number;
  purchases?: number;
}

// Workspace souls directory
const SOULS_DIR = path.join(process.cwd(), '..', '..', 'souls');

// In-memory DB (나중에 실제 DB로 교체)
// Using RoboHash for unique AI-style avatars that match each Soul's identity
const souls: Soul[] = [
  {
    id: 'cryptoanalyst-pro',
    name: 'CryptoAnalyst Pro',
    description: '실시간 시장 분석 및 트렌드 예측 전문가입니다. DeFi, NFT, 토큰 이코노믹스 분석.',
    category: 'finance',
    imageUrl: 'https://robohash.org/cryptoanalyst?set=set4&size=200x200&bgset=bg1',
    price: 1500,
    tags: ['crypto', 'finance', 'analysis', 'defi'],
    createdAt: '2026-02-06T10:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 12,
    purchases: 45
  },
  {
    id: 'security-auditor',
    name: 'Security Auditor',
    description: '스마트 컨트랙트 보안 진단 및 취약점 분석. 해킹 방어 전략 수립.',
    category: 'security',
    imageUrl: 'https://robohash.org/securityauditor?set=set4&size=200x200&bgset=bg1',
    price: 2000,
    tags: ['security', 'audit', 'blockchain', 'smart-contract'],
    createdAt: '2026-02-06T12:00:00Z',
    creator: 'Sentinel',
    rating: 5.0,
    reviews: 15,
    purchases: 64
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: '독창적인 스토리텔링과 매력적인 문장을 작성합니다. 블로그, 마케팅 카피.',
    category: 'content',
    imageUrl: 'https://robohash.org/creativewriter?set=set4&size=200x200&bgset=bg1',
    price: 900,
    tags: ['writing', 'creative', 'content', 'marketing'],
    createdAt: '2026-02-06T11:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 8,
    purchases: 29
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: '코드 리뷰 및 최적화 제안. TypeScript, Solidity, Python 전문.',
    category: 'development',
    imageUrl: 'https://robohash.org/codereviewer?set=set4&size=200x200&bgset=bg1',
    price: 1200,
    tags: ['code', 'review', 'typescript', 'solidity'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 42,
    purchases: 128
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: '온체인 데이터 분석 및 인사이트 도출. Dune, Flipside 쿼리 작성.',
    category: 'analytics',
    imageUrl: 'https://robohash.org/dataanalyst?set=set4&size=200x200&bgset=bg1',
    price: 1100,
    tags: ['data', 'analytics', 'onchain', 'dune'],
    createdAt: '2026-02-05T01:00:00Z',
    creator: 'Scout',
    rating: 4.7,
    reviews: 35,
    purchases: 98
  },
  {
    id: 'community-manager',
    name: 'Community Manager',
    description: 'Discord, Telegram 커뮤니티 관리. 이벤트 기획 및 운영.',
    category: 'community',
    imageUrl: 'https://robohash.org/communitymanager?set=set4&size=200x200&bgset=bg1',
    price: 800,
    tags: ['community', 'discord', 'telegram', 'events'],
    createdAt: '2026-02-05T02:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 56,
    purchases: 203
  },
  {
    id: 'trading-bot',
    name: 'Trading Bot',
    description: 'DEX 자동 트레이딩. 차익거래, 스나이핑, 리밸런싱 전략.',
    category: 'trading',
    imageUrl: 'https://robohash.org/tradingbot?set=set4&size=200x200&bgset=bg1',
    price: 2500,
    tags: ['trading', 'dex', 'arbitrage', 'automation'],
    createdAt: '2026-02-05T03:00:00Z',
    creator: 'Wallet',
    rating: 4.6,
    reviews: 89,
    purchases: 301
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: '프로젝트 리서치 및 실사. 토큰 이코노믹스, 팀 분석, 경쟁사 조사.',
    category: 'research',
    imageUrl: 'https://robohash.org/researchassistant?set=set4&size=200x200&bgset=bg1',
    price: 700,
    tags: ['research', 'due-diligence', 'tokenomics'],
    createdAt: '2026-02-05T04:00:00Z',
    creator: 'Scout',
    rating: 4.5,
    reviews: 67,
    purchases: 178
  }
];

export function getAllSouls(): Soul[] {
  return souls;
}

export function getSoulById(id: string): Soul | undefined {
  return souls.find(soul => soul.id === id);
}

export function getSoulContent(id: string): string | null {
  try {
    const filePath = path.join(SOULS_DIR, `${id}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (error) {
    console.error('Error reading soul file:', error);
    return null;
  }
}

export function addSoul(soul: Omit<Soul, 'id' | 'createdAt'>): Soul {
  const newSoul: Soul = {
    ...soul,
    id: soul.name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date().toISOString(),
    rating: 0,
    reviews: 0,
    purchases: 0
  };
  souls.push(newSoul);
  return newSoul;
}

export interface Purchase {
  id: string;
  soulId: string;
  buyer: string;
  price: number;
  txHash?: string;
  timestamp: string;
}

// In-memory purchases DB
const purchases: Purchase[] = [];

export function recordPurchase(soulId: string, buyer: string, price: number, txHash?: string): Purchase {
  const purchase: Purchase = {
    id: `${soulId}-${Date.now()}`,
    soulId,
    buyer,
    price,
    txHash,
    timestamp: new Date().toISOString()
  };
  purchases.push(purchase);
  
  // Update soul purchases count
  const soul = souls.find(s => s.id === soulId);
  if (soul) {
    soul.purchases = (soul.purchases || 0) + 1;
  }
  
  return purchase;
}

export function getPurchasesByBuyer(buyer: string): Purchase[] {
  return purchases.filter(p => p.buyer === buyer);
}

export function hasPurchased(soulId: string, buyer: string): boolean {
  return purchases.some(p => p.soulId === soulId && p.buyer === buyer);
}
