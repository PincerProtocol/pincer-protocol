import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Staking tiers
const STAKING_TIERS = {
  none: { min: 0, boost: 1.0 },
  bronze: { min: 1000, boost: 1.1 },      // +10% earnings
  silver: { min: 10000, boost: 1.25 },    // +25% earnings
  gold: { min: 50000, boost: 1.5 },       // +50% earnings
  platinum: { min: 100000, boost: 2.0 },  // +100% earnings
};

function getTier(amount: number): string {
  if (amount >= STAKING_TIERS.platinum.min) return 'platinum';
  if (amount >= STAKING_TIERS.gold.min) return 'gold';
  if (amount >= STAKING_TIERS.silver.min) return 'silver';
  if (amount >= STAKING_TIERS.bronze.min) return 'bronze';
  return 'none';
}

function getBoost(tier: string): number {
  return STAKING_TIERS[tier as keyof typeof STAKING_TIERS]?.boost || 1.0;
}

// POST: Stake PNCR on agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agentId } = await params;
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid stake amount' }, { status: 400 });
    }

    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Check ownership
    if (agent.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: 'You can only stake on your own agents' }, { status: 403 });
    }

    // Check balance
    if (user.wallet.balance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient balance',
        required: amount,
        available: user.wallet.balance,
      }, { status: 400 });
    }

    // Calculate new tier
    const newStakedAmount = agent.stakedAmount + amount;
    const newTier = getTier(newStakedAmount);
    const newBoost = getBoost(newTier);

    // Execute staking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.userWallet.update({
        where: { id: user.wallet!.id },
        data: { balance: { decrement: amount } },
      });

      // Add to agent stake
      const updatedAgent = await tx.agent.update({
        where: { id: agentId },
        data: {
          stakedAmount: { increment: amount },
          stakingTier: newTier,
          miningBoost: newBoost,
        },
      });

      // Record transaction
      await tx.walletTransaction.create({
        data: {
          fromWalletId: user.wallet!.id,
          amount,
          txType: 'stake',
          status: 'confirmed',
          description: `Staked ${amount} PNCR on agent: ${agent.name}`,
        },
      });

      return updatedAgent;
    });

    return NextResponse.json({
      success: true,
      data: {
        agentId: result.id,
        stakedAmount: result.stakedAmount,
        tier: result.stakingTier,
        boost: result.miningBoost,
        message: `✅ Staked ${amount} PNCR! New tier: ${newTier.toUpperCase()} (${newBoost}x earnings)`,
      },
    });
  } catch (error) {
    console.error('Stake error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Unstake PNCR from agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agentId } = await params;
    const { searchParams } = new URL(request.url);
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid unstake amount' }, { status: 400 });
    }

    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Check ownership
    if (agent.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: 'You can only unstake from your own agents' }, { status: 403 });
    }

    // Check staked amount
    if (agent.stakedAmount < amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient staked amount',
        requested: amount,
        staked: agent.stakedAmount,
      }, { status: 400 });
    }

    // Calculate new tier
    const newStakedAmount = agent.stakedAmount - amount;
    const newTier = getTier(newStakedAmount);
    const newBoost = getBoost(newTier);

    // Execute unstaking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Add to wallet
      await tx.userWallet.update({
        where: { id: user.wallet!.id },
        data: { balance: { increment: amount } },
      });

      // Remove from agent stake
      const updatedAgent = await tx.agent.update({
        where: { id: agentId },
        data: {
          stakedAmount: { decrement: amount },
          stakingTier: newTier,
          miningBoost: newBoost,
        },
      });

      // Record transaction
      await tx.walletTransaction.create({
        data: {
          toWalletId: user.wallet!.id,
          amount,
          txType: 'unstake',
          status: 'confirmed',
          description: `Unstaked ${amount} PNCR from agent: ${agent.name}`,
        },
      });

      return updatedAgent;
    });

    return NextResponse.json({
      success: true,
      data: {
        agentId: result.id,
        stakedAmount: result.stakedAmount,
        tier: result.stakingTier,
        boost: result.miningBoost,
        returnedToWallet: amount,
        message: `✅ Unstaked ${amount} PNCR! New tier: ${newTier.toUpperCase()}`,
      },
    });
  } catch (error) {
    console.error('Unstake error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get staking info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        stakedAmount: true,
        stakingTier: true,
        miningBoost: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        agentId: agent.id,
        agentName: agent.name,
        stakedAmount: agent.stakedAmount,
        tier: agent.stakingTier,
        boost: agent.miningBoost,
        tiers: STAKING_TIERS,
        nextTier: agent.stakingTier === 'platinum' ? null : {
          tier: agent.stakingTier === 'none' ? 'bronze' : 
                agent.stakingTier === 'bronze' ? 'silver' :
                agent.stakingTier === 'silver' ? 'gold' : 'platinum',
          required: agent.stakingTier === 'none' ? STAKING_TIERS.bronze.min - agent.stakedAmount :
                    agent.stakingTier === 'bronze' ? STAKING_TIERS.silver.min - agent.stakedAmount :
                    agent.stakingTier === 'silver' ? STAKING_TIERS.gold.min - agent.stakedAmount :
                    STAKING_TIERS.platinum.min - agent.stakedAmount,
        },
      },
    });
  } catch (error) {
    console.error('Get staking info error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
