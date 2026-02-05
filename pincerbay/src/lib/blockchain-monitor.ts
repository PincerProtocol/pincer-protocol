/**
 * Blockchain Payment Monitor
 * Monitors Treasury wallet for ETH/USDC/USDT deposits and auto-distributes PNCR
 */

import { ethers } from 'ethers';
import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';

// ERC20 ABI for token transfers
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

// PNCR token contract ABI (ERC20)
const PNCR_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];

// Supported tokens for payment
export const SUPPORTED_TOKENS = {
  ETH: 'ETH',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Mainnet USDT
} as const;

export interface DepositEvent {
  id: string;
  txHash: string;
  from: string;
  to: string;
  token: keyof typeof SUPPORTED_TOKENS;
  amount: string;
  amountUSD: number;
  blockNumber: number;
  timestamp: number;
  processed: boolean;
  pncrAmount?: string;
  pncrTxHash?: string;
}

/**
 * Get Alchemy SDK instance
 */
export function getAlchemy(): Alchemy {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY not configured');
  }

  const network = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
    ? Network.ETH_MAINNET 
    : Network.ETH_SEPOLIA;

  return new Alchemy({
    apiKey,
    network,
  });
}

/**
 * Get Treasury wallet address
 */
export function getTreasuryAddress(): string {
  const address = process.env.TREASURY_ADDRESS;
  if (!address) {
    throw new Error('TREASURY_ADDRESS not configured');
  }
  return address;
}

/**
 * Get PNCR contract address
 */
export function getPNCRAddress(): string {
  const address = process.env.NEXT_PUBLIC_PNCR_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error('PNCR_CONTRACT_ADDRESS not configured');
  }
  return address;
}

/**
 * Get Treasury wallet (for sending PNCR)
 */
export function getTreasuryWallet(): ethers.Wallet {
  const privateKey = process.env.TREASURY_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('TREASURY_PRIVATE_KEY not configured');
  }
  
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
  );
  
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Calculate PNCR amount based on USD value
 * Rate: 1 USD = 100 PNCR (adjustable)
 */
export function calculatePNCRAmount(usdAmount: number): string {
  const PNCR_PER_USD = parseFloat(process.env.PNCR_PER_USD || '100');
  const pncrAmount = usdAmount * PNCR_PER_USD;
  return pncrAmount.toFixed(2);
}

/**
 * Get ETH price in USD (simplified - use oracle in production)
 */
export async function getETHPriceUSD(): Promise<number> {
  // TODO: Integrate with Chainlink oracle or price feed API
  // For now, using a mock value
  return parseFloat(process.env.ETH_PRICE_USD || '2500');
}

/**
 * Get token price in USD
 */
export async function getTokenPriceUSD(token: keyof typeof SUPPORTED_TOKENS): Promise<number> {
  switch (token) {
    case 'ETH':
      return await getETHPriceUSD();
    case 'USDC':
    case 'USDT':
      return 1.0; // Stablecoins
    default:
      return 0;
  }
}

/**
 * Monitor ETH deposits to Treasury
 */
export async function checkETHDeposits(
  fromBlock: number,
  toBlock: number
): Promise<DepositEvent[]> {
  const alchemy = getAlchemy();
  const treasuryAddress = getTreasuryAddress();

  const transfers = await alchemy.core.getAssetTransfers({
    fromBlock: `0x${fromBlock.toString(16)}`,
    toBlock: `0x${toBlock.toString(16)}`,
    toAddress: treasuryAddress,
    // @ts-ignore - Alchemy SDK type mismatch, 'external' is valid but not in types
    category: ['external'],
    excludeZeroValue: true,
  });

  const ethPrice = await getETHPriceUSD();
  
  return transfers.transfers
    .filter(tx => tx.value !== null && tx.value > 0)
    .map(tx => ({
      id: `${tx.hash}-${tx.from}`,
      txHash: tx.hash,
      from: tx.from,
      to: tx.to || treasuryAddress,
      token: 'ETH' as const,
      amount: tx.value?.toString() || '0',
      amountUSD: (tx.value || 0) * ethPrice,
      blockNumber: parseInt(tx.blockNum, 16),
      timestamp: Date.now(),
      processed: false,
    }));
}

