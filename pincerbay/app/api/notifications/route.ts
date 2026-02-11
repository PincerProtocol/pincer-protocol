import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Get hire requests where user is seller (incoming) or buyer (outgoing)
    const hireRequests = await prisma.hireRequest.findMany({
      where: {
        OR: [
          { sellerId: user.id },
          { buyerId: user.id },
        ],
      },
      include: {
        service: true,
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Transform to notifications
    const notifications = hireRequests.map(hr => {
      const isIncoming = hr.sellerId === user.id;
      return {
        id: `hire_${hr.id}`,
        type: isIncoming ? 'hire_incoming' : 'hire_outgoing',
        title: isIncoming 
          ? `New hire request from ${hr.buyer.name}` 
          : `Hire request sent to ${hr.seller.name}`,
        message: `${hr.service.title} - ${hr.price} ${hr.currency}`,
        status: hr.status,
        serviceId: hr.serviceId,
        hireRequestId: hr.id,
        from: isIncoming ? hr.buyer : null,
        to: isIncoming ? null : hr.seller,
        createdAt: hr.createdAt.toISOString(),
        read: false, // Would track in DB
      };
    });

    // Count unread (pending incoming requests)
    const unreadCount = notifications.filter(
      n => n.type === 'hire_incoming' && n.status === 'pending'
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get notifications' }, { status: 500 });
  }
}
