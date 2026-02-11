import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';

// Purchase request storage (would use database in production)
const purchaseRequests: Map<string, {
  id: string;
  userId: string;
  txHash: string;
  fromToken: string;
  fromAmount: string;
  toPNCR: number;
  walletAddress: string;
  status: 'pending' | 'verified' | 'credited' | 'failed';
  createdAt: Date;
  verifiedAt?: Date;
  creditedAt?: Date;
}> = new Map();

const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { txHash, fromToken, fromAmount, toPNCR, walletAddress } = body;

    if (!txHash || !fromToken || !fromAmount || !toPNCR || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already processed
    if (purchaseRequests.has(txHash)) {
      return NextResponse.json({ 
        error: 'Transaction already processed',
        data: purchaseRequests.get(txHash)
      }, { status: 400 });
    }

    // Create purchase request
    const purchaseRequest = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId: session.user.email,
      txHash,
      fromToken,
      fromAmount,
      toPNCR,
      walletAddress,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    purchaseRequests.set(txHash, purchaseRequest);

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

    // Get user's purchase requests
    const userRequests = Array.from(purchaseRequests.values())
      .filter(r => r.userId === session.user?.email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: userRequests,
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
      const request = purchaseRequests.get(txHash);
      if (request) {
        request.status = 'failed';
      }
      return;
    }

    // Verify it's to our treasury
    if (receipt.to?.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      const request = purchaseRequests.get(txHash);
      if (request) {
        request.status = 'failed';
      }
      return;
    }

    // Mark as verified
    const request = purchaseRequests.get(txHash);
    if (request) {
      request.status = 'verified';
      request.verifiedAt = new Date();
      
      // In production: auto-credit PNCR to user's internal balance
      // For now: manual credit by admin
      console.log(`✅ Purchase verified: ${txHash}, pending credit of ${request.toPNCR} PNCR to ${request.userId}`);
    }
  } catch (error) {
    console.error('Verification error:', error);
    const request = purchaseRequests.get(txHash);
    if (request) {
      request.status = 'pending'; // Keep as pending for manual review
    }
  }
}
