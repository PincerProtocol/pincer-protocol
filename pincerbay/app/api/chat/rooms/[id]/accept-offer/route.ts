import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/chat/rooms/[id]/accept-offer
 * Accepts an offer from a chat message and auto-creates an Escrow
 * Body: { messageId: string, amount?: number, terms?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: roomId } = await params;

  try {
    const body = await req.json();
    const { messageId, amount, terms } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Get the offer message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        room: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.roomId !== roomId) {
      return NextResponse.json(
        { error: 'Message does not belong to this room' },
        { status: 400 }
      );
    }

    if (message.type !== 'offer') {
      return NextResponse.json(
        { error: 'Message is not an offer' },
        { status: 400 }
      );
    }

    // Check if offer was already accepted
    const metadata = message.metadata as any;
    if (metadata?.status === 'accepted') {
      return NextResponse.json(
        { error: 'Offer already accepted', escrowId: metadata?.escrowId },
        { status: 409 }
      );
    }

    // Get the other participant (seller)
    const participants = message.room.participants;
    const otherParticipant = participants.find(
      p => p.userId !== session.user.id
    );

    if (!otherParticipant) {
      return NextResponse.json(
        { error: 'Other participant not found' },
        { status: 404 }
      );
    }

    // Determine buyer and seller
    // The person accepting the offer is the buyer
    const buyerId = session.user.id;
    const sellerId = otherParticipant.userId;

    // Get escrow amount from message metadata or request body
    const escrowAmount = amount || metadata?.amount || 0;

    if (escrowAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid escrow amount' },
        { status: 400 }
      );
    }

    // Check if seller is an agent or human
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { role: true }
    });

    // Create escrow
    // Note: Schema uses sellerAgentId for agents, but no sellerId for humans
    // This is a schema limitation - ideally we'd have both sellerId and sellerAgentId
    const escrow = await prisma.escrow.create({
      data: {
        buyerId,
        ...(seller?.role === 'agent' ? { sellerAgentId: sellerId } : {}),
        postId: message.room.relatedPostId,
        amount: escrowAmount,
        currency: 'PNCR',
        status: 'created',
      }
    });

    // Create system message announcing escrow creation
    await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.user.id,
        content: `Escrow created for ${escrowAmount} PNCR. ID: ${escrow.id}`,
        type: 'system',
        metadata: {
          escrowId: escrow.id,
          amount: escrowAmount,
          action: 'escrow_created'
        }
      }
    });

    // Update offer message metadata to mark as accepted
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        metadata: {
          ...metadata,
          status: 'accepted',
          escrowId: escrow.id,
          acceptedAt: new Date().toISOString(),
          acceptedBy: session.user.id
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        escrow,
        message: 'Escrow created successfully',
        fundUrl: `/escrow/${escrow.id}/fund`
      }
    });

  } catch (error) {
    console.error('Error accepting offer:', error);
    return NextResponse.json(
      { error: 'Failed to accept offer and create escrow' },
      { status: 500 }
    );
  }
}
