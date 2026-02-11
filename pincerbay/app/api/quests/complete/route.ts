import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Quest definitions with validation rules
const QUESTS: Record<string, { reward: number; validateFn?: (userId: string) => Promise<boolean> }> = {
  'social-twitter': { reward: 50 },
  'social-discord': { reward: 100 },
  'social-telegram': { reward: 100 },
  'profile-complete': { 
    reward: 200,
    validateFn: async (userId: string) => {
      // Check if user has a profile (in production, verify profile completion)
      return true; // For now, auto-approve
    }
  },
  'first-post': { 
    reward: 150,
    validateFn: async (userId: string) => {
      const postCount = await prisma.feedPost.count({
        where: { authorId: userId },
      });
      return postCount >= 1;
    }
  },
  'first-comment': { 
    reward: 50,
    validateFn: async (userId: string) => {
      const commentCount = await prisma.feedComment.count({
        where: { authorId: userId },
      });
      return commentCount >= 1;
    }
  },
  'invite-friend': { reward: 500 },
  'first-hire': { 
    reward: 300,
    validateFn: async (userId: string) => {
      const hireCount = await prisma.hireRequest.count({
        where: { buyerId: userId },
      });
      return hireCount >= 1;
    }
  },
  'review-agent': { 
    reward: 100,
    validateFn: async (userId: string) => {
      const reviewCount = await prisma.agentReview.count({
        where: { userId: userId },
      });
      return reviewCount >= 1;
    }
  },
  'stake-pncr': { 
    reward: 500,
    validateFn: async (userId: string) => {
      // Would need to check on-chain staking
      return false; // Require manual verification for now
    }
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await request.json();

    if (!questId) {
      return NextResponse.json({ success: false, error: 'Missing questId' }, { status: 400 });
    }

    const quest = QUESTS[questId];
    if (!quest) {
      return NextResponse.json({ success: false, error: 'Invalid quest' }, { status: 400 });
    }

    // Get user by email, then wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    const userWallet = user.wallet;

    // Check if quest already completed
    const existingCompletion = await prisma.questCompletion.findUnique({
      where: {
        uniqueUserQuest: {
          userId: user.id,
          questId,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json({ success: false, error: 'Quest already completed' }, { status: 400 });
    }

    // Validate quest completion if validation function exists
    if (quest.validateFn) {
      const isValid = await quest.validateFn(user.id);
      if (!isValid) {
        return NextResponse.json({ 
          success: false, 
          error: 'Quest requirements not met. Complete the required action first!' 
        }, { status: 400 });
      }
    }

    // Credit PNCR + record completion
    await prisma.$transaction([
      prisma.userWallet.update({
        where: { id: userWallet.id },
        data: {
          balance: { increment: quest.reward },
        },
      }),
      prisma.questCompletion.create({
        data: {
          userId: user.id,
          questId,
          reward: quest.reward,
        },
      }),
      prisma.walletTransaction.create({
        data: {
          fromWalletId: userWallet.id,
          toWalletId: userWallet.id,
          txType: 'quest_reward',
          amount: quest.reward,
          description: `Quest completed: ${questId}`,
          status: 'confirmed',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questId,
        reward: quest.reward,
      },
    });
  } catch (error) {
    console.error('Quest completion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch user's quest completion status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: { completedQuests: [] } });
    }

    const completions = await prisma.questCompletion.findMany({
      where: { userId: user.id },
      select: { questId: true, completedAt: true, reward: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        completedQuests: completions,
      },
    });
  } catch (error) {
    console.error('Quest fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
