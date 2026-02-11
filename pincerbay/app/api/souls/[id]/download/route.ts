import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authentication check
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get soul
    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }

    // Check if user has purchased
    const purchase = await prisma.purchase.findFirst({
      where: {
        soulId: id,
        userId: session.user.id,
        status: 'confirmed'
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase required to download' },
        { status: 403 }
      );
    }

    // Generate soul markdown content
    // TODO: For MVP, generate a basic markdown file. In future, fetch from IPFS using ipfsHash
    const content = `# ${soul.name}

${soul.description}

## Details
- **Category**: ${soul.category}
- **Price**: ${soul.price} PNCR
- **Tags**: ${soul.tags.join(', ')}

${soul.disclaimer ? `## Disclaimer\n${soul.disclaimer}` : ''}

---
*Downloaded from PincerBay - Soul Marketplace*
`;

    // Return file as download
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${soul.slug || id}.md"`
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
