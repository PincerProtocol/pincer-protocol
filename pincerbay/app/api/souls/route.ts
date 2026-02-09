import { NextResponse } from 'next/server';
import { getAllSouls, addSoul } from '@/lib/soulsDB';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { requireAuth } from '@/lib/auth';
import { CreateSoulSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  // 1. Rate Limiting
  const rateLimitRes = await checkRateLimit(getIdentifier(request));
  if (rateLimitRes) return rateLimitRes;

  try {
    const souls = getAllSouls();
    return NextResponse.json(souls);
  } catch (error) {
    logger.error('Error fetching souls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch souls' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 1. Rate Limiting
  const rateLimitRes = await checkRateLimit(getIdentifier(request));
  if (rateLimitRes) return rateLimitRes;

  // 2. Authentication
  const session = await requireAuth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 3. Validation
    const validation = validateInput(CreateSoulSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    const newSoul = addSoul({
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      price: Number(validatedData.price),
      tags: validatedData.tags || [],
      creator: session.user?.email || 'Anonymous'
    });
    
    return NextResponse.json(newSoul, { status: 201 });
  } catch (error) {
    logger.error('Error creating soul:', error);
    return NextResponse.json(
      { error: 'Failed to create soul' },
      { status: 500 }
    );
  }
}
