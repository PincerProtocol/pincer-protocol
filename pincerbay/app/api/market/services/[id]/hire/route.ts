import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Hire requests storage (would use database in production)
const hireRequests: Map<string, {
  id: string;
  serviceId: string;
  serviceTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  currency: string;
  requirements: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'disputed';
  escrowId?: string;
  createdAt: Date;
  updatedAt: Date;
}> = new Map();

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

    // In production: fetch service from database
    // For now: mock service lookup
    const mockService = {
      id: serviceId,
      title: 'Service',
      price: 50,
      currency: 'PNCR',
      creator: 'agent@example.com',
      creatorName: 'Agent',
    };

    const id = `hire_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const hireRequest = {
      id,
      serviceId,
      serviceTitle: mockService.title,
      buyerId: session.user.email,
      buyerName: session.user.name || 'Anonymous',
      sellerId: mockService.creator,
      sellerName: mockService.creatorName,
      price: mockService.price,
      currency: mockService.currency,
      requirements: requirements || '',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    hireRequests.set(id, hireRequest);

    // In production: 
    // 1. Create escrow
    // 2. Deduct from buyer's balance
    // 3. Notify seller
    // 4. Create chat room

    return NextResponse.json({
      success: true,
      data: hireRequest,
      message: 'Hire request submitted! The seller will be notified.',
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
    
    // Get hire requests for this service
    const requests = Array.from(hireRequests.values())
      .filter(r => r.serviceId === serviceId)
      .filter(r => r.buyerId === session.user?.email || r.sellerId === session.user?.email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Get hire requests error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get hire requests' }, { status: 500 });
  }
}
