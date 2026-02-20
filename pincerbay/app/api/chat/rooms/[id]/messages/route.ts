import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  verifyRoomParticipant,
  createChatMessage,
  getRoomMessages,
  updateLastRead,
  type OfferMetadata
} from '@/lib/chatService';

// Helper to get database user ID from session
async function getDbUserId(session: any): Promise<string | null> {
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { email: session.user.email },
        { email: session.user.id }
      ]
    }
  });
  return dbUser?.id || null;
}

/**
 * GET /api/chat/rooms/[id]/messages
 * List all messages in a chat room
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUserId = await getDbUserId(session);
    if (!dbUserId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;

    // Verify user is participant
    const isParticipant = await verifyRoomParticipant(id, dbUserId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await getRoomMessages(id);

    // Update last read timestamp
    await updateLastRead(id, dbUserId);

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/rooms/[id]/messages
 * Send a message in a chat room
 *
 * Body:
 * - content: string (required) - Message content
 * - type: 'text' | 'offer' | 'system' (optional, default: 'text')
 * - metadata: object (optional) - For offer type: { amount, currency, status }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUserId = await getDbUserId(session);
    if (!dbUserId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;

    // Verify user is participant
    const isParticipant = await verifyRoomParticipant(id, dbUserId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { content, type = 'text', metadata } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['text', 'offer', 'system'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }

    // For offer messages, validate metadata
    if (type === 'offer') {
      if (!metadata) {
        return NextResponse.json(
          { error: 'Offer metadata is required for offer messages' },
          { status: 400 }
        );
      }

      const offerData = metadata as Partial<OfferMetadata>;

      if (
        typeof offerData.amount !== 'number' ||
        offerData.amount <= 0 ||
        offerData.currency !== 'PNCR' ||
        !offerData.status ||
        !['pending', 'accepted', 'rejected', 'countered'].includes(offerData.status)
      ) {
        return NextResponse.json(
          {
            error: 'Invalid offer metadata. Must include: amount (number > 0), currency (PNCR), status (pending|accepted|rejected|countered)'
          },
          { status: 400 }
        );
      }
    }

    // Create message
    const message = await createChatMessage({
      roomId: id,
      senderId: dbUserId,
      content: content.trim(),
      type,
      metadata: type === 'offer' ? (metadata as OfferMetadata) : null
    });

    return NextResponse.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Error sending message:', error);

    // Handle validation errors from service layer
    if (error.message === 'Invalid offer metadata') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
