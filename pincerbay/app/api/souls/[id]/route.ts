import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { IdSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';

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

    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(soul);
  } catch (error) {
    logger.error('Error fetching soul:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soul' },
      { status: 500 }
    );
  }
}
