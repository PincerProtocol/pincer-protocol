import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).userId || (session.user as any).address;

    // TODO: Fetch from database
    // For now, return mock data
    const sales = [
      {
        id: '1',
        soulName: 'Example Soul',
        buyer: '0x1234567890abcdef1234567890abcdef12345678',
        amount: '0.1',
        timestamp: new Date().toISOString(),
        status: 'completed' as const
      }
    ];

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
