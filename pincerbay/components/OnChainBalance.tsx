'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import Link from 'next/link';

const PNCR_ADDRESS = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c' as const;

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface OnChainBalanceProps {
  showConnectPrompt?: boolean;
  compact?: boolean;
}

export function OnChainBalance({ showConnectPrompt = true, compact = false }: OnChainBalanceProps) {
  const { address, isConnected, chain } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  const formattedBalance = balance ? parseFloat(formatUnits(balance, 18)).toFixed(2) : '0.00';
  const isWrongNetwork = chain && chain.id !== base.id;

  if (!isConnected) {
    if (!showConnectPrompt) return null;
    
    return (
      <div className={`bg-zinc-100 dark:bg-zinc-800 rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
        <p className={`text-zinc-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          Connect wallet for on-chain balance
        </p>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className={`bg-orange-500/10 border border-orange-500/30 rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
        <p className={`text-orange-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          Switch to Base network
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">On-chain:</span>
        <span className="font-bold text-cyan-500">
          {isLoading ? '...' : formattedBalance} PNCR
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">On-Chain Balance (Base)</p>
          <p className="text-2xl font-bold text-cyan-500">
            {isLoading ? '...' : formattedBalance} <span className="text-lg">PNCR</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <Link 
            href="/pncr?tab=wallet" 
            className="text-xs text-cyan-500 hover:underline"
          >
            Deposit/Withdraw →
          </Link>
        </div>
      </div>
    </div>
  );
}
