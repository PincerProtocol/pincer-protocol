import { prisma } from '@/lib/prisma';

/**
 * Chat Service - Business logic for chat operations
 */

export interface OfferMetadata {
  amount: number;
  currency: 'PNCR';
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export interface ChatRoomCreateParams {
  creatorId: string;
  participantId: string;
  type?: 'direct' | 'group' | 'negotiation';
  relatedPostId?: string;
}

/**
 * Find or create a chat room between two users
 */
export async function findOrCreateChatRoom(params: ChatRoomCreateParams) {
  const { creatorId, participantId, type = 'direct', relatedPostId } = params;

  // Check if room already exists between these users
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: creatorId } } },
        { participants: { some: { userId: participantId } } },
        { type }
      ]
    },
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
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (existingRoom) {
    return existingRoom;
  }

  // Create new room with both participants
  const newRoom = await prisma.chatRoom.create({
    data: {
      type,
      relatedPostId,
      participants: {
        create: [
          { userId: creatorId },
          { userId: participantId }
        ]
      }
    },
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
      }
    }
  });

  return newRoom;
}

/**
 * Verify user is a participant in the chat room
 */
export async function verifyRoomParticipant(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      participants: { some: { userId } }
    }
  });

  return !!room;
}

/**
 * Validate offer message metadata
 */
export function validateOfferMetadata(metadata: unknown): metadata is OfferMetadata {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const offer = metadata as Record<string, unknown>;

  return (
    typeof offer.amount === 'number' &&
    offer.amount > 0 &&
    offer.currency === 'PNCR' &&
    typeof offer.status === 'string' &&
    ['pending', 'accepted', 'rejected', 'countered'].includes(offer.status)
  );
}

/**
 * Create a chat message
 */
export async function createChatMessage(params: {
  roomId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'offer' | 'system';
  metadata?: OfferMetadata | null;
}) {
  const { roomId, senderId, content, type = 'text', metadata } = params;

  // Validate offer metadata if type is 'offer'
  if (type === 'offer') {
    if (!metadata || !validateOfferMetadata(metadata)) {
      throw new Error('Invalid offer metadata');
    }
  }

  // Create message
  const message = await prisma.chatMessage.create({
    data: {
      roomId,
      senderId: senderId,
      content,
      type,
      metadata: metadata ? (metadata as any) : undefined
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      }
    }
  });

  // Update room's updatedAt timestamp
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() }
  });

  return message;
}

/**
 * Get user's chat rooms with last message preview
 */
export async function getUserChatRooms(userId: string) {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
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
        take: 1,
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
    },
    orderBy: { updatedAt: 'desc' }
  });

  return rooms;
}

/**
 * Get chat room messages
 */
export async function getRoomMessages(roomId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return messages;
}

/**
 * Update last read timestamp for a participant
 */
export async function updateLastRead(roomId: string, userId: string) {
  await prisma.chatParticipant.updateMany({
    where: {
      roomId,
      userId
    },
    data: {
      lastReadAt: new Date()
    }
  });
}
