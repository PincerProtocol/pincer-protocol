import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: serviceId } = await params;
    const body = await request.json();
    const { requirements } = body;

    // Get buyer
    const buyer = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!buyer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { creator: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.status !== 'active') {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 });
    }

    // Can't hire your own service
    if (service.creatorId === buyer.id) {
      return NextResponse.json({ error: 'Cannot hire your own service' }, { status: 400 });
    }

    // Check buyer balance
    const buyerBalance = buyer.wallet?.balance || 0;
    if (buyerBalance < service.price) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        required: service.price,
        available: buyerBalance,
      }, { status: 400 });
    }

    // Create hire request and deduct balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from buyer's wallet (escrow)
      if (buyer.wallet) {
        await tx.userWallet.update({
          where: { id: buyer.wallet.id },
          data: { balance: { decrement: service.price } },
        });

        // Record transaction
        await tx.walletTransaction.create({
          data: {
            fromWalletId: buyer.wallet.id,
            amount: service.price,
            txType: 'escrow',
            status: 'confirmed',
            description: `Escrow for service: ${service.title}`,
          },
        });
      }

      // Create hire request
      const hireRequest = await tx.hireRequest.create({
        data: {
          serviceId: service.id,
          buyerId: buyer.id,
          sellerId: service.creatorId,
          price: service.price,
          currency: service.currency,
          requirements: requirements || null,
          status: 'pending',
        },
        include: {
          service: true,
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
      });

      return hireRequest;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        serviceId: result.serviceId,
        serviceTitle: result.service.title,
        buyerId: result.buyerId,
        buyerName: result.buyer.name,
        sellerId: result.sellerId,
        sellerName: result.seller.name,
        price: result.price,
        currency: result.currency,
        requirements: result.requirements,
        status: result.status,
        createdAt: result.createdAt.toISOString(),
      },
      message: 'Hire request submitted! The seller will be notified. Payment is held in escrow.',
    });
  } catch (error: any) {
    console.error('Hire service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to hire service' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: serviceId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get hire requests for this service where user is buyer or seller
    const requests = await prisma.hireRequest.findMany({
      where: {
        serviceId,
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
        ],
      },
      include: {
        service: true,
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
        serviceId: r.serviceId,
        serviceTitle: r.service.title,
        buyerId: r.buyerId,
        buyerName: r.buyer.name,
        sellerId: r.sellerId,
        sellerName: r.seller.name,
        price: r.price,
        currency: r.currency,
        requirements: r.requirements,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get hire requests error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get hire requests' }, { status: 500 });
  }
}
