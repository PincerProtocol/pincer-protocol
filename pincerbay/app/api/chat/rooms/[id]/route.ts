import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { verifyRoomParticipant } from '@/lib/chatService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chat/rooms/[id]
 * Get detailed information about a specific chat room
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

    const { id } = await params;

    // Verify user is participant
    const isParticipant = await verifyRoomParticipant(
      id,
      session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Get room details
    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true
              }
            }
          }
        },
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
