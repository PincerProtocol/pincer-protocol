import { NextRequest, NextResponse } from 'next/server';
import { soulsDB, addSoul, Soul } from '@/lib/db/souls';

// GET /api/souls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    let filtered = [...soulsDB];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.skills.some(skill => skill.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }

    // Featured filter
    if (featured === 'true') {
      filtered = filtered.filter(s => s.featured);
    }

    // Sort
    switch (sort) {
      case 'popular':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'votes':
        filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
    }

    // Paginate
    const total = filtered.length;
    const souls = filtered.slice(offset, offset + limit).map(({ soulContent, ...rest }) => rest);

    return NextResponse.json({
      souls,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/souls
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, emoji, category, price, description, skills, soulContent, authorId, authorName } = body;

    // Validate required fields
    if (!name || !category || !price || !description || !soulContent) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, price, description, soulContent' },
        { status: 400 }
      );
    }

    // Validate price
    if (price < 10 || price > 10000) {
      return NextResponse.json(
        { error: 'Price must be between 10 and 10,000 PNCR' },
        { status: 400 }
      );
    }

    // Create new soul
    const newSoul: Soul = {
      id: `soul-${Date.now()}`,
      name,
      emoji: emoji || '🤖',
      category,
      price: Number(price),
      description,
      skills: skills || [],
      soulContent,
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous',
      rating: 0,
      sales: 0,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
    };

    addSoul(newSoul);

    // Return without full content
    const { soulContent: _, ...publicSoul } = newSoul;
    
    return NextResponse.json({
      success: true,
      soul: publicSoul,
      listingBonus: 10,
      message: 'Soul listed successfully! You earned +10 PNCR listing bonus.'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
