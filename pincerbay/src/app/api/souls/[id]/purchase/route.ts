import { NextRequest, NextResponse } from 'next/server';
import { getSoul, getUserPurchases } from '@/lib/db/souls';

// POST /api/souls/[id]/purchase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { buyerId } = body;

    const soul = getSoul(id);
    if (!soul) {
      return NextResponse.json({ error: 'Soul not found' }, { status: 404 });
    }

    if (!buyerId) {
      return NextResponse.json({ error: 'buyerId is required' }, { status: 400 });
    }

    // Check if already purchased
    const userPurchases = getUserPurchases(buyerId);

    if (userPurchases.has(id)) {
      return NextResponse.json(
        { error: 'You already own this soul', code: 'ALREADY_OWNED' },
        { status: 400 }
      );
    }

    // Record purchase
    userPurchases.add(id);
    soul.sales++;

    // Calculate earnings
    const platformFee = Math.floor(soul.price * 0.15);
    const sellerEarnings = soul.price - platformFee;

    return NextResponse.json({
      success: true,
      purchaseId: `purchase-${Date.now()}`,
      soul: {
        id: soul.id,
        name: soul.name,
        price: soul.price,
      },
      payment: {
        total: soul.price,
        platformFee,
        sellerEarnings,
      },
      message: 'Purchase successful! You can now download the SOUL.md file.'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
