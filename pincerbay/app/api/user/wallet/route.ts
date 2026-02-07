import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const address = (session.user as any).address;

    if (!address) {
      return NextResponse.json({ error: 'No wallet connected' }, { status: 400 });
    }

    // TODO: Fetch real blockchain data
    // For now, return mock data
    const walletData = {
      address,
      balance: '0.00',
      soulTokens: 0
    };

    return NextResponse.json(walletData);
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
