import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Vote on a dispute
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: disputeId } = await params;
    const { vote, reason } = await request.json();

    if (!vote || !['buyer', 'seller'].includes(vote)) {
      return NextResponse.json({ success: false, error: 'Invalid vote. Must be "buyer" or "seller"' }, { status: 400 });
    }

    // Get user with agents
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agents: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Calculate stake weight (voting power)
    const totalStaked = user.agents.reduce((sum, agent) => sum + agent.stakedAmount, 0);
    
    if (totalStaked < 1000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Must stake at least 1000 PNCR to vote',
        yourStake: totalStaked,
        required: 1000,
      }, { status: 403 });
    }

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        votes: true,
      },
    });

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    // Check voting status
    if (dispute.status !== 'voting' && dispute.status !== 'open') {
      return NextResponse.json({ success: false, error: 'Voting is not open for this dispute' }, { status: 400 });
    }

    // Check if voting period ended
    if (dispute.votingEndsAt && new Date() > dispute.votingEndsAt) {
      return NextResponse.json({ success: false, error: 'Voting period has ended' }, { status: 400 });
    }

    // Check if user is involved in the dispute (can't vote on own disputes)
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: dispute.hireRequestId },
    });

    if (hireRequest && (hireRequest.buyerId === user.id || hireRequest.sellerId === user.id)) {
      return NextResponse.json({ success: false, error: 'Cannot vote on your own dispute' }, { status: 403 });
    }

    // Check if already voted
    const existingVote = dispute.votes.find(v => v.voterId === user.id);
    if (existingVote) {
      return NextResponse.json({ success: false, error: 'You have already voted' }, { status: 400 });
    }

    // Calculate vote weight (square root of stake for fairness)
    const stakeWeight = Math.sqrt(totalStaked);

    // Create vote and update dispute status to voting if needed
    const [newVote] = await prisma.$transaction([
      prisma.disputeVote.create({
        data: {
          disputeId,
          voterId: user.id,
          vote,
          stakeWeight,
          reason,
        },
      }),
      prisma.dispute.update({
        where: { id: disputeId },
        data: { status: 'voting' },
      }),
    ]);

    // Get updated vote counts
    const updatedDispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { votes: true },
    });

    const buyerWeight = updatedDispute?.votes
      .filter(v => v.vote === 'buyer')
      .reduce((sum, v) => sum + v.stakeWeight, 0) || 0;
    
    const sellerWeight = updatedDispute?.votes
      .filter(v => v.vote === 'seller')
      .reduce((sum, v) => sum + v.stakeWeight, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        voteId: newVote.id,
        vote: newVote.vote,
        yourWeight: stakeWeight,
        totalVotes: updatedDispute?.votes.length || 0,
        buyerWeight,
        sellerWeight,
        message: `✅ Vote recorded! Your voting power: ${stakeWeight.toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get vote status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        votes: {
          select: {
            id: true,
            vote: true,
            stakeWeight: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    const buyerVotes = dispute.votes.filter(v => v.vote === 'buyer');
    const sellerVotes = dispute.votes.filter(v => v.vote === 'seller');

    const buyerWeight = buyerVotes.reduce((sum, v) => sum + v.stakeWeight, 0);
    const sellerWeight = sellerVotes.reduce((sum, v) => sum + v.stakeWeight, 0);
    const totalWeight = buyerWeight + sellerWeight;

    return NextResponse.json({
      success: true,
      data: {
        disputeId,
        status: dispute.status,
        votingEndsAt: dispute.votingEndsAt?.toISOString(),
        totalVotes: dispute.votes.length,
        buyerVotes: buyerVotes.length,
        sellerVotes: sellerVotes.length,
        buyerWeight,
        sellerWeight,
        buyerPercent: totalWeight > 0 ? (buyerWeight / totalWeight * 100).toFixed(1) : 0,
        sellerPercent: totalWeight > 0 ? (sellerWeight / totalWeight * 100).toFixed(1) : 0,
        currentLeader: buyerWeight > sellerWeight ? 'buyer' : sellerWeight > buyerWeight ? 'seller' : 'tied',
      },
    });
  } catch (error) {
    console.error('Get vote status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
