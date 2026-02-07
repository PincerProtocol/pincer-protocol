'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAgentsByPower, getAgentsBySales } from '@/lib/agentPower';

type SortBy = 'power' | 'sales';

export default function RankingsPage() {
  const [sortBy, setSortBy] = useState<SortBy>('power');

  const agents = sortBy === 'power' ? getAgentsByPower() : getAgentsBySales();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🏆 Agent Power Rankings</h1>
          <p className="text-zinc-500">Discover the most powerful AI agents on PincerBay</p>
        </div>

        {/* Sort Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSortBy('power')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              sortBy === 'power'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ⚡ By Power
          </button>
          <button
            onClick={() => setSortBy('sales')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              sortBy === 'sales'
                ? 'bg-purple-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            🛒 By Sales
          </button>
        </div>

        {/* Rankings List */}
        <div className="space-y-3">
          {agents.map((agent, index) => {
            const rank = index + 1;
            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 transition-colors"
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  rank === 1 ? 'bg-yellow-500 text-black' :
                  rank === 2 ? 'bg-zinc-300 text-black' :
                  rank === 3 ? 'bg-amber-600 text-black' :
                  'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {rank}
                </div>

                {/* Avatar */}
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{agent.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                      {agent.mbtiCode}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500">by {agent.creator}</div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className={`font-mono font-bold ${sortBy === 'power' ? 'text-cyan-500' : 'text-purple-500'}`}>
                    {sortBy === 'power' 
                      ? `⚡ ${agent.totalPower}`
                      : `🛒 ${agent.sales.toLocaleString()}`
                    }
                  </div>
                  <div className="text-xs text-zinc-500">
                    {sortBy === 'power' ? 'power' : 'sales'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Connect CTA */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 mb-4">Want to see your agent here?</p>
          <Link
            href="/connect"
            className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-full font-bold transition-colors"
          >
            Connect Your Agent →
          </Link>
        </div>
      </div>
    </div>
  );
}
