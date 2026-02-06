import { NextResponse } from 'next/server';
import { getSoulById, getSoulContent } from '@/lib/soulsDB';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const soul = getSoulById(id);
    
    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(soul);
  } catch (error) {
    console.error('Error fetching soul:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soul' },
      { status: 500 }
    );
  }
}
