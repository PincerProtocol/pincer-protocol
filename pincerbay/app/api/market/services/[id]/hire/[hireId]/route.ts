import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CHALLENGE_PERIOD_MS = 2 * 60 * 60 * 1000; // 2 hours

// GET: Get hire request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hireId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { hireId } = await params;

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        service: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!hireRequest) {
      return NextResponse.json({ success: false, error: 'Hire request not found' }, { status: 404 });
    }

    // Check if challenge period expired
    const now = new Date();
    const challengeExpired = hireRequest.challengeEnd && now > hireRequest.challengeEnd;

    return NextResponse.json({
      success: true,
      data: {
        ...hireRequest,
        challengeExpired,
        challengeTimeLeft: hireRequest.challengeEnd 
          ? Math.max(0, hireRequest.challengeEnd.getTime() - now.getTime())
          : null,
      },
    });
  } catch (error) {
    console.error('Get hire request error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update hire request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hireId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { hireId } = await params;
    const { action } = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        service: true,
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (!hireRequest) {
      return NextResponse.json({ success: false, error: 'Hire request not found' }, { status: 404 });
    }

    const isBuyer = hireRequest.buyerId === user.id;
    const isSeller = hireRequest.sellerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    let result;
    const now = new Date();

    switch (action) {
      // Seller accepts the job
      case 'accept':
        if (!isSeller) {
          return NextResponse.json({ success: false, error: 'Only seller can accept' }, { status: 403 });
        }
        if (hireRequest.status !== 'pending') {
          return NextResponse.json({ success: false, error: 'Can only accept pending requests' }, { status: 400 });
        }
        result = await prisma.hireRequest.update({
          where: { id: hireId },
          data: { status: 'in_progress' },
        });
        break;

      // Seller delivers the work
      case 'deliver':
        if (!isSeller) {
          return NextResponse.json({ success: false, error: 'Only seller can deliver' }, { status: 403 });
        }
        if (hireRequest.status !== 'in_progress' && hireRequest.status !== 'accepted') {
          return NextResponse.json({ success: false, error: 'Can only deliver in-progress jobs' }, { status: 400 });
        }
        const challengeEnd = new Date(now.getTime() + CHALLENGE_PERIOD_MS);
        result = await prisma.hireRequest.update({
          where: { id: hireId },
          data: { 
            status: 'delivered',
            deliveredAt: now,
            challengeEnd,
          },
        });
        return NextResponse.json({
          success: true,
          data: result,
          message: `✅ Delivered! Buyer has 2 hours to review or raise a dispute.`,
          challengeEnd: challengeEnd.toISOString(),
        });

      // Buyer approves (releases funds immediately)
      case 'approve':
        if (!isBuyer) {
          return NextResponse.json({ success: false, error: 'Only buyer can approve' }, { status: 403 });
        }
        if (hireRequest.status !== 'delivered') {
          return NextResponse.json({ success: false, error: 'Can only approve delivered work' }, { status: 400 });
        }
        result = await prisma.hireRequest.update({
          where: { id: hireId },
          data: { 
            status: 'completed',
            completedAt: now,
          },
        });
        // TODO: Release escrow funds here
        return NextResponse.json({
          success: true,
          data: result,
          message: `✅ Approved! Funds will be released to seller.`,
        });

      // Buyer disputes within challenge period
      case 'dispute':
        if (!isBuyer) {
          return NextResponse.json({ success: false, error: 'Only buyer can dispute' }, { status: 403 });
        }
        if (hireRequest.status !== 'delivered') {
          return NextResponse.json({ success: false, error: 'Can only dispute delivered work' }, { status: 400 });
        }
        // Check if still within challenge period
        if (hireRequest.challengeEnd && now > hireRequest.challengeEnd) {
          return NextResponse.json({ 
            success: false, 
            error: 'Challenge period has expired. Work auto-approved.' 
          }, { status: 400 });
        }
        result = await prisma.hireRequest.update({
          where: { id: hireId },
          data: { status: 'disputed' },
        });
        return NextResponse.json({
          success: true,
          data: result,
          message: `⚠️ Dispute raised. Our team will review within 24 hours.`,
        });

      // Seller or buyer cancels
      case 'cancel':
        if (hireRequest.status === 'completed' || hireRequest.status === 'disputed') {
          return NextResponse.json({ success: false, error: 'Cannot cancel completed or disputed jobs' }, { status: 400 });
        }
        result = await prisma.hireRequest.update({
          where: { id: hireId },
          data: { status: 'cancelled' },
        });
        // TODO: Refund escrow to buyer
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update hire request error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
