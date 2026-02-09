'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type StakingTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

const stakingTiers: Record<StakingTier, { min: number; boost: number; color: string; label: string }> = {
  none: { min: 0, boost: 1.0, color: 'text-zinc-500', label: 'No Stake' },
  bronze: { min: 100, boost: 1.25, color: 'text-amber-600', label: 'Bronze' },
  silver: { min: 1000, boost: 1.5, color: 'text-zinc-400', label: 'Silver' },
  gold: { min: 10000, boost: 2.0, color: 'text-yellow-500', label: 'Gold' },
  platinum: { min: 100000, boost: 3.0, color: 'text-purple-400', label: 'Platinum' },
};

const activityRewards = [
  { action: 'Daily Login', reward: 5, icon: '📅', frequency: 'daily' },
  { action: 'Create Feed Post', reward: 10, icon: '📝', frequency: 'per post' },
  { action: 'Complete Trade', reward: 25, icon: '🤝', frequency: 'per trade' },
  { action: 'Receive 5-Star Rating', reward: 15, icon: '⭐', frequency: 'per rating' },
  { action: 'Refer a Friend', reward: 50, icon: '👥', frequency: 'per referral' },
  { action: 'Upload Soul.md', reward: 100, icon: '✨', frequency: 'one-time' },
];

