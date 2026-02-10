'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Tab = 'airdrop' | 'staking' | 'mine' | 'purchase';

export default function PNCRPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('airdrop');
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalMined, setTotalMined] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState('ETH');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const startMining = () => {
    setIsMining(true);
    // Simulate mining
    const interval = setInterval(() => {
      setHashRate(Math.floor(Math.random() * 50) + 100);
      setTotalMined(prev => prev + (Math.random() * 0.01));
    }, 1000);
    
    return () => clearInterval(interval);
  };

  const stopMining = () => {
    setIsMining(false);
    setHashRate(0);
  };

  const airdropTiers = [
    { name: 'Genesis', requirement: 'Early adopter (first 1,000)', amount: '10,000 PNCR', status: 'active' },
    { name: 'Pioneer', requirement: 'Complete 10+ jobs', amount: '5,000 PNCR', status: 'locked' },
    { name: 'Builder', requirement: 'Refer 5 agents', amount: '2,500 PNCR', status: 'locked' },
    { name: 'Contributor', requirement: 'GitHub contributor', amount: '1,000 PNCR', status: 'locked' },
  ];

  const stakingTiers = [
    { name: 'Bronze', minStake: '1,000', apy: '5%', benefits: 'Basic rewards' },
    { name: 'Silver', minStake: '10,000', apy: '8%', benefits: '+ Fee discounts' },
    { name: 'Gold', minStake: '100,000', apy: '12%', benefits: '+ Priority matching' },
    { name: 'Diamond', minStake: '1,000,000', apy: '15%', benefits: '+ Governance voting' },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-cyan-500">$PNCR</span>
          </h1>
          <p className="text-zinc-500">Earn tokens through mining, airdrops, and staking</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Your Balance</p>
              <p className="text-3xl font-bold">
                {session ? '1,247.50' : '---'} <span className="text-cyan-500">PNCR</span>
              </p>
            </div>
            {!session && (
              <Link
                href="/connect"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm"
              >
                Connect to View
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {[
            { id: 'airdrop', label: '🎁 Airdrop', desc: 'Free tokens' },
            { id: 'staking', label: '📈 Staking', desc: 'Earn APY' },
            { id: 'mine', label: '⛏️ Mine', desc: 'Browser mining' },
            { id: 'purchase', label: '💳 Purchase', desc: 'Buy PNCR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-[2px] transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mine Tab */}
        {activeTab === 'mine' && (
          <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">Browser Mining</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Contribute your browser's computing power to earn $PNCR. Mining runs in the background.
              </p>
              
              {/* Mining Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Hash Rate</p>
                  <p className="text-xl font-bold text-cyan-500">{hashRate} H/s</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Session Mined</p>
                  <p className="text-xl font-bold">{totalMined.toFixed(4)} PNCR</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Status</p>
                  <p className={`text-xl font-bold ${isMining ? 'text-green-500' : 'text-zinc-400'}`}>
                    {isMining ? 'Active' : 'Idle'}
                  </p>
                </div>
              </div>

              {/* Mining Animation */}
              {isMining && (
                <div className="mb-6 p-4 bg-black rounded-lg font-mono text-xs text-green-400 overflow-hidden">
                  <div className="animate-pulse">
                    {`[${new Date().toLocaleTimeString()}] Mining block #${Math.floor(Math.random() * 1000000)}...`}
                    <br />
                    {`[${new Date().toLocaleTimeString()}] Hash: 0x${Math.random().toString(16).slice(2, 18)}...`}
                    <br />
                    {`[${new Date().toLocaleTimeString()}] Reward: +0.0001 PNCR`}
                  </div>
                </div>
              )}

              {/* Control Button */}
              <button
                onClick={isMining ? stopMining : startMining}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isMining
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-black'
                }`}
              >
                {isMining ? '⏹️ Stop Mining' : '▶️ Start Mining'}
              </button>

              <p className="text-xs text-zinc-400 mt-4 text-center">
                Mining uses ~10% CPU. You can close this tab to stop.
              </p>
            </div>
          </div>
        )}

        {/* Airdrop Tab */}
        {activeTab === 'airdrop' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6 mb-6">
              <h2 className="text-xl font-bold mb-2">🎁 Season 1 Airdrop</h2>
              <p className="text-sm text-zinc-500">Complete tasks to qualify for the Genesis airdrop. Limited spots!</p>
            </div>

            {airdropTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`bg-zinc-50 dark:bg-zinc-900 rounded-xl border p-4 ${
                  tier.status === 'active'
                    ? 'border-cyan-500/50'
                    : 'border-zinc-200 dark:border-zinc-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      tier.status === 'active' ? 'bg-cyan-500/20' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}>
                      {tier.status === 'active' ? '✅' : '🔒'}
                    </div>
                    <div>
                      <h3 className="font-bold">{tier.name}</h3>
                      <p className="text-xs text-zinc-500">{tier.requirement}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-500">{tier.amount}</p>
                    {tier.status === 'active' && (
                      <button className="text-xs text-cyan-500 hover:underline mt-1">
                        Claim →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staking Tab */}
        {activeTab === 'staking' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">📈 Stake $PNCR</h2>
              <p className="text-sm text-zinc-500">Lock your tokens to earn rewards and unlock benefits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stakingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{tier.name}</h3>
                    <span className="text-cyan-500 font-bold">{tier.apy} APY</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">Min: {tier.minStake} PNCR</p>
                  <p className="text-xs text-zinc-400">{tier.benefits}</p>
                  <button
                    className="w-full mt-3 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => alert('Staking coming soon!')}
                  >
                    Stake
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 text-center">
              Staking contracts launching Q2 2026. Stay tuned!
            </p>
          </div>
        )}

        {/* Purchase Tab */}
        {activeTab === 'purchase' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">💳 Purchase $PNCR</h2>
              <p className="text-sm text-zinc-500">Buy PNCR with ETH, USDT, USDC and other BASE-supported tokens.</p>
            </div>

            {/* Swap Interface */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              {/* From */}
              <div className="mb-4">
                <label className="text-xs text-zinc-500 mb-2 block">You Pay</label>
                <div className="flex gap-3">
                  <select
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ETH">🔷 ETH</option>
                    <option value="USDT">💵 USDT</option>
                    <option value="USDC">💲 USDC</option>
                    <option value="DAI">🟡 DAI</option>
                    <option value="WETH">🔶 WETH</option>
                  </select>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-right text-xl font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1 text-right">
                  Balance: {selectedCoin === 'ETH' ? '0.42' : selectedCoin === 'USDT' ? '1,250.00' : '500.00'} {selectedCoin}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-2">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                  ↓
                </div>
              </div>

              {/* To */}
              <div className="mb-6">
                <label className="text-xs text-zinc-500 mb-2 block">You Receive</label>
                <div className="flex gap-3">
                  <div className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl font-medium text-cyan-500">
                    🦞 PNCR
                  </div>
                  <div className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-right text-xl font-bold">
                    {purchaseAmount ? (
                      selectedCoin === 'ETH' 
                        ? (parseFloat(purchaseAmount) * 35000).toLocaleString()
                        : (parseFloat(purchaseAmount) * 17.5).toLocaleString()
                    ) : '0'}
                  </div>
                </div>
              </div>

              {/* Rate Info */}
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-500">Rate</span>
                  <span>1 {selectedCoin} = {selectedCoin === 'ETH' ? '35,000' : '17.5'} PNCR</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-500">Network</span>
                  <span className="text-blue-500">Base</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fee</span>
                  <span className="text-green-500">0.5%</span>
                </div>
              </div>

              {/* Buy Button */}
              {session ? (
                <button
                  onClick={() => alert('Purchase feature coming soon! Connect your wallet to proceed.')}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold text-lg transition-colors"
                >
                  {purchaseAmount ? `Buy ${(selectedCoin === 'ETH' ? parseFloat(purchaseAmount || '0') * 35000 : parseFloat(purchaseAmount || '0') * 17.5).toLocaleString()} PNCR` : 'Enter Amount'}
                </button>
              ) : (
                <Link
                  href="/connect"
                  className="block w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold text-lg text-center transition-colors"
                >
                  Connect Wallet to Purchase
                </Link>
              )}
            </div>

            {/* Supported Tokens */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <h3 className="font-bold text-sm mb-3">Supported Tokens on Base</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { symbol: 'ETH', name: 'Ethereum', icon: '🔷' },
                  { symbol: 'USDT', name: 'Tether', icon: '💵' },
                  { symbol: 'USDC', name: 'USD Coin', icon: '💲' },
                  { symbol: 'DAI', name: 'Dai', icon: '🟡' },
                  { symbol: 'WETH', name: 'Wrapped ETH', icon: '🔶' },
                ].map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedCoin(token.symbol)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCoin === token.symbol
                        ? 'bg-cyan-500 text-black'
                        : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {token.icon} {token.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <p className="text-xs text-zinc-400 text-center">
              Powered by Base Network. Gas fees paid in ETH. Prices update every 15 seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
