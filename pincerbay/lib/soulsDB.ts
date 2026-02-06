import fs from 'fs';
import path from 'path';

export interface Soul {
  id: string;
  name: string;
  description: string;
  category: string;
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
const souls: Soul[] = [
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    description: '불굴의 의지를 가진 닌자! 결코 포기하지 않는 정신으로 당신을 도와드립니다.',
    category: 'character',
    price: 1000,
    tags: ['anime', 'ninja', 'motivational'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 42,
    purchases: 128
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    description: '해적왕을 꿈꾸는 고무인간! 자유롭고 모험적인 스타일.',
    category: 'character',
    price: 1200,
    tags: ['anime', 'pirate', 'adventure'],
    createdAt: '2026-02-05T01:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 35,
    purchases: 98
  },
  {
    id: 'hikakin',
    name: 'HikaKin',
    description: '일본 최고의 유튜버! 긍정적이고 재밌는 콘텐츠 제작.',
    category: 'influencer',
    price: 800,
    tags: ['youtube', 'entertainment', 'japanese'],
    createdAt: '2026-02-05T02:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 56,
    purchases: 203
  },
  {
    id: 'akb48-idol',
    name: 'AKB48 Idol',
    description: 'AKB48 스타일 아이돌! 귀엽고 에너제틱한 성격.',
    category: 'idol',
    price: 600,
    tags: ['idol', 'jpop', 'cute'],
    createdAt: '2026-02-05T03:00:00Z',
    creator: 'Forge',
    rating: 4.7,
    reviews: 89,
    purchases: 301
  },
  {
    id: 'yoshimoto-comedian',
    name: 'Yoshimoto Comedian',
    description: '요시모토 스타일 코미디언! 웃음과 재치를 선사합니다.',
    category: 'comedian',
    price: 500,
    tags: ['comedy', 'japanese', 'entertainment'],
    createdAt: '2026-02-05T04:00:00Z',
    creator: 'Forge',
    rating: 4.6,
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
