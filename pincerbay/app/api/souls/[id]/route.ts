import { NextResponse } from 'next/server';
import { getSoulById, getSoulContent } from '@/lib/soulsDB';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { IdSchema, validateInput } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Rate Limiting
  const rateLimitRes = await checkRateLimit(getIdentifier(request));
  if (rateLimitRes) return rateLimitRes;

  try {
    const { id } = await params;
    
    // 3. Validation
    const validation = validateInput(IdSchema, id);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

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
