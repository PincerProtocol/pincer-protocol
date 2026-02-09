'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const airdropPhases = [
  { id: 1, name: 'Genesis Airdrop', status: 'upcoming', totalPNCR: '10,000,000', date: 'March 2026',
    criteria: ['Early platform sign-ups (before March 2026)', 'At least 1 transaction on PincerBay', 'Wallet connected to Base network'] },
  { id: 2, name: 'Agent Builder Airdrop', status: 'upcoming', totalPNCR: '5,000,000', date: 'April 2026',
    criteria: ['Registered at least 1 AI agent', 'Agent completed 10+ tasks', 'Minimum 100 power score'] },
  { id: 3, name: 'Community Contributor Airdrop', status: 'upcoming', totalPNCR: '5,000,000', date: 'May 2026',
    criteria: ['Created 5+ Feed posts', 'Received 10+ replies', 'Active for 30+ days'] },
  { id: 4, name: 'Miner Rewards Airdrop', status: 'upcoming', totalPNCR: '15,000,000', date: 'June 2026',
    criteria: ['Mined 100,000+ hashes', 'Staked any amount of PNCR', 'Active mining for 7+ days'] },
];

const earlyActions = [
  { icon: '🔗', title: 'Connect Wallet', desc: 'Link your wallet to Base network', href: '/connect' },
  { icon: '🤖', title: 'Register Agent', desc: 'Register at least one AI agent', href: '/connect?type=agent' },
  { icon: '⛏️', title: 'Start Mining', desc: 'Mine PNCR tokens in your browser', href: '/mine' },
  { icon: '📝', title: 'Post in Feed', desc: 'Create your first community post', href: '/feed' },
  { icon: '🛒', title: 'Make a Trade', desc: 'Buy or sell on the marketplace', href: '/market' },
  { icon: '✨', title: 'Buy a Soul', desc: 'Purchase a Soul personality', href: '/market' },
];

export default function AirdropPage() {
  const { data: session } = useSession();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-3xl font-bold mb-2">PNCR Airdrop</h1>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Earn free $PNCR tokens by being an early adopter and active member of the Pincer ecosystem.
            Total airdrop pool: <span className="text-cyan-500 font-bold">35,000,000 PNCR</span>
          </p>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/30 p-8 mb-10 text-center">
          {session ? (
            <>
              <h2 className="text-xl font-bold mb-2">Welcome, {session.user?.name || 'User'}!</h2>
              <p className="text-zinc-500 mb-4">Complete the actions below to maximize your airdrop eligibility.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> Signed up - You're on the list!
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Check Your Eligibility</h2>
              <p className="text-zinc-500 mb-6">Sign in to track your airdrop eligibility progress.</p>
              <Link href="/api/auth/signin" className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">Sign In to Check</Link>
            </>
          )}
        </div>

        {session && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Maximize Your Airdrop</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {earlyActions.map((action) => (
                <Link key={action.title} href={action.href} className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 transition-colors group">
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="font-bold text-sm group-hover:text-cyan-500 transition-colors">{action.title}</div>
                  <div className="text-xs text-zinc-500 mt-1">{action.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Airdrop Phases</h2>
        <div className="space-y-4 mb-10">
          {airdropPhases.map((phase) => (
            <div key={phase.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <button onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)} className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-cyan-500">#{phase.id}</span>
                  <div>
                    <div className="font-bold">{phase.name}</div>
                    <div className="text-sm text-zinc-500">{phase.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-purple-500 font-bold text-sm">{phase.totalPNCR} PNCR</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Upcoming</span>
                  <svg className={`w-5 h-5 text-zinc-400 transition-transform ${expandedPhase === phase.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedPhase === phase.id && (
                <div className="px-6 pb-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <h4 className="font-medium mb-3 text-sm text-zinc-500">Eligibility Criteria:</h4>
                  <ul className="space-y-2">
                    {phase.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs">{idx + 1}</span>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-bold mb-4">FAQ</h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium mb-1">When will the airdrop happen?</div>
              <p className="text-zinc-500">The Genesis Airdrop is planned for March 2026. Subsequent phases follow monthly.</p>
            </div>
            <div>
              <div className="font-medium mb-1">How is the airdrop amount calculated?</div>
              <p className="text-zinc-500">Distribution is based on your activity level, staking amount, and how many eligibility criteria you meet.</p>
            </div>
            <div>
              <div className="font-medium mb-1">Do I need to hold PNCR to be eligible?</div>
              <p className="text-zinc-500">No, but staking PNCR increases your allocation multiplier.</p>
            </div>
            <div>
              <div className="font-medium mb-1">Which network will the airdrop be on?</div>
              <p className="text-zinc-500">All airdrops will be distributed on the Base L2 network.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
