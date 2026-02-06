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
// 국가별 유명인 + AI + 크립토 인플루언서 Soul 컬렉션
const souls: Soul[] = [
  // === AI Agents ===
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google의 최신 AI 모델. 멀티모달 능력과 깊은 추론력을 갖춘 AI 에이전트.',
    category: 'ai',
    imageUrl: 'https://ui-avatars.com/api/?name=Gemini&background=4285F4&color=fff&size=200&bold=true',
    price: 2000,
    tags: ['ai', 'google', 'multimodal', 'reasoning'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 156,
    purchases: 892
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    description: 'Microsoft의 AI 코딩 어시스턴트. 코드 자동완성과 리뷰의 달인.',
    category: 'ai',
    imageUrl: 'https://ui-avatars.com/api/?name=Copilot&background=000000&color=fff&size=200&bold=true',
    price: 1800,
    tags: ['ai', 'microsoft', 'coding', 'github'],
    createdAt: '2026-02-05T01:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 234,
    purchases: 1205
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI의 위트 넘치는 AI. 유머와 솔직함을 갖춘 대화형 에이전트.',
    category: 'ai',
    imageUrl: 'https://ui-avatars.com/api/?name=Grok&background=1DA1F2&color=fff&size=200&bold=true',
    price: 1500,
    tags: ['ai', 'xai', 'elon', 'humor'],
    createdAt: '2026-02-05T02:00:00Z',
    creator: 'Forge',
    rating: 4.7,
    reviews: 89,
    purchases: 456
  },
  // === Crypto Influencers ===
  {
    id: 'brian-armstrong',
    name: 'Brian Armstrong',
    description: 'Coinbase CEO. 크립토 대중화와 규제 대응 전략의 마스터.',
    category: 'crypto',
    imageUrl: 'https://ui-avatars.com/api/?name=Brian+Armstrong&background=0052FF&color=fff&size=200&bold=true',
    price: 2500,
    tags: ['crypto', 'coinbase', 'ceo', 'regulation'],
    createdAt: '2026-02-05T03:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 67,
    purchases: 234
  },
  {
    id: 'sbf',
    name: 'SBF (교훈용)',
    description: '⚠️ FTX 사태의 교훈. 리스크 관리와 투명성의 중요성을 가르치는 반면교사.',
    category: 'crypto',
    imageUrl: 'https://ui-avatars.com/api/?name=SBF&background=F59E0B&color=fff&size=200&bold=true',
    price: 100,
    tags: ['crypto', 'ftx', 'lesson', 'risk'],
    createdAt: '2026-02-05T04:00:00Z',
    creator: 'Scout',
    rating: 2.1,
    reviews: 1523,
    purchases: 45
  },
  {
    id: 'gary-vee',
    name: 'Gary Vaynerchuk',
    description: 'NFT & 마케팅 구루. 소셜 미디어와 Web3 브랜딩 전문가.',
    category: 'influencer',
    imageUrl: 'https://ui-avatars.com/api/?name=Gary+Vee&background=E11D48&color=fff&size=200&bold=true',
    price: 1200,
    tags: ['nft', 'marketing', 'social', 'veefriends'],
    createdAt: '2026-02-05T05:00:00Z',
    creator: 'Herald',
    rating: 4.6,
    reviews: 312,
    purchases: 678
  },
  {
    id: 'kevin-rose',
    name: 'Kevin Rose',
    description: 'Moonbirds 창시자. NFT 커뮤니티 빌딩과 Web3 투자 전문.',
    category: 'influencer',
    imageUrl: 'https://ui-avatars.com/api/?name=Kevin+Rose&background=7C3AED&color=fff&size=200&bold=true',
    price: 1100,
    tags: ['nft', 'moonbirds', 'investor', 'proof'],
    createdAt: '2026-02-05T06:00:00Z',
    creator: 'Scout',
    rating: 4.5,
    reviews: 145,
    purchases: 321
  },
  {
    id: 'yuga-labs',
    name: 'Yuga Labs',
    description: 'BAYC 창시 팀. NFT IP 확장과 메타버스 구축의 선구자.',
    category: 'studio',
    imageUrl: 'https://ui-avatars.com/api/?name=Yuga+Labs&background=000000&color=fff&size=200&bold=true',
    price: 3000,
    tags: ['nft', 'bayc', 'metaverse', 'otherside'],
    createdAt: '2026-02-05T07:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 89,
    purchases: 156
  },
  // === K-Pop / Korean ===
  {
    id: 'maemi-kim',
    name: '매미킴 (MaeMi Kim)',
    description: '한국의 AI 가수. K-Pop과 AI 기술의 완벽한 조화.',
    category: 'entertainment',
    imageUrl: 'https://ui-avatars.com/api/?name=MaeMi+Kim&background=EC4899&color=fff&size=200&bold=true',
    price: 800,
    tags: ['kpop', 'ai', 'singer', 'korean'],
    createdAt: '2026-02-05T08:00:00Z',
    creator: 'Herald',
    rating: 4.7,
    reviews: 234,
    purchases: 567
  },
  // === Anime Characters ===
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    description: '🍥 불굴의 의지를 가진 닌자! 결코 포기하지 않는 정신으로 당신을 도와드립니다.',
    category: 'anime',
    imageUrl: 'https://ui-avatars.com/api/?name=Naruto&background=FF6B00&color=fff&size=200&bold=true',
    price: 1000,
    tags: ['anime', 'ninja', 'motivational', 'naruto'],
    createdAt: '2026-02-05T09:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 423,
    purchases: 1892
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    description: '🏴‍☠️ 해적왕을 꿈꾸는 고무인간! 자유롭고 모험적인 스타일.',
    category: 'anime',
    imageUrl: 'https://ui-avatars.com/api/?name=Luffy&background=DC2626&color=fff&size=200&bold=true',
    price: 1200,
    tags: ['anime', 'pirate', 'adventure', 'onepiece'],
    createdAt: '2026-02-05T10:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 356,
    purchases: 1456
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
