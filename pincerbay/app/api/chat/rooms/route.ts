import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { findOrCreateChatRoom, getUserChatRooms } from '@/lib/chatService';

/**
 * GET /api/chat/rooms
 * List all chat rooms for authenticated user with last message preview
 */
export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rooms = await getUserChatRooms(session.user.id);

    return NextResponse.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/rooms
 * Create a new chat room or return existing room between users
 *
 * Body:
 * - participantId: string (required) - User ID of other participant
 * - type: 'direct' | 'group' | 'negotiation' (optional, default: 'direct')
 * - relatedPostId: string (optional) - Link to a FeedPost
 */
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { participantId, type, relatedPostId } = body;

    // Validate participantId
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    // Don't allow creating room with self
    if (participantId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot create chat room with yourself' },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && !['direct', 'group', 'negotiation'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid room type' },
        { status: 400 }
      );
    }

    // Find or create room
    const room = await findOrCreateChatRoom({
      creatorId: session.user.id,
      participantId,
      type,
      relatedPostId
    });

    return NextResponse.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
