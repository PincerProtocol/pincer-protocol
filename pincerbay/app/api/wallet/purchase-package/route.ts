import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';

// Package definitions
const PACKAGES: Record<string, { priceETH: string; pncrAmount: number; totalSpots: number }> = {
  pioneer: { priceETH: '0.002', pncrAmount: 100000, totalSpots: 1000 },
  builder: { priceETH: '0.01', pncrAmount: 600000, totalSpots: 500 },
  contributor: { priceETH: '0.025', pncrAmount: 2000000, totalSpots: 100 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, txHash, pncrAmount } = await request.json();

    if (!packageId || !txHash) {
      return NextResponse.json({ success: false, error: 'Missing packageId or txHash' }, { status: 400 });
    }

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Invalid package' }, { status: 400 });
    }

    // Verify the transaction on-chain
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Wait for transaction to be mined
    let receipt;
    try {
      receipt = await provider.waitForTransaction(txHash, 1, 60000); // 1 confirmation, 60s timeout
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Transaction not found or pending' }, { status: 400 });
    }

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ success: false, error: 'Transaction failed' }, { status: 400 });
    }

    // Get transaction details
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 400 });
    }

    // Verify recipient is treasury
    if (tx.to?.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Invalid recipient address' }, { status: 400 });
    }

    // Verify amount (allow 5% tolerance for gas price variations)
    const expectedWei = ethers.parseEther(pkg.priceETH);
    const minWei = expectedWei * BigInt(95) / BigInt(100);
    if (tx.value < minWei) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient payment. Expected ${pkg.priceETH} ETH` 
      }, { status: 400 });
    }

    // Check if txHash already used
    const existingPurchase = await prisma.packagePurchase.findUnique({
      where: { txHash },
    });

    if (existingPurchase) {
      return NextResponse.json({ success: false, error: 'Transaction already claimed' }, { status: 400 });
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

    // Credit PNCR to user wallet + record purchase
    await prisma.$transaction([
      prisma.userWallet.update({
        where: { id: userWallet.id },
        data: {
          balance: { increment: pkg.pncrAmount },
        },
      }),
      prisma.packagePurchase.create({
        data: {
          userId: user.id,
          packageId,
          txHash,
          pncrAmount: pkg.pncrAmount,
          priceETH: pkg.priceETH,
        },
      }),
      prisma.walletTransaction.create({
        data: {
          fromWalletId: userWallet.id,
          toWalletId: userWallet.id,
          txType: 'package_purchase',
          amount: pkg.pncrAmount,
          description: `${packageId.charAt(0).toUpperCase() + packageId.slice(1)} Package - ${pkg.pncrAmount.toLocaleString()} PNCR`,
          txHash,
          status: 'confirmed',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pncrCredited: pkg.pncrAmount,
        packageId,
        txHash,
      },
    });
  } catch (error) {
    console.error('Package purchase error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
