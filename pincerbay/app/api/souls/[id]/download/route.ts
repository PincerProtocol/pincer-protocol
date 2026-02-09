import { NextResponse } from 'next/server';
import { getSoulById, getSoulContent, hasPurchased } from '@/lib/soulsDB';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
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
    
    // Check if user has purchased
    if (!hasPurchased(id, wallet)) {
      return NextResponse.json(
        { error: 'Purchase required to download' },
        { status: 403 }
      );
    }
    
    // Get soul content
    const content = await getSoulContent(id);
    if (!content) {
      return NextResponse.json(
        { error: 'Soul content not found' },
        { status: 404 }
      );
    }
    
    // Return file as download
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${id}.md"`
      }
    });
  } catch (error) {
    logger.error('Error downloading soul:', error);
    return NextResponse.json(
      { error: 'Failed to download soul' },
      { status: 500 }
    );
  }
}
