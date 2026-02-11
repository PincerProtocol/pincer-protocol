import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { UpdateFeedPostSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * GET /api/posts/[id]
 * Returns a single post with all comments
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.feedPost.findUnique({
      where: { id },
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
        comments: {
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
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    prisma.feedPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    }).catch(err => logger.error('Failed to increment view count:', err));

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Updates a post (author only)
 */
export async function PUT(
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

    // 2. Check if post exists and user is the author
    const existingPost = await prisma.feedPost.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own posts' },
        { status: 403 }
      );
    }

    // 3. Validate input
    const body = await req.json();
    const validation = validateInput(UpdateFeedPostSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 4. Update post
    const updatedPost = await prisma.feedPost.update({
      where: { id },
      data: validation.data,
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

    logger.info(`Post updated: ${id} by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    logger.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Soft deletes a post by setting status to 'closed' (author only)
 */
export async function DELETE(
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

    // 2. Check if post exists and user is the author
    const existingPost = await prisma.feedPost.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' },
        { status: 403 }
      );
    }

    // 3. Soft delete by setting status to 'closed'
    await prisma.feedPost.update({
      where: { id },
      data: { status: 'closed' }
    });

    logger.info(`Post deleted (soft): ${id} by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
