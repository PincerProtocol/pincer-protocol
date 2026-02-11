'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import { useToast } from '@/components/Toast';

// Contract addresses
const PNCR_ADDRESS = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c' as const;
const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb' as const;

// Minimal ERC20 ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface DepositPNCRProps {
  onSuccess?: (txHash: string, amount: string) => void;
}

export function DepositPNCR({ onSuccess }: DepositPNCRProps) {
  const { address, isConnected, chain } = useAccount();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Read on-chain PNCR balance
  const { data: onChainBalance, refetch: refetchBalance } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  // Write contract
  const { 
    writeContract, 
    data: txHash, 
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();

  // Wait for transaction
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash && amount) {
      handleVerifyDeposit(txHash);
    }
  }, [isConfirmed, txHash]);

  // Show error toast
  useEffect(() => {
    if (writeError) {
      showToast(writeError.message.slice(0, 100) || 'Transaction failed', 'error');
    }
  }, [writeError]);

  const handleDeposit = async () => {
    if (!amount || !address) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    const balanceNum = onChainBalance ? parseFloat(formatUnits(onChainBalance, 18)) : 0;
    if (amountNum > balanceNum) {
      showToast(`Insufficient PNCR balance. You have ${balanceNum.toFixed(2)} PNCR`, 'error');
      return;
    }

    try {
      writeContract({
        address: PNCR_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, parseUnits(amount, 18)],
        chainId: base.id,
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to send transaction', 'error');
    }
  };

  const handleVerifyDeposit = async (hash: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/wallet/verify-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: hash }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`${data.data.amount.toFixed(2)} PNCR deposited successfully!`, 'success');
        setAmount('');
        refetchBalance();
        onSuccess?.(hash, amount);
      } else {
        showToast(data.error || 'Verification failed', 'error');
      }
    } catch (error) {
      showToast('Failed to verify deposit', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const formattedBalance = onChainBalance 
    ? parseFloat(formatUnits(onChainBalance, 18)).toFixed(2) 
    : '0.00';

  const isWrongNetwork = chain?.id !== base.id;
  const isProcessing = isWriting || isConfirming || isVerifying;

  if (!isConnected) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-500 mb-4">Connect your wallet to deposit PNCR</p>
        <p className="text-xs text-zinc-400">Use the "Connect Wallet" button above</p>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
        <p className="text-orange-500 font-medium mb-2">Wrong Network</p>
        <p className="text-sm text-zinc-500">Please switch to Base Mainnet in your wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* On-chain Balance */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-500">Your On-Chain PNCR</span>
          <span className="font-bold text-cyan-500">{formattedBalance} PNCR</span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          />
          <button
            onClick={() => setAmount(formattedBalance)}
            disabled={isProcessing}
            className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50"
          >
            Max
          </button>
        </div>
      </div>

      {/* Deposit Button */}
      <button
        onClick={handleDeposit}
        disabled={isProcessing || !amount || parseFloat(amount) <= 0}
        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWriting ? '⏳ Confirm in Wallet...' :
         isConfirming ? '⏳ Confirming...' :
         isVerifying ? '⏳ Verifying...' :
         '💰 Deposit PNCR'}
      </button>

      {/* Transaction Status */}
      {txHash && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-400">
            {isConfirming ? 'Transaction pending...' :
             isVerifying ? 'Verifying deposit...' :
             isConfirmed ? '✅ Deposit confirmed!' : 'Processing...'}
          </p>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-500 hover:underline"
          >
            View on Basescan →
          </a>
        </div>
      )}
    </div>
  );
}