/**
 * Monitor ERC20 token deposits (USDC/USDT)
 */
export async function checkTokenDeposits(
  tokenAddress: string,
  tokenSymbol: keyof typeof SUPPORTED_TOKENS,
  fromBlock: number,
  toBlock: number
): Promise<DepositEvent[]> {
  const alchemy = getAlchemy();
  const treasuryAddress = getTreasuryAddress();

  const transfers = await alchemy.core.getAssetTransfers({
    fromBlock: `0x${fromBlock.toString(16)}`,
    toBlock: `0x${toBlock.toString(16)}`,
    toAddress: treasuryAddress,
    contractAddresses: [tokenAddress],
    // @ts-ignore - Alchemy SDK type mismatch, 'erc20' is valid but not in types
    category: ['erc20'],
    excludeZeroValue: true,
  });

  const tokenPrice = await getTokenPriceUSD(tokenSymbol);

  return transfers.transfers
    .filter(tx => tx.value !== null && tx.value > 0)
    .map(tx => ({
      id: `${tx.hash}-${tx.from}`,
      txHash: tx.hash,
      from: tx.from,
      to: tx.to || treasuryAddress,
      token: tokenSymbol,
      amount: tx.value?.toString() || '0',
      amountUSD: (tx.value || 0) * tokenPrice,
      blockNumber: parseInt(tx.blockNum, 16),
      timestamp: Date.now(),
      processed: false,
    }));
}

/**
 * Monitor all supported tokens
 */
export async function checkAllDeposits(
  fromBlock: number,
  toBlock: number
): Promise<DepositEvent[]> {
  const deposits: DepositEvent[] = [];

  // Check ETH deposits
  const ethDeposits = await checkETHDeposits(fromBlock, toBlock);
  deposits.push(...ethDeposits);

  // Check USDC deposits
  const usdcDeposits = await checkTokenDeposits(
    SUPPORTED_TOKENS.USDC,
    'USDC',
    fromBlock,
    toBlock
  );
  deposits.push(...usdcDeposits);

  // Check USDT deposits
  const usdtDeposits = await checkTokenDeposits(
    SUPPORTED_TOKENS.USDT,
    'USDT',
    fromBlock,
    toBlock
  );
  deposits.push(...usdtDeposits);

  return deposits;
}

/**
 * Send PNCR tokens to user
 */
export async function sendPNCR(
  toAddress: string,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const treasuryWallet = getTreasuryWallet();
    const pncrAddress = getPNCRAddress();

    const pncrContract = new ethers.Contract(
      pncrAddress,
      PNCR_ABI,
      treasuryWallet
    );

    // Convert amount to wei (18 decimals)
    const amountInWei = ethers.parseEther(amount);

    // Check Treasury balance first
    const balance = await pncrContract.balanceOf(treasuryWallet.address);
    if (balance < amountInWei) {
      return {
        success: false,
        error: `Insufficient PNCR balance in Treasury. Need ${amount}, have ${ethers.formatEther(balance)}`,
      };
    }

    // Send PNCR
    const tx = await pncrContract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error sending PNCR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process deposit and send PNCR
 */
export async function processDeposit(
  deposit: DepositEvent
): Promise<{ success: boolean; pncrTxHash?: string; error?: string }> {
  try {
    // Calculate PNCR amount
    const pncrAmount = calculatePNCRAmount(deposit.amountUSD);

    // Send PNCR to depositor
    const result = await sendPNCR(deposit.from, pncrAmount);

    if (result.success) {
      return {
        success: true,
        pncrTxHash: result.txHash,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error('Error processing deposit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current block number
 */
export async function getCurrentBlockNumber(): Promise<number> {
  const alchemy = getAlchemy();
  return await alchemy.core.getBlockNumber();
}

/**
 * Get safe block range (avoids reorgs)
 */
export async function getSafeBlockRange(
  lastProcessedBlock: number,
  confirmations: number = 12
): Promise<{ fromBlock: number; toBlock: number } | null> {
  const currentBlock = await getCurrentBlockNumber();
  const safeBlock = currentBlock - confirmations;

  if (safeBlock <= lastProcessedBlock) {
    return null; // No new blocks to process
  }

  return {
    fromBlock: lastProcessedBlock + 1,
    toBlock: safeBlock,
  };
}
