'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import Link from 'next/link';

const PNCR_ADDRESS = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c' as const;
const TREASURY_ADDRESS = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb' as const;

// PNCR Purchase Contract (simple ETH -> PNCR swap via Treasury)
// For beta: direct transfer to treasury, manual PNCR distribution
// For production: integrate with Uniswap or custom swap contract

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface PurchasePNCRProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function PurchasePNCR({ showToast }: PurchasePNCRProps) {
  const { address, isConnected, chain } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDT'>('ETH');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Current rates (will be fetched from oracle in production)
  const rates = {
    ETH: 35000,  // 1 ETH = 35,000 PNCR
    USDT: 17.5,  // 1 USDT = 17.5 PNCR (approx $0.057 per PNCR)
  };

  const { data: pncrBalance } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const estimatedPNCR = amount ? parseFloat(amount) * rates[selectedToken] : 0;
  const isWrongNetwork = chain && chain.id !== base.id;
  const formattedBalance = pncrBalance ? parseFloat(formatUnits(pncrBalance, 18)).toFixed(2) : '0.00';

  useEffect(() => {
    if (isSuccess) {
      showToast(`Purchase request submitted! You will receive ${estimatedPNCR.toLocaleString()} PNCR within 24 hours.`, 'success');
      setAmount('');
      setIsPurchasing(false);
    }
    if (writeError) {
      showToast(`Transaction failed: ${writeError.message}`, 'error');
      setIsPurchasing(false);
    }
  }, [isSuccess, writeError]);

  const handlePurchase = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!isConnected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (isWrongNetwork) {
      showToast('Please switch to Base network', 'error');
      return;
    }

    setIsPurchasing(true);

    if (selectedToken === 'ETH') {
      // Direct ETH transfer to Treasury
      try {
        // Using window.ethereum for direct ETH transfer
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          showToast('MetaMask not found', 'error');
          setIsPurchasing(false);
          return;
        }

        const tx = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: TREASURY_ADDRESS,
            value: '0x' + parseUnits(amount, 18).toString(16),
            data: '0x' + Buffer.from(`PNCR_PURCHASE:${estimatedPNCR}`).toString('hex'),
          }],
        });

        showToast(`Transaction submitted! Hash: ${tx.slice(0, 10)}...`, 'info');
        
        // Record purchase request
        await fetch('/api/wallet/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: tx,
            fromToken: 'ETH',
            fromAmount: amount,
            toPNCR: estimatedPNCR,
            walletAddress: address,
          }),
        });

        showToast(`Purchase complete! ${estimatedPNCR.toLocaleString()} PNCR will be credited within 24 hours.`, 'success');
        setAmount('');
      } catch (err: any) {
        showToast(`Transaction failed: ${err.message || 'Unknown error'}`, 'error');
      } finally {
        setIsPurchasing(false);
      }
    } else {
      // For stablecoins, would need ERC20 approve + transferFrom
      showToast('USDT purchase coming soon! Use ETH for now.', 'info');
      setIsPurchasing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-lg font-bold mb-2">Connect Wallet to Purchase</h3>
        <p className="text-sm text-zinc-500 mb-4">Link your wallet to buy PNCR tokens</p>
        <Link
          href="/connect"
          className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold"
        >
          Connect Wallet
        </Link>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-orange-500 mb-2">Wrong Network</h3>
        <p className="text-sm text-zinc-500 mb-4">Please switch to Base network to purchase PNCR</p>
        <button
          onClick={() => {
            (window as any).ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // Base chainId
            });
          }}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold"
        >
          Switch to Base
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Your PNCR Balance</span>
          <span className="text-xl font-bold text-cyan-500">{formattedBalance} PNCR</span>
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Pay With</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedToken('ETH')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedToken === 'ETH'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
            }`}
          >
            <div className="text-2xl mb-1">🔷</div>
            <div className="font-bold">ETH</div>
            <div className="text-xs text-zinc-500">1 ETH = {rates.ETH.toLocaleString()} PNCR</div>
          </button>
          <button
            onClick={() => setSelectedToken('USDT')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedToken === 'USDT'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
            }`}
          >
            <div className="text-2xl mb-1">💵</div>
            <div className="font-bold">USDT</div>
            <div className="text-xs text-zinc-500">1 USDT = {rates.USDT} PNCR</div>
            <div className="text-xs text-orange-500 mt-1">Coming Soon</div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Amount ({selectedToken})</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.001"
            min="0"
            className="w-full px-4 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-mono focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-zinc-500">{selectedToken}</span>
          </div>
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2">
          {selectedToken === 'ETH' 
            ? ['0.01', '0.05', '0.1', '0.5'].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium"
                >
                  {val} ETH
                </button>
              ))
            : ['10', '50', '100', '500'].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium"
                >
                  ${val}
                </button>
              ))
          }
        </div>
      </div>

      {/* Estimate */}
      {amount && parseFloat(amount) > 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-500">You will receive</span>
            <span className="text-2xl font-bold text-cyan-500">
              ~{estimatedPNCR.toLocaleString()} PNCR
            </span>
          </div>
          <div className="text-xs text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 {selectedToken} = {rates[selectedToken].toLocaleString()} PNCR</span>
            </div>
            <div className="flex justify-between">
              <span>Network</span>
              <span className="text-blue-500">Base</span>
            </div>
            <div className="flex justify-between">
              <span>Processing</span>
              <span>Within 24 hours</span>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={isPurchasing || isPending || isConfirming || !amount || parseFloat(amount) <= 0 || selectedToken === 'USDT'}
        className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 text-black disabled:text-zinc-500 rounded-xl font-bold text-lg transition-colors"
      >
        {isPurchasing || isPending || isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : selectedToken === 'USDT' ? (
          'USDT Coming Soon - Use ETH'
        ) : amount ? (
          `Buy ${estimatedPNCR.toLocaleString()} PNCR`
        ) : (
          'Enter Amount'
        )}
      </button>

      {/* Info */}
      <div className="text-xs text-zinc-400 text-center space-y-1">
        <p>💡 PNCR will be credited to your internal balance after verification</p>
        <p>⚡ Powered by Base Network • Gas fees in ETH</p>
        <a
          href={`https://basescan.org/address/${TREASURY_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 hover:underline"
        >
          View Treasury on Basescan →
        </a>
      </div>
    </div>
  );
}
