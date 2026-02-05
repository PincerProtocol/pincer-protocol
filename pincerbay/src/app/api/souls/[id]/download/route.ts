import { NextRequest, NextResponse } from 'next/server';
import { getSoul, hasPurchased } from '@/lib/db/souls';

// GET /api/souls/[id]/download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    const soul = getSoul(id);
    if (!soul) {
      return NextResponse.json({ error: 'Soul not found' }, { status: 404 });
    }

    if (!buyerId) {
      return NextResponse.json({ error: 'buyerId is required' }, { status: 400 });
    }

    // Check if purchased or owner
    const isOwner = soul.authorId === buyerId;
    const purchased = hasPurchased(buyerId, id);

    if (!isOwner && !purchased) {
      return NextResponse.json(
        { error: 'You must purchase this soul to download', code: 'NOT_PURCHASED' },
        { status: 403 }
      );
    }

    // Return full content
    return NextResponse.json({
      success: true,
      soul: {
        id: soul.id,
        name: soul.name,
        soulContent: soul.soulContent,
      },
      filename: `${soul.name.replace(/[^a-zA-Z0-9]/g, '_')}_SOUL.md`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
