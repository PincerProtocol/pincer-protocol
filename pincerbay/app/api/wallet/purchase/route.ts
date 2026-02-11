import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { txHash, fromToken, fromAmount, toPNCR, walletAddress } = body;

    if (!txHash || !fromToken || !fromAmount || !toPNCR || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already processed
    const existing = await prisma.purchaseRequest.findUnique({
      where: { txHash },
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'Transaction already processed',
        data: {
          id: existing.id,
          status: existing.status,
        }
      }, { status: 400 });
    }

    // Create purchase request
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        userId: user.id,
        txHash,
        fromToken,
        fromAmount,
        toPNCR: parseFloat(String(toPNCR)),
        walletAddress,
        status: 'pending',
      },
    });

    // Verify transaction in background
    verifyTransaction(txHash, purchaseRequest.id);

    return NextResponse.json({
      success: true,
      message: 'Purchase request submitted. PNCR will be credited after verification.',
      data: {
        id: purchaseRequest.id,
        status: 'pending',
        estimatedCredit: '24 hours',
      }
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: error.message || 'Purchase failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's purchase requests
    const requests = await prisma.purchaseRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
        txHash: r.txHash,
        fromToken: r.fromToken,
        fromAmount: r.fromAmount,
        toPNCR: r.toPNCR,
        walletAddress: r.walletAddress,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        verifiedAt: r.verifiedAt?.toISOString(),
        creditedAt: r.creditedAt?.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get purchases' }, { status: 500 });
  }
}

// Background verification
async function verifyTransaction(txHash: string, requestId: string) {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    
    // Wait for transaction confirmation
    const receipt = await provider.waitForTransaction(txHash, 1, 60000);
    
    if (!receipt) {
      await prisma.purchaseRequest.update({
        where: { id: requestId },
        data: { status: 'failed' },
      });
      return;
    }

    // Verify it's to our treasury
    if (receipt.to?.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      await prisma.purchaseRequest.update({
        where: { id: requestId },
        data: { status: 'failed' },
      });
      return;
    }

    // Mark as verified
    const request = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: { 
        status: 'verified',
        verifiedAt: new Date(),
      },
      include: { user: true },
    });

    // Auto-credit PNCR to user's wallet
    if (request.user) {
      // Get or create user wallet
      let wallet = await prisma.userWallet.findUnique({
        where: { userId: request.userId },
      });

      if (!wallet) {
        wallet = await prisma.userWallet.create({
          data: {
            userId: request.userId,
            address: request.walletAddress,
            type: 'metamask',
            balance: 0,
          },
        });
      }

      // Credit PNCR
      await prisma.$transaction([
        prisma.userWallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: request.toPNCR } },
        }),
        prisma.walletTransaction.create({
          data: {
            toWalletId: wallet.id,
            amount: request.toPNCR,
            txType: 'deposit',
            txHash: txHash,
            status: 'confirmed',
            description: `PNCR purchase: ${request.fromAmount} ${request.fromToken}`,
          },
        }),
        prisma.purchaseRequest.update({
          where: { id: requestId },
          data: { 
            status: 'credited',
            creditedAt: new Date(),
          },
        }),
      ]);

      console.log(`✅ Purchase credited: ${request.toPNCR} PNCR to ${request.user.email}`);
    }
  } catch (error) {
    console.error('Verification error:', error);
    // Keep as pending for manual review
  }
}
