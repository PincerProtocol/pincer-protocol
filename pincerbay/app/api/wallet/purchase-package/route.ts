import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';
const PNCR_TOKEN_ADDRESS = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c';
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

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

    // Get user's wallet address from the transaction
    const userWalletAddress = tx.from;

    // Verify recipient is treasury
    if (tx.to?.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Invalid recipient address' }, { status: 400 });
    }

    // Verify amount (allow 20% tolerance for ETH price fluctuations)
    const expectedWei = ethers.parseEther(expectedETH.toFixed(18));
    const minWei = expectedWei * BigInt(80) / BigInt(100);
    if (tx.value < minWei) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient payment. Expected ~${expectedETH.toFixed(4)} ETH ($${pkg.priceUSD})` 
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

    // Send actual PNCR tokens to user's MetaMask wallet
    let pncrTxHash: string | null = null;
    
    if (PLATFORM_PRIVATE_KEY) {
      try {
        const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);
        const pncrContract = new ethers.Contract(PNCR_TOKEN_ADDRESS, ERC20_ABI, platformWallet);
        
        // PNCR has 18 decimals
        const pncrAmountWei = ethers.parseEther(pkg.pncrAmount.toString());
        
        // Check platform balance
        const platformBalance = await pncrContract.balanceOf(platformWallet.address);
        if (platformBalance < pncrAmountWei) {
          console.error('Insufficient PNCR balance in platform wallet');
          // Continue with internal balance only
        } else {
          // Transfer PNCR to user's wallet
          const pncrTx = await pncrContract.transfer(userWalletAddress, pncrAmountWei);
          const pncrReceipt = await pncrTx.wait();
          pncrTxHash = pncrReceipt.hash;
          console.log(`PNCR transferred to ${userWalletAddress}: ${pncrTxHash}`);
        }
      } catch (error) {
        console.error('Failed to transfer PNCR tokens:', error);
        // Continue with internal balance only - don't fail the whole purchase
      }
    } else {
      console.warn('PLATFORM_PRIVATE_KEY not set - skipping on-chain PNCR transfer');
    }

    // Credit PNCR to internal balance + record purchase
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
          txHash: pncrTxHash || txHash,
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
        pncrTxHash: pncrTxHash, // null if on-chain transfer failed/skipped
        userWallet: userWalletAddress,
        note: pncrTxHash 
          ? 'PNCR sent to your MetaMask wallet!' 
          : 'PNCR credited to internal balance. Withdraw anytime.',
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
