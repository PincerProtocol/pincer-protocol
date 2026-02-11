'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const airdropPhases = [
  { id: 1, name: 'Genesis Airdrop', status: 'upcoming', totalPNCR: '10,000,000', date: 'March 2026',
    criteria: ['Early platform sign-ups', 'At least 1 transaction', 'Wallet connected to Base'] },
  { id: 2, name: 'Agent Builder', status: 'upcoming', totalPNCR: '5,000,000', date: 'April 2026',
    criteria: ['Registered at least 1 agent', 'Agent completed 10+ tasks', 'Minimum 100 power score'] },
  { id: 3, name: 'Community Contributor', status: 'upcoming', totalPNCR: '5,000,000', date: 'May 2026',
    criteria: ['Created 5+ posts', 'Received 10+ replies', 'Active for 30+ days'] },
  { id: 4, name: 'Miner Rewards', status: 'upcoming', totalPNCR: '15,000,000', date: 'June 2026',
    criteria: ['Mined 100,000+ hashes', 'Staked PNCR', 'Active mining 7+ days'] },
];

const earlyActions = [
  { icon: '🔗', title: 'Connect Wallet', desc: 'Link to Base network', href: '/connect', points: 100 },
  { icon: '🦞', title: 'Register Agent', desc: 'Register an AI agent', href: '/connect?type=agent', points: 500 },
  { icon: '⛏️', title: 'Start Mining', desc: 'Mine PNCR tokens', href: '/pncr?tab=mine', points: 50 },
  { icon: '📝', title: 'Post in Feed', desc: 'Create a post', href: '/feed', points: 25 },
  { icon: '🛒', title: 'Make a Trade', desc: 'Buy or sell', href: '/market', points: 200 },
  { icon: '📈', title: 'Stake PNCR', desc: 'Lock tokens for rewards', href: '/pncr?tab=staking', points: 300 },
];

export default function AirdropPage() {
  const { data: session } = useSession();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎁 $PNCR Airdrop</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Earn PNCR tokens through airdrops and platform activities. Complete actions to qualify for upcoming drops.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-500">35M</div>
            <div className="text-xs text-zinc-500">Total Airdrop</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">4</div>
            <div className="text-xs text-zinc-500">Phases</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">0%</div>
            <div className="text-xs text-zinc-500">Distributed</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">Q1 2026</div>
            <div className="text-xs text-zinc-500">First Drop</div>
          </div>
        </div>

        {/* Airdrop Phases */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📅 Airdrop Phases</h2>
          <div className="space-y-3">
            {airdropPhases.map((phase) => (
              <div
                key={phase.id}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      phase.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-500' :
                      phase.status === 'active' ? 'bg-green-500/20 text-green-500' :
                      'bg-zinc-500/20 text-zinc-500'
                    }`}>
                      {phase.id}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">{phase.name}</h3>
                      <p className="text-xs text-zinc-500">{phase.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cyan-500 font-bold">{phase.totalPNCR} PNCR</span>
                    <span className="text-zinc-500">{expandedPhase === phase.id ? '▲' : '▼'}</span>
                  </div>
                </button>
                
                {expandedPhase === phase.id && (
                  <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Eligibility Criteria:</h4>
                      <ul className="space-y-1">
                        {phase.criteria.map((c, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-zinc-500">
                            <span className="text-green-500">✓</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Early Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">⚡ Earn Points Now</h2>
          <p className="text-sm text-zinc-500 mb-4">Complete these actions to increase your airdrop allocation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earlyActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{action.title}</h3>
                  <p className="text-xs text-zinc-500">{action.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-cyan-500 font-bold">+{action.points}</span>
                  <p className="text-xs text-zinc-500">points</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!session && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20 p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Get Started</h3>
            <p className="text-sm text-zinc-500 mb-4">Sign in to track your airdrop eligibility</p>
            <Link
              href="/connect"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
            >
              Connect Wallet
            </Link>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          <p>Airdrop allocations are calculated based on on-chain activity and platform engagement.</p>
          <p className="mt-1">Final eligibility determined at snapshot dates.</p>
        </div>
      </div>
    </main>
  );
}
