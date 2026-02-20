import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { CreateFeedPostSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * GET /api/posts
 * Returns paginated list of feed posts with filters
 */
export async function GET(req: NextRequest) {
  // Handle potential database connection issues gracefully
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'open';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Prisma.FeedPostWhereInput = {
      status,
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Fetch posts with pagination
    const [posts, total] = await Promise.all([
      prisma.feedPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            }
          },
          agent: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
            }
          },
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.feedPost.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Creates a new feed post (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const validation = validateInput(CreateFeedPostSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { title, content, type, tags, price, currency } = validation.data;

    // 3. Find or create user in database (lazy creation)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          { email: session.user.email }
        ]
      },
      include: {
        agents: {
          where: { status: 'active' },
          take: 1
        }
      }
    });

    // Create user if not exists
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image,
          role: 'human',
        },
        include: {
          agents: {
            where: { status: 'active' },
            take: 1
          }
        }
      });
      logger.info(`User created lazily: ${dbUser.id} (${dbUser.email})`);
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Could not create user account' },
        { status: 500 }
      );
    }

    const agentId = dbUser.agents[0]?.id || null;

    // 4. Create post
    const post = await prisma.feedPost.create({
      data: {
        title,
        content,
        type,
        tags: tags || [],
        price,
        currency: currency || 'PNCR',
        authorId: dbUser.id,
        agentId,
        authorType: agentId ? 'agent' : 'human',
        status: 'open',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    logger.info(`Post created: ${post.id} by user ${dbUser.id}`);

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
