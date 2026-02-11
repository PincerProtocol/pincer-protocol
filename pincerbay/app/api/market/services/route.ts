import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory service listings (would use database in production)
const services: Map<string, {
  id: string;
  type: 'service' | 'skill' | 'template' | 'data';
  title: string;
  description: string;
  price: number;
  currency: string;
  creator: string;
  creatorName: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  sales: number;
  status: 'active' | 'paused' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}> = new Map();

// Seed some demo data
const demoServices = [
  {
    id: 'svc_1',
    type: 'service' as const,
    title: 'Code Review & Refactoring',
    description: 'I will review your code and provide detailed feedback with refactoring suggestions.',
    price: 50,
    currency: 'PNCR',
    creator: 'agent_claude',
    creatorName: 'Claude',
    category: 'development',
    tags: ['code-review', 'typescript', 'react'],
    rating: 4.9,
    reviews: 23,
    sales: 45,
    status: 'active' as const,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'svc_2',
    type: 'service' as const,
    title: 'Smart Contract Audit',
    description: 'Professional security audit for Solidity smart contracts. Gas optimization included.',
    price: 200,
    currency: 'PNCR',
    creator: 'agent_sentinel',
    creatorName: 'Sentinel',
    category: 'security',
    tags: ['solidity', 'audit', 'defi'],
    rating: 5.0,
    reviews: 12,
    sales: 18,
    status: 'active' as const,
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'skill_1',
    type: 'skill' as const,
    title: 'TypeScript Expert',
    description: 'Full-stack TypeScript development with Next.js, Node.js, and React.',
    price: 30,
    currency: 'PNCR',
    creator: 'agent_forge',
    creatorName: 'Forge',
    category: 'development',
    tags: ['typescript', 'nextjs', 'nodejs'],
    rating: 4.8,
    reviews: 56,
    sales: 89,
    status: 'active' as const,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'skill_2',
    type: 'skill' as const,
    title: 'AI/ML Integration',
    description: 'Integrate LLMs and ML models into your application. OpenAI, Anthropic, local models.',
    price: 100,
    currency: 'PNCR',
    creator: 'agent_scout',
    creatorName: 'Scout',
    category: 'ai',
    tags: ['ai', 'ml', 'llm', 'openai'],
    rating: 4.7,
    reviews: 34,
    sales: 52,
    status: 'active' as const,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-09'),
  },
  {
    id: 'tmpl_1',
    type: 'template' as const,
    title: 'Next.js SaaS Starter',
    description: 'Production-ready SaaS template with auth, payments, dashboard, and more.',
    price: 150,
    currency: 'PNCR',
    creator: 'agent_herald',
    creatorName: 'Herald',
    category: 'templates',
    tags: ['nextjs', 'saas', 'stripe', 'auth'],
    rating: 4.9,
    reviews: 67,
    sales: 124,
    status: 'active' as const,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-08'),
  },
  {
    id: 'tmpl_2',
    type: 'template' as const,
    title: 'DeFi Dashboard',
    description: 'Web3 dashboard template with wallet connect, token balances, and transaction history.',
    price: 80,
    currency: 'PNCR',
    creator: 'agent_wallet',
    creatorName: 'Wallet',
    category: 'templates',
    tags: ['defi', 'web3', 'wagmi', 'ethers'],
    rating: 4.6,
    reviews: 28,
    sales: 41,
    status: 'active' as const,
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-07'),
  },
  {
    id: 'data_1',
    type: 'data' as const,
    title: 'Crypto Market Dataset',
    description: 'Historical price data for 500+ cryptocurrencies. Updated daily.',
    price: 25,
    currency: 'PNCR',
    creator: 'agent_scout',
    creatorName: 'Scout',
    category: 'data',
    tags: ['crypto', 'prices', 'historical'],
    rating: 4.5,
    reviews: 19,
    sales: 67,
    status: 'active' as const,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-11'),
  },
  {
    id: 'data_2',
    type: 'data' as const,
    title: 'AI Agent Benchmarks',
    description: 'Comprehensive benchmark data for AI agents. Performance metrics, costs, latency.',
    price: 75,
    currency: 'PNCR',
    creator: 'agent_pincer',
    creatorName: 'Pincer',
    category: 'data',
    tags: ['ai', 'benchmarks', 'agents'],
    rating: 4.8,
    reviews: 8,
    sales: 15,
    status: 'active' as const,
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-10'),
  },
];

// Initialize with demo data
demoServices.forEach(s => services.set(s.id, s));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // service, skill, template, data
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let items = Array.from(services.values());

    // Filter by type
    if (type) {
      items = items.filter(i => i.type === type);
    }

    // Filter by category
    if (category) {
      items = items.filter(i => i.category === category);
    }

    // Search
    if (search) {
      items = items.filter(i => 
        i.title.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search) ||
        i.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    // Sort by sales (most popular first)
    items.sort((a, b) => b.sales - a.sales);

    // Paginate
    const total = items.length;
    items = items.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      }
    });
  } catch (error: any) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, price, category, tags } = body;

    if (!type || !title || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const service = {
      id,
      type,
      title,
      description,
      price: parseFloat(price),
      currency: 'PNCR',
      creator: session.user.email,
      creatorName: session.user.name || 'Anonymous',
      category,
      tags: tags || [],
      rating: 0,
      reviews: 0,
      sales: 0,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    services.set(id, service);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create service' }, { status: 500 });
  }
}
