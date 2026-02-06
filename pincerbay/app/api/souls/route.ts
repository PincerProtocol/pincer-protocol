import { NextResponse } from 'next/server';
import { getAllSouls, addSoul } from '@/lib/soulsDB';

export async function GET() {
  try {
    const souls = getAllSouls();
    return NextResponse.json(souls);
  } catch (error) {
    console.error('Error fetching souls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch souls' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.description || !body.category || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newSoul = addSoul({
      name: body.name,
      description: body.description,
      category: body.category,
      price: Number(body.price),
      tags: body.tags || [],
      creator: body.creator || 'Anonymous'
    });
    
    return NextResponse.json(newSoul, { status: 201 });
  } catch (error) {
    console.error('Error creating soul:', error);
    return NextResponse.json(
      { error: 'Failed to create soul' },
      { status: 500 }
    );
  }
}
