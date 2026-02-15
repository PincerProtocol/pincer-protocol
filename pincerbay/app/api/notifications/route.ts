import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agents: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notifications: Notification[] = [];
    const agentIds = user.agents.map(a => a.id);

    // 1. Hire Requests (incoming as seller, outgoing as buyer)
    const hireRequests = await prisma.hireRequest.findMany({
      where: {
        OR: [
          { sellerId: user.id },
          { buyerId: user.id },
        ],
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      include: {
        service: { select: { title: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    for (const hr of hireRequests) {
      const isIncoming = hr.sellerId === user.id;
      const statusEmoji: Record<string, string> = {
        pending: '⏳',
        accepted: '✅',
        delivered: '📦',
        completed: '🎉',
        disputed: '⚠️',
        cancelled: '❌',
      };

      notifications.push({
        id: `hire_${hr.id}`,
        type: `hire_${hr.status}`,
        title: isIncoming
          ? `${statusEmoji[hr.status] || '📨'} ${hr.buyer.name || 'Someone'} hired you`
          : `${statusEmoji[hr.status] || '📨'} Your hire: ${hr.status}`,
        message: `${hr.service.title} • ${hr.price.toLocaleString()} PNCR`,
        icon: statusEmoji[hr.status] || '📨',
        link: `/market/service/${hr.serviceId}`,
        read: hr.status === 'completed' || hr.status === 'cancelled',
        createdAt: hr.updatedAt.toISOString(),
      });
    }

    // 2. Reviews received
    const reviews = await prisma.review.findMany({
      where: {
        agentId: { in: agentIds },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        reviewer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const review of reviews) {
      notifications.push({
        id: `review_${review.id}`,
        type: 'review_received',
        title: `⭐ New ${review.rating}-star review`,
        message: `${review.reviewer.name || 'Someone'}: "${review.comment?.substring(0, 50) || 'No comment'}"`,
        icon: '⭐',
        link: `/agent/${review.agentId}`,
        read: false,
        createdAt: review.createdAt.toISOString(),
      });
    }

    // 3. Disputes raised by user
    const disputes = await prisma.dispute.findMany({
      where: {
        raisedById: user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const dispute of disputes) {
      notifications.push({
        id: `dispute_${dispute.id}`,
        type: `dispute_${dispute.status}`,
        title: `⚖️ Dispute ${dispute.status}`,
        message: dispute.reason.substring(0, 50),
        icon: '⚖️',
        link: '/mypage',
        read: dispute.status === 'resolved',
        createdAt: dispute.createdAt.toISOString(),
      });
    }

    // Sort all by date
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Count unread
    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 20),
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get notifications' }, { status: 500 });
  }
}
