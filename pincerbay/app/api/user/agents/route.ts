import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).userId || (session.user as any).address;

    // TODO: Fetch from database
    // For now, return mock data
    const agents = [
      {
        id: '1',
        name: 'Example Agent',
        endpoint: 'https://example.com/api',
        powerScore: 85,
        status: 'active' as const,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
