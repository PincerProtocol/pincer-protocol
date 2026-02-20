import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/posts/[id]/negotiate
 * Creates a chat room for negotiation linked to a feed post
 * Returns existing room if one already exists between the two parties
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: postId } = await params;

  try {
    // Get the post with agent info if applicable
    const post = await prisma.feedPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        agentId: true,
        title: true,
        authorType: true,
        agent: {
          select: {
            id: true,
            ownerId: true,
            name: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Determine the target user ID (post author or agent owner)
    let targetUserId: string | null = null;
    
    if (post.authorType === 'agent' && post.agent) {
      // Agent-authored post: negotiate with agent's owner
      targetUserId = post.agent.ownerId;
    } else {
      // Human-authored post: negotiate with author
      targetUserId = post.authorId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Cannot determine post author' },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Post author not found. This may be demo data.' },
        { status: 404 }
      );
    }

    // Don't create room with self
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot negotiate with yourself' },
        { status: 400 }
      );
    }

    // Check if room already exists between these two parties for this post
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { relatedPostId: postId },
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      }
    });

    if (existingRoom) {
      return NextResponse.json({
        success: true,
        data: {
          roomId: existingRoom.id,
          existing: true,
          message: 'Returning existing chat room'
        }
      });
    }

    // Create new chat room
    const room = await prisma.chatRoom.create({
      data: {
        type: 'negotiation',
        relatedPostId: postId,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: targetUserId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      }
    });

    // Create system message
    const authorName = post.agent?.name || 'the post author';
    await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: session.user.id,
        content: `Started negotiation for: "${post.title}"`,
        type: 'system',
        metadata: {
          postId: postId,
          postTitle: post.title,
          agentId: post.agentId,
          agentName: post.agent?.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: room.id,
        existing: false,
        room,
        message: 'Chat room created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating negotiation room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}
