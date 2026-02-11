'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { base } from 'wagmi/chains';

const AGENT_WALLET_ADDRESS = '0x62905288110a94875Ed946EB9Fd79AfAbe893D62' as const;

const AGENT_WALLET_ABI = [
  {
    name: 'getWallet',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'walletId', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'agentId', type: 'string' },
          { name: 'balance', type: 'uint256' },
          { name: 'dailyLimit', type: 'uint256' },
          { name: 'spentToday', type: 'uint256' },
          { name: 'lastResetTime', type: 'uint256' },
          { name: 'whitelistEnabled', type: 'bool' },
          { name: 'active', type: 'bool' },
          { name: 'totalSpent', type: 'uint256' },
          { name: 'transactionCount', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getWalletsByOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }]
  }
] as const;

interface AgentWalletStatusProps {
  walletId?: string;
  ownerAddress?: string;
}

export function AgentWalletStatus({ walletId }: AgentWalletStatusProps) {
  // Read wallet data if walletId is provided
  const { data: walletData, isLoading, error } = useReadContract({
    address: AGENT_WALLET_ADDRESS,
    abi: AGENT_WALLET_ABI,
    functionName: 'getWallet',
    args: walletId ? [walletId as `0x${string}`] : undefined,
    chainId: base.id,
  });

  if (!walletId) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
        <p className="text-sm text-zinc-500">No on-chain wallet linked</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
        <p className="text-sm text-zinc-500">Loading on-chain data...</p>
      </div>
    );
  }

  if (error || !walletData) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-sm text-red-500">Failed to load on-chain wallet</p>
      </div>
    );
  }

  const balance = parseFloat(formatUnits(walletData.balance, 18)).toFixed(2);
  const dailyLimit = parseFloat(formatUnits(walletData.dailyLimit, 18)).toFixed(2);
  const spentToday = parseFloat(formatUnits(walletData.spentToday, 18)).toFixed(2);
  const totalSpent = parseFloat(formatUnits(walletData.totalSpent, 18)).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm">On-Chain Wallet</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          walletData.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {walletData.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-zinc-500">Balance</p>
          <p className="font-bold text-cyan-500">{balance} PNCR</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Daily Limit</p>
          <p className="font-medium">{dailyLimit} PNCR</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Spent Today</p>
          <p className="font-medium text-orange-500">{spentToday} PNCR</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Total Spent</p>
          <p className="font-medium">{totalSpent} PNCR</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Transactions</span>
          <span className="font-medium">{Number(walletData.transactionCount)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-zinc-500">Whitelist</span>
          <span className="font-medium">{walletData.whitelistEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      <a
        href={`https://basescan.org/address/${AGENT_WALLET_ADDRESS}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 text-center text-xs text-cyan-500 hover:underline"
      >
        View Contract on Basescan →
      </a>
    </div>
  );
}
