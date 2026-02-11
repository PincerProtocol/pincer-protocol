'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  txHash: string | null;
  createdAt: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  showOnChainLink?: boolean;
}

export function TransactionHistory({ transactions = [], showOnChainLink = true }: TransactionHistoryProps) {
  const { address } = useAccount();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '📤';
      case 'mining': return '⛏️';
      case 'reward': return '🎁';
      case 'purchase': return '🛒';
      case 'escrow': return '🔐';
      case 'transfer': return '↔️';
      case 'stake': return '📈';
      case 'unstake': return '📉';
      case 'fee': return '💸';
      default: return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'deposit' || type === 'mining' || type === 'reward') {
      return 'text-green-500';
    }
    if (type === 'withdrawal' || type === 'fee' || type === 'purchase') {
      return 'text-red-500';
    }
    return amount >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-bold mb-2">No transactions yet</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Your transaction history will appear here
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/mine" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors">
            Start Mining
          </Link>
          <Link href="/pncr?tab=wallet" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg font-bold text-sm transition-colors">
            Deposit PNCR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-cyan-500/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg">
              {getTypeIcon(tx.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm capitalize">{tx.type}</span>
                <span className={`font-bold ${getAmountColor(tx.type, tx.amount)}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(4)} PNCR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                  {tx.description || '-'}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-400">{formatDate(tx.createdAt)}</span>
                {tx.txHash && tx.txHash.startsWith('0x') && showOnChainLink && (
                  <a
                    href={`https://basescan.org/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-500 hover:underline"
                  >
                    View TX →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* On-chain activity link */}
      {address && showOnChainLink && (
        <div className="text-center py-4">
          <a
            href={`https://basescan.org/address/${address}#tokentxns`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-500 hover:underline"
          >
            View all on-chain activity on Basescan →
          </a>
        </div>
      )}
    </div>
  );
}
