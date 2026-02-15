import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VOTING_PERIOD_MS = 48 * 60 * 60 * 1000; // 48 hours for voting

// POST: Create a dispute
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { hireRequestId, reason, evidence } = await request.json();

    if (!hireRequestId || !reason) {
      return NextResponse.json({ success: false, error: 'Missing hireRequestId or reason' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireRequestId },
      include: { service: true },
    });

    if (!hireRequest) {
      return NextResponse.json({ success: false, error: 'Hire request not found' }, { status: 404 });
    }

    // Only buyer can raise dispute
    if (hireRequest.buyerId !== user.id) {
      return NextResponse.json({ success: false, error: 'Only buyer can raise a dispute' }, { status: 403 });
    }

    // Check if already disputed
    const existingDispute = await prisma.dispute.findUnique({
      where: { hireRequestId },
    });

    if (existingDispute) {
      return NextResponse.json({ success: false, error: 'Dispute already exists' }, { status: 400 });
    }

    // Create dispute
    const now = new Date();
    const votingEndsAt = new Date(now.getTime() + VOTING_PERIOD_MS);

    const dispute = await prisma.$transaction(async (tx) => {
      // Update hire request status
      await tx.hireRequest.update({
        where: { id: hireRequestId },
        data: { status: 'disputed' },
      });

      // Create dispute
      return tx.dispute.create({
        data: {
          hireRequestId,
          raisedById: user.id,
          reason,
          evidence: evidence ? JSON.stringify(evidence) : null,
          status: 'open',
          votingEndsAt,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dispute.id,
        hireRequestId: dispute.hireRequestId,
        status: dispute.status,
        votingEndsAt: dispute.votingEndsAt?.toISOString(),
        message: '⚠️ Dispute created. Seller has 24h to respond, then community voting begins.',
      },
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List disputes (for jurors)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'voting';

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agents: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user is a staker (has agents with staked amount)
    const totalStaked = user.agents.reduce((sum, agent) => sum + agent.stakedAmount, 0);
    
    if (totalStaked < 1000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Must stake at least 1000 PNCR to participate in dispute resolution',
        yourStake: totalStaked,
        required: 1000,
      }, { status: 403 });
    }

    // Get disputes available for voting
    const disputes = await prisma.dispute.findMany({
      where: {
        status: status === 'all' ? undefined : status,
      },
      include: {
        votes: {
          select: { id: true, vote: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: disputes.map(d => ({
        id: d.id,
        hireRequestId: d.hireRequestId,
        reason: d.reason,
        status: d.status,
        votingEndsAt: d.votingEndsAt?.toISOString(),
        voteCount: d.votes.length,
        buyerVotes: d.votes.filter(v => v.vote === 'buyer').length,
        sellerVotes: d.votes.filter(v => v.vote === 'seller').length,
        createdAt: d.createdAt.toISOString(),
      })),
      yourStake: totalStaked,
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
