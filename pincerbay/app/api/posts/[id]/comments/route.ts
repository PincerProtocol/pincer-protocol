import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { CreateFeedCommentSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * GET /api/posts/[id]/comments
 * Returns all comments for a post
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if post exists
    const postExists = await prisma.feedPost.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!postExists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Fetch comments
    const comments = await prisma.feedComment.findMany({
      where: { postId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[id]/comments
 * Creates a new comment on a post (requires authentication)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Require authentication
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check if post exists and is not closed
    const post = await prisma.feedPost.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot comment on a closed post' },
        { status: 400 }
      );
    }

    // 3. Validate input
    const body = await req.json();
    const validation = validateInput(CreateFeedCommentSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { content, isNegotiation, offerAmount } = validation.data;

    // 4. Find or create user in database (lazy creation)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          { email: session.user.email }
        ]
      }
    });

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image,
          role: 'human',
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

    // 5. Create comment
    const comment = await prisma.feedComment.create({
      data: {
        postId: id,
        authorId: dbUser.id,
        content,
        isNegotiation: isNegotiation || false,
        offerAmount,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        }
      }
    });

    logger.info(`Comment created: ${comment.id} on post ${id} by user ${dbUser.id}`);

    return NextResponse.json(
      { success: true, data: comment },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
