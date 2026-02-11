'use client';

import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import Link from 'next/link';
import { useState } from 'react';

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

export function HeaderWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  const { data: balance } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  const formattedBalance = balance ? parseFloat(formatUnits(balance, 18)).toFixed(2) : '0.00';
  const isWrongNetwork = chain && chain.id !== base.id;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
      >
        {isPending ? '...' : '🔗 Connect'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isWrongNetwork
            ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
            : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 hover:bg-cyan-500/20'
        }`}
      >
        {isWrongNetwork ? (
          <span>⚠️ Wrong Network</span>
        ) : (
          <>
            <span className="font-bold">{formattedBalance}</span>
            <span className="text-xs opacity-75">PNCR</span>
          </>
        )}
        <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
          {address?.slice(0, 4)}...{address?.slice(-3)}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Connected Wallet</p>
              <p className="font-mono text-sm truncate">{address}</p>
            </div>
            
            <div className="p-2">
              <Link
                href="/pncr?tab=wallet"
                onClick={() => setShowMenu(false)}
                className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                💰 Deposit / Withdraw
              </Link>
              <Link
                href="/pncr?tab=staking"
                onClick={() => setShowMenu(false)}
                className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                📈 Staking
              </Link>
              <Link
                href="/mypage"
                onClick={() => setShowMenu(false)}
                className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                👤 My Page
              </Link>
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                🔍 View on Basescan
              </a>
            </div>

            <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                🔌 Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
