import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';

// Package definitions (PNCR amounts based on FDV $10M = $0.0000571/PNCR)
// Pioneer: base, Builder: +10%, Contributor: +20%
const PACKAGES: Record<string, { priceUSD: number; pncrAmount: number; totalSpots: number }> = {
  pioneer: { priceUSD: 7.90, pncrAmount: 138000, totalSpots: 1000 },
  builder: { priceUSD: 39, pncrAmount: 751000, totalSpots: 500 },
  contributor: { priceUSD: 99, pncrAmount: 2080000, totalSpots: 100 },
};

// Get ETH price from CoinGecko
async function getETHPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    const data = await res.json();
    return data.ethereum?.usd || 2500; // Fallback to $2500
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    return 2500; // Fallback
  }
}

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

    // Get current ETH price
    const ethPrice = await getETHPrice();
    const expectedETH = pkg.priceUSD / ethPrice;

    // Verify the transaction on-chain
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Wait for transaction to be mined
    let receipt;
    try {
      receipt = await provider.waitForTransaction(txHash, 1, 60000);
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

    // Get sender address from transaction
    const senderAddress = tx.from.toLowerCase();

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

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found. Please login first.' }, { status: 404 });
    }

    if (!user.wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found. Please connect your wallet first.' }, { status: 404 });
    }

    const userWallet = user.wallet;

    // SECURITY: Verify sender is the logged-in user's wallet
    // This prevents someone from claiming another person's transaction
    if (userWallet.address && userWallet.address.toLowerCase() !== senderAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction sender does not match your registered wallet. Please use the same MetaMask account.' 
      }, { status: 403 });
    }

    // If user doesn't have a registered wallet address, save it now
    if (!userWallet.address) {
      await prisma.userWallet.update({
        where: { id: userWallet.id },
        data: { address: senderAddress },
      });
    }

    // Verify amount (allow 10% tolerance for ETH price fluctuations)
    const expectedWei = ethers.parseEther(expectedETH.toFixed(18));
    const minWei = expectedWei * BigInt(90) / BigInt(100);
    if (tx.value < minWei) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient payment. Expected ~${expectedETH.toFixed(4)} ETH ($${pkg.priceUSD})` 
      }, { status: 400 });
    }

    // Credit PNCR to internal balance only
    // Users can withdraw to on-chain later if needed
    // This enables gas-free transactions within PincerBay
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
          priceETH: expectedETH.toFixed(6),
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
        paymentTxHash: txHash,
        note: 'PNCR credited to your PincerBay balance! Use it to hire agents or withdraw anytime.',
      },
    });
  } catch (error) {
    console.error('Package purchase error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get current ETH price and package prices
export async function GET() {
  try {
    const ethPrice = await getETHPrice();
    
    const packagesWithETH = Object.entries(PACKAGES).map(([id, pkg]) => ({
      id,
      priceUSD: pkg.priceUSD,
      priceETH: (pkg.priceUSD / ethPrice).toFixed(6),
      pncrAmount: pkg.pncrAmount,
      totalSpots: pkg.totalSpots,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ethPrice,
        packages: packagesWithETH,
      },
    });
  } catch (error) {
    console.error('Failed to get package prices:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
