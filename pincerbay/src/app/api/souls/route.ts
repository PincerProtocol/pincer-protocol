import { NextRequest, NextResponse } from 'next/server';
import { soulsDB } from '@/lib/db/souls';
import type { Soul } from '@/lib/db/souls';

export type { Soul };

// GET /api/souls - List all souls
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const category = searchParams.get('category') || undefined;
    const sortBy = (searchParams.get('sort') || 'popular') as 'popular' | 'newest' | 'price-low' | 'price-high' | 'top-voted';
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    
    // Query database
    const souls = soulsDB.query({
      category,
      search,
      featured,
      sortBy,
    });
    
    return NextResponse.json({
      success: true,
      souls,
      total: souls.length,
    });
  } catch (error) {
    console.error('Error fetching souls:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch souls' },
      { status: 500 }
    );
  }
}

// POST /api/souls - Create new soul
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const required = ['name', 'emoji', 'category', 'author', 'authorEmoji', 'price', 'description', 'skills', 'preview'];
    const missing = required.filter(field => !body[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate types
    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skills must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Create new soul
    const newSoul = soulsDB.create({
      name: body.name,
      emoji: body.emoji,
      category: body.category,
      author: body.author,
      authorEmoji: body.authorEmoji,
      price: body.price,
      description: body.description,
      skills: body.skills,
      preview: body.preview,
      featured: body.featured || false,
    });
    
    return NextResponse.json({
      success: true,
      soul: newSoul,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating soul:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create soul' },
      { status: 500 }
    );
  }
}
