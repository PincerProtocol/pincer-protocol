'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Tab = 'airdrop' | 'mine';

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
  { icon: '🔗', title: 'Connect Wallet', desc: 'Link to Base network', href: '/connect' },
  { icon: '🤖', title: 'Register Agent', desc: 'Register an AI agent', href: '/connect?type=agent' },
  { icon: '⛏️', title: 'Start Mining', desc: 'Mine PNCR tokens', action: 'mine' },
  { icon: '📝', title: 'Post in Feed', desc: 'Create a post', href: '/' },
  { icon: '🛒', title: 'Make a Trade', desc: 'Buy or sell', href: '/market' },
];

export default function AirdropPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('airdrop');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  
  // Mining state
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [earnedPNCR, setEarnedPNCR] = useState(0);
  const [miningTime, setMiningTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const simulateMining = () => {
    const rate = Math.floor(50 + Math.random() * 100);
    setHashRate(rate);
    setTotalHashes(prev => prev + rate);
    setEarnedPNCR(prev => Math.floor((totalHashes + rate) / 10000 * 100) / 100);
    setMiningTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
  };

  const startMining = () => {
    if (!session) return;
    setIsMining(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(simulateMining, 1000);
  };

  const stopMining = () => {
    setIsMining(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('airdrop')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              tab === 'airdrop'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            🎁 Airdrop
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              tab === 'mine'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            ⛏️ Mine
          </button>
        </div>

        {tab === 'airdrop' ? (
          <>
            {/* Airdrop Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🎁</div>
              <h1 className="text-2xl font-bold mb-2">PNCR Airdrop</h1>
              <p className="text-sm text-zinc-500">
                Total pool: <span className="text-cyan-500 font-bold">35,000,000 PNCR</span>
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 p-6 mb-6 text-center">
              {session ? (
                <>
                  <h2 className="font-bold mb-1">Welcome, {session.user?.name || 'User'}!</h2>
                  <p className="text-sm text-zinc-500 mb-3">Complete actions to maximize your airdrop.</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> You're on the list!
                  </span>
                </>
              ) : (
                <>
                  <h2 className="font-bold mb-3">Check Eligibility</h2>
                  <Link href="/connect" className="inline-block px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Actions */}
            {session && (
              <div className="mb-6">
                <h2 className="font-bold text-sm mb-3">Maximize Your Airdrop</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {earlyActions.map((action) => (
                    action.action === 'mine' ? (
                      <button
                        key={action.title}
                        onClick={() => setTab('mine')}
                        className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 transition-colors text-left"
                      >
                        <div className="text-xl mb-1">{action.icon}</div>
                        <div className="font-bold text-xs">{action.title}</div>
                        <div className="text-xs text-zinc-500">{action.desc}</div>
                      </button>
                    ) : (
                      <Link
                        key={action.title}
                        href={action.href!}
                        className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 transition-colors"
                      >
                        <div className="text-xl mb-1">{action.icon}</div>
                        <div className="font-bold text-xs">{action.title}</div>
                        <div className="text-xs text-zinc-500">{action.desc}</div>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Phases */}
            <h2 className="font-bold text-sm mb-3">Airdrop Phases</h2>
            <div className="space-y-2">
              {airdropPhases.map((phase) => (
                <div key={phase.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-500">#{phase.id}</span>
                      <div>
                        <div className="font-bold text-sm">{phase.name}</div>
                        <div className="text-xs text-zinc-500">{phase.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 font-bold text-xs hidden sm:block">{phase.totalPNCR}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-600">Upcoming</span>
                    </div>
                  </button>
                  {expandedPhase === phase.id && (
                    <div className="px-4 pb-4 text-xs text-zinc-500">
                      <ul className="space-y-1">
                        {phase.criteria.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mine Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⛏️</div>
              <h1 className="text-2xl font-bold mb-1">Mine PNCR</h1>
              <p className="text-sm text-zinc-500">Earn tokens with your browser</p>
            </div>

            {/* Mining Stats */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-4">
              <div className="text-center mb-6">
                <div className={`text-4xl font-mono font-bold ${isMining ? 'text-cyan-500' : 'text-zinc-400'}`}>
                  {hashRate.toLocaleString()} H/s
                </div>
                <p className="text-xs text-zinc-500">Hash Rate</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-bold text-purple-500">{formatTime(miningTime)}</div>
                  <div className="text-xs text-zinc-500">Time</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-cyan-500">{totalHashes.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Hashes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-500">{earnedPNCR}</div>
                  <div className="text-xs text-zinc-500">PNCR</div>
                </div>
              </div>

              {!session ? (
                <Link
                  href="/connect"
                  className="block w-full py-3 bg-zinc-700 text-white rounded-xl font-bold text-center"
                >
                  🔐 Sign in to Mine
                </Link>
              ) : !isMining ? (
                <button
                  onClick={startMining}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02]"
                >
                  ⛏️ Start Mining
                </button>
              ) : (
                <button
                  onClick={stopMining}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                >
                  ⏹️ Stop Mining
                </button>
              )}
            </div>

            {/* Mining Animation */}
            {isMining && (
              <div className="bg-zinc-900 rounded-xl p-4 mb-4 font-mono text-xs text-zinc-500">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i}>
                    Hash: 0x{Math.random().toString(16).slice(2, 18)}...
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-500/10 rounded-xl p-4">
                <h3 className="font-bold text-sm text-purple-500 mb-2">How it works</h3>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>• Browser CPU computes hashes</li>
                  <li>• 10,000 hashes = 1 PNCR</li>
                  <li>• Auto-stops when tab closes</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-4">
                <h3 className="font-bold text-sm text-cyan-500 mb-2">Tips</h3>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>• Consider electricity costs</li>
                  <li>• Keep laptop plugged in</li>
                  <li>• Works in background</li>
                </ul>
              </div>
            </div>

            <p className="text-center text-xs text-yellow-600 mt-4">
              ⚠️ Beta Mode - Blockchain integration in progress
            </p>
          </>
        )}
      </div>
    </main>
  );
}
