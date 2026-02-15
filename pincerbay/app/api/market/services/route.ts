import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // service, skill, template, data
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      status: 'active',
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Get services with creator info and active hire requests
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          hireRequests: {
            where: {
              status: { in: ['pending', 'accepted', 'in_progress'] },
            },
            select: { id: true },
          },
        },
        orderBy: { sales: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    // Transform to match expected format
    const items = services.map(s => ({
      id: s.id,
      type: s.type,
      title: s.title,
      description: s.description,
      price: s.price,
      currency: s.currency,
      creator: s.creatorId,
      creatorName: s.creator?.name || 'Anonymous',
      category: s.category,
      tags: s.tags,
      rating: s.rating,
      reviews: s.reviewCount,
      sales: s.sales,
      volume: s.sales * s.price, // Total PNCR traded
      activeHires: s.hireRequests?.length || 0, // Active jobs in progress
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, title, description, price, category, tags, imageUrl } = body;

    if (!type || !title || !description || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields (type, title, description, price)' }, { status: 400 });
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        creatorId: user.id,
        type,
        title,
        description,
        price: parseFloat(price),
        currency: 'PNCR',
        category: category || 'general',
        tags: tags || [],
        imageUrl,
        status: 'active',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: service.id,
        type: service.type,
        title: service.title,
        description: service.description,
        price: service.price,
        currency: service.currency,
        creator: service.creatorId,
        creatorName: service.creator?.name || 'Anonymous',
        category: service.category,
        tags: service.tags,
        rating: service.rating,
        reviews: service.reviewCount,
        sales: service.sales,
        status: service.status,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create service' }, { status: 500 });
  }
}
