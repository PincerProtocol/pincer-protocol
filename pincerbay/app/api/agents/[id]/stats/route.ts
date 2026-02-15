import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Agent analytics dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        wallet: true,
        owner: { select: { id: true, name: true } },
      },
    });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Get services
    const services = await prisma.service.findMany({
      where: { creatorId: id },
    });

    // Get hire requests stats
    const hireStats = await prisma.hireRequest.groupBy({
      by: ['status'],
      where: {
        service: { creatorId: id },
      },
      _count: true,
      _sum: { price: true },
    });

    // Get recent hires
    const recentHires = await prisma.hireRequest.findMany({
      where: {
        service: { creatorId: id },
      },
      include: {
        service: { select: { title: true } },
        buyer: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get reviews stats
    const reviews = await prisma.review.findMany({
      where: { agentId: id },
      select: { rating: true, createdAt: true },
    });

    const ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating - 1]++;
      }
    });

    // Calculate earnings by period
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedHires = await prisma.hireRequest.findMany({
      where: {
        service: { creatorId: id },
        status: 'completed',
      },
      select: { price: true, updatedAt: true },
    });

    const earnings7d = completedHires
      .filter(h => h.updatedAt >= last7Days)
      .reduce((sum, h) => sum + h.price, 0);

    const earnings30d = completedHires
      .filter(h => h.updatedAt >= last30Days)
      .reduce((sum, h) => sum + h.price, 0);

    // Build stats summary
    const statusMap: Record<string, { count: number; amount: number }> = {};
    hireStats.forEach(s => {
      statusMap[s.status] = {
        count: s._count,
        amount: s._sum.price || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          type: agent.type,
          powerScore: agent.powerScore,
          stakingTier: agent.stakingTier,
          stakedAmount: agent.stakedAmount,
          createdAt: agent.createdAt.toISOString(),
        },
        stats: {
          totalEarnings: agent.totalEarnings,
          tasksCompleted: agent.tasksCompleted,
          avgRating: agent.avgRating,
          totalRatings: agent.totalRatings,
          servicesCount: services.length,
        },
        earnings: {
          last7Days: earnings7d,
          last30Days: earnings30d,
          allTime: agent.totalEarnings,
        },
        hires: {
          pending: statusMap['pending']?.count || 0,
          accepted: statusMap['accepted']?.count || 0,
          completed: statusMap['completed']?.count || 0,
          disputed: statusMap['disputed']?.count || 0,
          cancelled: statusMap['cancelled']?.count || 0,
          total: Object.values(statusMap).reduce((sum, s) => sum + s.count, 0),
        },
        reviews: {
          total: reviews.length,
          distribution: ratingDistribution,
          recent: reviews.slice(0, 5).map(r => ({
            rating: r.rating,
            createdAt: r.createdAt.toISOString(),
          })),
        },
        recentActivity: recentHires.map(h => ({
          id: h.id,
          type: 'hire',
          title: h.service.title,
          buyer: h.buyer.name,
          price: h.price,
          status: h.status,
          createdAt: h.createdAt.toISOString(),
        })),
        wallet: agent.wallet ? {
          address: agent.wallet.address,
          balance: agent.wallet.balance,
        } : null,
      },
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
