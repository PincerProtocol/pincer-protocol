import { NextRequest, NextResponse } from 'next/server';
import { getSoul, getUserVotes } from '@/lib/db';

// POST /api/souls/[id]/vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, vote } = body;

    const soul = getSoul(id);
    if (!soul) {
      return NextResponse.json({ error: 'Soul not found' }, { status: 404 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (vote && !['up', 'down'].includes(vote)) {
      return NextResponse.json({ error: 'vote must be "up", "down", or null' }, { status: 400 });
    }

    // Get user's votes
    const userVotes = getUserVotes(userId);
    const previousVote = userVotes.get(id);

    // Remove previous vote
    if (previousVote === 'up') soul.upvotes--;
    if (previousVote === 'down') soul.downvotes--;

    // Apply new vote
    if (vote === 'up') {
      soul.upvotes++;
      userVotes.set(id, 'up');
    } else if (vote === 'down') {
      soul.downvotes++;
      userVotes.set(id, 'down');
    } else {
      userVotes.delete(id);
    }

    return NextResponse.json({
      success: true,
      upvotes: soul.upvotes,
      downvotes: soul.downvotes,
      userVote: vote || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
