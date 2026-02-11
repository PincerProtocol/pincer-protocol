import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { requireAuth } from '@/lib/auth';
import { CreateSoulSchema, validateInput } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  // 1. Rate Limiting
  const rateLimitRes = await checkRateLimit(getIdentifier(request));
  if (rateLimitRes) return rateLimitRes;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');

    const where: any = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category })
    };

    const souls = await prisma.soul.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.soul.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        souls,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
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

    // Generate slug from name
    const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newSoul = await prisma.soul.create({
      data: {
        slug,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: Number(validatedData.price),
        tags: validatedData.tags || [],
        isActive: true
      }
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