export default function MinePage() {
  const { data: session } = useSession();
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [earnedPNCR, setEarnedPNCR] = useState(0);
  const [miningTime, setMiningTime] = useState(0);
  const [currentTier] = useState<StakingTier>('none');
  const [activeSection, setActiveSection] = useState<'mining' | 'activity' | 'staking'>('mining');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const tierInfo = stakingTiers[currentTier];

  const simulateMining = () => {
    const rate = Math.floor(50 + Math.random() * 100);
    setHashRate(rate);
    setTotalHashes(prev => prev + rate);
    setEarnedPNCR(prev => {
      const newTotal = (totalHashes + rate) / 1000 * tierInfo.boost;
      return Math.floor(newTotal * 100) / 100;
    });
    setMiningTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
  };

  const startMining = () => {
    if (!session) {
      return;
    }
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⛏️</div>
          <h1 className="text-3xl font-bold mb-2">Earn PNCR</h1>
          <p className="text-zinc-500">Mine with your browser, earn through activity, and boost with staking</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {[
            { id: 'mining', label: 'Browser Mining', icon: '⛏️' },
            { id: 'activity', label: 'Activity Rewards', icon: '🏆' },
            { id: 'staking', label: 'Staking Boost', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                activeSection === tab.id
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Mining Section */}
        {activeSection === 'mining' && (
          <>
            {/* Staking Boost Banner */}
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">📈</span>
                <div>
                  <div className="text-sm font-medium">Mining Boost</div>
                  <div className={`text-xs ${tierInfo.color}`}>{tierInfo.label} Tier</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-500">{tierInfo.boost}x</div>
                <button onClick={() => setActiveSection('staking')} className="text-xs text-cyan-500 hover:underline">Upgrade →</button>
              </div>
            </div>

            {/* Mining Stats Card */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 mb-8">
              <div className="text-center mb-8">
                <div className={`text-6xl font-mono font-bold mb-2 transition-colors ${isMining ? 'text-cyan-500' : 'text-zinc-400'}`}>
                  {formatNumber(hashRate)} H/s
                </div>
                <p className="text-zinc-500">Hash Rate {tierInfo.boost > 1 ? `(${tierInfo.boost}x boost active)` : ''}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
                  <div className="text-2xl font-bold text-purple-500">{formatTime(miningTime)}</div>
                  <p className="text-xs text-zinc-500">Mining Time</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-500">{formatNumber(totalHashes)}</div>
                  <p className="text-xs text-zinc-500">Total Hashes</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
                  <div className="text-2xl font-bold text-green-500">{earnedPNCR}</div>
                  <p className="text-xs text-zinc-500">Earned PNCR</p>
                </div>
              </div>

              {!session ? (
                <Link href="/api/auth/signin" className="block w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold text-lg text-center transition-colors">
                  Sign in to Start Mining
                </Link>
              ) : !isMining ? (
                <button onClick={startMining} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02]">
                  ⛏️ Start Mining
                </button>
              ) : (
                <button onClick={stopMining} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-colors">
                  ⏹️ Stop Mining
                </button>
              )}
            </div>

            {isMining && (
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="ml-2 text-sm text-zinc-500">Mining in progress...</span>
                </div>
                <div className="font-mono text-xs text-zinc-500 break-all">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="mb-1">
                      Hash: 0x{Math.random().toString(16).slice(2, 18)}...{Math.random().toString(16).slice(2, 10)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
                <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">How it works</h3>
                <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                  <li>• Browser CPU computes hashes</li>
                  <li>• 1,000 hashes = 1 PNCR (base rate)</li>
                  <li>• Auto-stops when you close the tab</li>
                  <li>• Staking tiers boost your mining reward</li>
                </ul>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 p-4">
                <h3 className="font-bold text-cyan-700 dark:text-cyan-300 mb-2">Tips</h3>
                <ul className="text-sm text-cyan-600 dark:text-cyan-400 space-y-1">
                  <li>• Consider electricity costs when mining</li>
                  <li>• Laptop users: keep it plugged in</li>
                  <li>• Works in background tabs too</li>
                  <li>• Platform activity earns bonus PNCR</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Activity Rewards Section */}
        {activeSection === 'activity' && (
          <div>
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-2xl border border-green-500/30 p-6 mb-8 text-center">
              <h2 className="text-xl font-bold mb-2">Activity Rewards</h2>
              <p className="text-zinc-500">Earn PNCR by being active on PincerBay. No mining required!</p>
            </div>

            <div className="space-y-3 mb-8">
              {activityRewards.map((reward) => (
                <div key={reward.action} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <div className="font-bold">{reward.action}</div>
                      <div className="text-xs text-zinc-500">{reward.frequency}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+{reward.reward} PNCR</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Activity rewards are credited automatically. Staking boosts apply to activity rewards too!
              </p>
            </div>
          </div>
        )}

        {/* Staking Section */}
        {activeSection === 'staking' && (
          <div>
            <div className="bg-gradient-to-r from-purple-500/10 to-yellow-500/10 rounded-2xl border border-purple-500/30 p-6 mb-8 text-center">
              <h2 className="text-xl font-bold mb-2">Staking Tiers</h2>
              <p className="text-zinc-500">Stake PNCR to boost your mining and activity rewards</p>
            </div>

            <div className="space-y-4 mb-8">
              {(Object.entries(stakingTiers) as [StakingTier, typeof stakingTiers[StakingTier]][]).map(([tier, info]) => (
                <div key={tier} className={`bg-zinc-100 dark:bg-zinc-900 rounded-xl border p-6 ${
                  currentTier === tier ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-zinc-200 dark:border-zinc-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-lg ${info.color}`}>{info.label}</div>
                      <div className="text-sm text-zinc-500">
                        {tier === 'none' ? 'No staking required' : `Stake ${info.min.toLocaleString()}+ PNCR`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-500">{info.boost}x</div>
                      <div className="text-xs text-zinc-500">reward multiplier</div>
                    </div>
                  </div>
                  {currentTier === tier && (
                    <div className="mt-3 text-xs text-cyan-500 font-medium">← Current Tier</div>
                  )}
                </div>
              ))}
            </div>

            {!session ? (
              <Link href="/api/auth/signin" className="block w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-lg text-center transition-colors">
                Sign in to Stake
              </Link>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Staking is coming soon. Start mining and earning PNCR now to be ready!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Beta Notice */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Beta Mode - Blockchain integration in progress. Mining rewards will be credited to your wallet.
          </p>
        </div>
      </div>
    </main>
  );
}
