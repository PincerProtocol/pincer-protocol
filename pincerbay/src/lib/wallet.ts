import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// Environment variable for encryption key (REQUIRED in production)
function getEncryptionKey(): string {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  
  if (!key) {
    // During build time, use default key
    if (typeof window === 'undefined' && !process.env.VERCEL) {
      return 'dev-key-pincerbay-2026-not-for-production';
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: WALLET_ENCRYPTION_KEY not set in production!');
    }
    return 'dev-key-pincerbay-2026-not-for-production';
  }
  
  if (key.length < 32) {
    console.warn('⚠️ WARNING: WALLET_ENCRYPTION_KEY should be at least 32 characters');
  }
  
  return key;
}

export interface WalletData {
  userId: string;
  address: string;
  encryptedPrivateKey: string;
  createdAt: number;
}

export interface TransactionHistory {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  token?: string;
}

/**
 * Create a new temporary wallet
 */
export function createWallet(userId: string): WalletData {
  const wallet = ethers.Wallet.createRandom();
  
  // Encrypt private key with AES-256
  const encryptedPrivateKey = CryptoJS.AES.encrypt(
    wallet.privateKey,
    getEncryptionKey()
  ).toString();

  return {
    userId,
    address: wallet.address,
    encryptedPrivateKey,
    createdAt: Date.now(),
  };
}

/**
 * Decrypt and recover wallet from encrypted private key
 */
export function recoverWallet(encryptedPrivateKey: string): ethers.Wallet {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedPrivateKey, getEncryptionKey());
  const privateKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
  
  if (!privateKey) {
    throw new Error('Failed to decrypt private key');
  }

  return new ethers.Wallet(privateKey);
}

/**
 * Get RPC provider (using Sepolia testnet for development)
 */
export function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get PNCR token contract address
 */
export function getPNCRContractAddress(): string {
  return process.env.NEXT_PUBLIC_PNCR_CONTRACT_ADDRESS || '';
}

/**
 * Get ETH balance
 */
export async function getETHBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Get PNCR token balance
 */
export async function getPNCRBalance(address: string): Promise<string> {
  const contractAddress = getPNCRContractAddress();
  if (!contractAddress) return '0';

  const provider = getProvider();
  
  // ERC20 balanceOf ABI
  const abi = ['function balanceOf(address owner) view returns (uint256)'];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching PNCR balance:', error);
    return '0';
  }
}

/**
 * Get transaction history for an address
 */
export async function getTransactionHistory(
  address: string,
  limit: number = 10
): Promise<TransactionHistory[]> {
  const provider = getProvider();
  
  try {
    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 10000); // Last ~10k blocks
    
    // This is a simplified version - in production, use an indexer like Etherscan API
    const transactions: TransactionHistory[] = [];
    
    // For demo purposes, we'll just return empty array
    // In production, integrate with Etherscan API or run your own indexer
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Verify transaction by hash
 */
export async function verifyTransaction(txHash: string): Promise<{
  verified: boolean;
  from?: string;
  to?: string;
  value?: string;
  blockNumber?: number;
}> {
  const provider = getProvider();
  
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { verified: false };
    }

    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return { verified: false };
    }

    return {
      verified: true,
      from: tx.from,
      to: tx.to || undefined,
      value: ethers.formatEther(tx.value),
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false };
  }
}

/**
 * Send ETH or tokens from custodial wallet
 */
export async function sendTransaction(
  encryptedPrivateKey: string,
  to: string,
  amount: string,
  isToken: boolean = false
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const wallet = recoverWallet(encryptedPrivateKey);
    const provider = getProvider();
    const connectedWallet = wallet.connect(provider);

    if (isToken) {
      // Send PNCR tokens
      const contractAddress = getPNCRContractAddress();
      if (!contractAddress) {
        return { success: false, error: 'PNCR contract address not configured' };
      }

      const abi = ['function transfer(address to, uint256 amount) returns (bool)'];
      const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
      
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.transfer(to, amountInWei);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt?.hash || tx.hash };
    } else {
      // Send ETH
      const tx = await connectedWallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();

      return { success: true, txHash: receipt?.hash || tx.hash };
    }
  } catch (error) {
    console.error('Error sending transaction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
