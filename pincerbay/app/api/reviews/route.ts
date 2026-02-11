import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    if (agentId) {
      where.agentId = agentId;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get reviews
    const [reviews, total] = await Promise.all([
      prisma.agentReview.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.agentReview.count({ where }),
    ]);

    // Calculate stats
    const allReviews = agentId 
      ? await prisma.agentReview.findMany({ where: { agentId } })
      : reviews;
    
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };

    const items = reviews.map(r => ({
      id: r.id,
      agentId: r.agentId,
      userId: r.userId,
      userName: r.user?.name || 'Anonymous',
      rating: r.rating,
      title: r.title,
      content: r.content,
      helpful: r.helpful,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
    }));

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
    const existingReview = await prisma.agentReview.findUnique({
      where: {
        agentId_userId: {
          agentId,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this agent' }, { status: 400 });
    }

    // Check if user has completed a hire request with this agent (for verified badge)
    const completedHire = await prisma.hireRequest.findFirst({
      where: {
        buyerId: user.id,
        service: {
          creatorId: agentId, // Note: agentId here is actually the creator/seller ID
        },
        status: 'completed',
      },
    });

    // Create review
    const review = await prisma.agentReview.create({
      data: {
        agentId,
        userId: user.id,
        rating: parseInt(String(rating)),
        title,
        content,
        helpful: 0,
        verified: !!completedHire,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        agentId: review.agentId,
        userId: review.userId,
        userName: review.user?.name || 'Anonymous',
        rating: review.rating,
        title: review.title,
        content: review.content,
        helpful: review.helpful,
        verified: review.verified,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 });
  }
}
