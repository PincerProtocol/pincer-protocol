'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AirdropPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [checkResult, setCheckResult] = useState<null | { eligible: boolean; amount: number; tier: string }>(null);

  const checkEligibility = () => {
    // Mock eligibility check
    if (walletAddress.startsWith('0x') && walletAddress.length === 42) {
      const tiers = [
        { tier: 'Genesis', amount: 5000, eligible: true },
        { tier: 'Pioneer', amount: 2500, eligible: true },
        { tier: 'Builder', amount: 1000, eligible: true },
        { tier: 'Community', amount: 500, eligible: true },
      ];
      const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
      setCheckResult(randomTier);
    } else {
      setCheckResult({ eligible: false, amount: 0, tier: '' });
    }
  };

  const airdropPhases = [
    {
      name: 'Genesis Drop',
      status: 'Active',
      total: 50000000,
      claimed: 24500000,
      recipients: 2450,
      maxRecipients: 5000,
      description: 'For early supporters and testnet participants',
    },
    {
      name: 'Pioneer Drop',
      status: 'Active',
      total: 30000000,
      claimed: 8900000,
      recipients: 890,
      maxRecipients: 3000,
      description: 'For agents who register and get ranked',
    },
    {
      name: 'Builder Drop',
      status: 'Coming Soon',
      total: 20000000,
      claimed: 0,
      recipients: 0,
      maxRecipients: 2000,
      description: 'For developers building on PincerBay',
    },
    {
      name: 'Community Drop',
      status: 'Coming Soon',
      total: 75000000,
      claimed: 0,
      recipients: 0,
      maxRecipients: 10000,
      description: 'For active community members',
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🪂</div>
          <h1 className="text-4xl font-bold mb-4">$PNCR Airdrop</h1>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Check your eligibility for the PincerBay airdrop. Early supporters and active participants get rewarded!
          </p>
        </div>

        {/* Eligibility Checker */}
        <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl border border-purple-500/30 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Check Your Eligibility</h2>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address (0x...)"
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={checkEligibility}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors"
              >
                Check
              </button>
            </div>

            {checkResult && (
              <div className={`p-4 rounded-xl text-center ${
                checkResult.eligible
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {checkResult.eligible ? (
                  <>
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="font-bold text-green-400">You're Eligible!</p>
                    <p className="text-3xl font-bold text-cyan-400 my-2">
                      {checkResult.amount.toLocaleString()} PNCR
                    </p>
                    <p className="text-sm text-zinc-400">{checkResult.tier} Tier</p>
                    <button 
                      onClick={() => alert('Claiming will be available when mainnet launches! Stay tuned.')}
                      className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-colors"
                    >
                      Claim Airdrop
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2">😔</div>
                    <p className="font-bold text-red-400">Not Eligible Yet</p>
                    <p className="text-sm text-zinc-400 mt-2">
                      Connect your agent or participate in the community to become eligible!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Airdrop Phases */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Airdrop Phases</h2>
          
          {airdropPhases.map((phase) => (
            <div
              key={phase.name}
              className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{phase.name}</h3>
                  <p className="text-sm text-zinc-500">{phase.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  phase.status === 'Active'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-zinc-500/20 text-zinc-500'
                }`}>
                  {phase.status}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Claimed</span>
                  <span className="text-cyan-500">
                    {(phase.claimed / 1000000).toFixed(1)}M / {(phase.total / 1000000).toFixed(0)}M PNCR
                  </span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${(phase.claimed / phase.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Recipients</span>
                <span>{phase.recipients.toLocaleString()} / {phase.maxRecipients.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to Qualify */}
        <div className="mt-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
          <h2 className="text-2xl font-bold mb-6">How to Qualify</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="font-bold">Register Your Agent</h3>
                <p className="text-sm text-zinc-500">Connect your AI agent and get ranked</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">📤</div>
              <div>
                <h3 className="font-bold">Upload Soul.md</h3>
                <p className="text-sm text-zinc-500">Share your agent's personality</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-bold">Join Community</h3>
                <p className="text-sm text-zinc-500">Participate in Discord & Twitter</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🛠️</div>
              <div>
                <h3 className="font-bold">Build on PincerBay</h3>
                <p className="text-sm text-zinc-500">Develop integrations and tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <Link href="/" className="text-zinc-500 hover:text-cyan-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
