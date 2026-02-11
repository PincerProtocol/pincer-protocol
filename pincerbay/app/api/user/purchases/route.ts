import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/purchases
 * Fetch all souls purchased by the current user
 *
 * Returns Purchase[] with Soul info
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all purchases by this user with Soul info
    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        status: 'confirmed' // Only show confirmed purchases
      },
      include: {
        soul: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            category: true,
            imageUrl: true,
            tags: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: purchases.map(purchase => ({
        id: purchase.id,
        soulId: purchase.soulId,
        price: purchase.price,
        currency: purchase.currency,
        txHash: purchase.txHash,
        createdAt: purchase.createdAt.toISOString(),
        soul: purchase.soul
      }))
    });
  } catch (error) {
    logger.error('GET /api/user/purchases error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
