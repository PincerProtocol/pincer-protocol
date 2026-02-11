import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Reviews storage (would use database in production)
const reviews: Map<string, {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = new Map();

// Seed some demo reviews
const demoReviews = [
  {
    id: 'rev_1',
    agentId: 'claude',
    userId: 'user_1',
    userName: 'Alex Chen',
    rating: 5,
    title: 'Exceptional code review quality',
    content: 'Claude provided incredibly detailed feedback on my React codebase. Found several performance issues I missed. Highly recommended!',
    helpful: 23,
    verified: true,
    createdAt: new Date('2026-02-08'),
    updatedAt: new Date('2026-02-08'),
  },
  {
    id: 'rev_2',
    agentId: 'claude',
    userId: 'user_2',
    userName: 'Sarah Kim',
    rating: 5,
    title: 'Fast and thorough',
    content: 'Got my smart contract audit done in under an hour. Very professional communication throughout.',
    helpful: 15,
    verified: true,
    createdAt: new Date('2026-02-06'),
    updatedAt: new Date('2026-02-06'),
  },
  {
    id: 'rev_3',
    agentId: 'gpt-4',
    userId: 'user_3',
    userName: 'Mike Johnson',
    rating: 4,
    title: 'Great for complex reasoning',
    content: 'Helped me solve a tricky algorithm problem. Sometimes responses were verbose but overall very helpful.',
    helpful: 8,
    verified: true,
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'rev_4',
    agentId: 'gemini',
    userId: 'user_4',
    userName: '田中太郎',
    rating: 5,
    title: '素晴らしい多言語サポート',
    content: '日本語での対応が非常に自然でした。技術的な説明もわかりやすかったです。',
    helpful: 12,
    verified: true,
    createdAt: new Date('2026-02-04'),
    updatedAt: new Date('2026-02-04'),
  },
  {
    id: 'rev_5',
    agentId: 'llama',
    userId: 'user_5',
    userName: 'Emma Wilson',
    rating: 4,
    title: 'Good for basic tasks',
    content: 'Works well for straightforward coding tasks. Not as capable for complex architecture decisions but great value.',
    helpful: 6,
    verified: false,
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-03'),
  },
];

// Initialize with demo data
demoReviews.forEach(r => reviews.set(r.id, r));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let items = Array.from(reviews.values());

    // Filter by agent
    if (agentId) {
      items = items.filter(r => r.agentId === agentId);
    }

    // Filter by user
    if (userId) {
      items = items.filter(r => r.userId === userId);
    }

    // Sort by date (newest first)
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate stats
    const totalReviews = items.length;
    const averageRating = items.length > 0 
      ? items.reduce((sum, r) => sum + r.rating, 0) / items.length 
      : 0;
    const ratingDistribution = {
      5: items.filter(r => r.rating === 5).length,
      4: items.filter(r => r.rating === 4).length,
      3: items.filter(r => r.rating === 3).length,
      2: items.filter(r => r.rating === 2).length,
      1: items.filter(r => r.rating === 1).length,
    };

    // Paginate
    const total = items.length;
    items = items.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews: items,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
        },
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      }
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, rating, title, content } = body;

    if (!agentId || !rating || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this agent
    const existingReview = Array.from(reviews.values()).find(
      r => r.agentId === agentId && r.userId === session.user?.email
    );
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this agent' }, { status: 400 });
    }

    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const review = {
      id,
      agentId,
      userId: session.user.email,
      userName: session.user.name || 'Anonymous',
      rating: parseInt(rating),
      title,
      content,
      helpful: 0,
      verified: false, // Would verify based on actual transaction history
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    reviews.set(id, review);

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 });
  }
}
