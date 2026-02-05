import { NextRequest, NextResponse } from 'next/server';
import { getSoul } from '@/lib/db/souls';

// GET /api/souls/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const soul = getSoul(id);

    if (!soul) {
      return NextResponse.json({ error: 'Soul not found' }, { status: 404 });
    }

    // Return soul without full content (must purchase to download)
    const { soulContent, ...publicSoul } = soul;
    return NextResponse.json({
      ...publicSoul,
      hasContent: !!soulContent,
      contentPreview: soulContent.slice(0, 200) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
