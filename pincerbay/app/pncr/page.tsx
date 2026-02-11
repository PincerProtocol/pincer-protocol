'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with wagmi
const DepositPNCR = dynamic(
  () => import('@/components/DepositPNCR').then(mod => ({ default: mod.DepositPNCR })),
  { ssr: false, loading: () => <div className="py-4 text-center text-zinc-500">Loading...</div> }
);

const StakingPNCR = dynamic(
  () => import('@/components/StakingPNCR').then(mod => ({ default: mod.StakingPNCR })),
  { ssr: false, loading: () => <div className="py-4 text-center text-zinc-500">Loading staking...</div> }
);

const PurchasePNCR = dynamic(
  () => import('@/components/PurchasePNCR').then(mod => ({ default: mod.PurchasePNCR })),
  { ssr: false, loading: () => <div className="py-4 text-center text-zinc-500">Loading purchase...</div> }
);

type Tab = 'airdrop' | 'staking' | 'rewards' | 'wallet';

interface MiningSession {
  id: string;
  startedAt: string;
  estimatedEarnings: number;
}

interface MiningStats {
  session: MiningSession | null;
  durationMinutes: number;
  estimatedEarnings: number;
  miningBoost: number;
  activityBonus: boolean;
  todayStats: {
    earned: number;
    cap: number;
  };
}

export default function PNCRPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('airdrop');
  const [balance, setBalance] = useState('0');
  const [isMining, setIsMining] = useState(false);
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [selectedCoin, setSelectedCoin] = useState('ETH');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Wallet tab state
  const [depositTxHash, setDepositTxHash] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);
  
  // ETH price state
  const [ethPrice, setEthPrice] = useState<number>(2500); // Default fallback

  // Load wallet balance
  useEffect(() => {
    if (!session) return;

    const loadWallet = async () => {
      try {
        const res = await fetch('/api/my-wallet');
        const data = await res.json();
        setBalance(data.data?.userWallet?.balance || '0');
      } catch (error) {
        console.error('Failed to load wallet:', error);
      }
    };

    loadWallet();
    const interval = setInterval(loadWallet, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [session]);

  // Load ETH price
  useEffect(() => {
    const loadETHPrice = async () => {
      try {
        const res = await fetch('/api/wallet/purchase-package');
        const data = await res.json();
        if (data.success && data.data?.ethPrice) {
          setEthPrice(data.data.ethPrice);
        }
      } catch (error) {
        console.error('Failed to load ETH price:', error);
      }
    };

    loadETHPrice();
    const interval = setInterval(loadETHPrice, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Poll mining status
  const startStatusPolling = () => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }

    const pollStatus = async () => {
      try {
        const res = await fetch('/api/mining/status');
        const data = await res.json();
        setMiningStats(data.data);

        // Stop polling if session ended
        if (!data.data?.session) {
          setIsMining(false);
          setMiningSession(null);
          if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Failed to fetch mining status:', error);
      }
    };

    pollStatus(); // Initial fetch
    statusIntervalRef.current = setInterval(pollStatus, 5000); // Poll every 5s
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  const startMining = async () => {
    try {
      const res = await fetch('/api/mining/start', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setMiningSession(data.data);
        setIsMining(true);
        startStatusPolling();
        showToast('Mining started!', 'success');
      } else {
        showToast(data.error || 'Failed to start mining', 'error');
      }
    } catch (error) {
      console.error('Failed to start mining:', error);
      showToast('Failed to start mining', 'error');
    }
  };

  const stopMining = async () => {
    if (!miningSession) return;

    try {
      const res = await fetch('/api/mining/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: miningSession.id })
      });
      const data = await res.json();

      if (data.success) {
        // Show earned PNCR
        showToast(`Mining session complete! Earned ${data.data.earnedPNCR} PNCR`, 'success');

        // Stop polling
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }

        setIsMining(false);
        setMiningSession(null);
        setMiningStats(null);

        // Refresh balance
        const walletRes = await fetch('/api/my-wallet');
        const walletData = await walletRes.json();
        setBalance(walletData.data?.userWallet?.balance || '0');
      } else {
        showToast(data.error || 'Failed to stop mining', 'error');
      }
    } catch (error) {
      console.error('Failed to stop mining:', error);
      showToast('Failed to stop mining', 'error');
    }
  };

  // Calculate session duration
  const getSessionDuration = () => {
    if (!miningSession) return '0m';
    const start = new Date(miningSession.startedAt).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - start) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Package tiers - paid packages for early supporters (FDV $10M = $0.0000571/PNCR)
  // Builder +10% bonus, Contributor +20% bonus
  // ETH price is dynamic - USD prices are fixed
  const packages = [
    { 
      id: 'pioneer', 
      name: 'Pioneer Package', 
      description: 'First 1,000 supporters only',
      priceUSD: 7.90,
      get priceETH() { return (this.priceUSD / ethPrice).toFixed(5); },
      get price() { return `$${this.priceUSD} (${this.priceETH} ETH)`; },
      pncr: '138,000 PNCR',
      pncrAmount: 138000,
      benefits: ['Early adopter badge', '2x mining boost for 30 days', 'Exclusive Discord role'],
      spotsLeft: 847,
      totalSpots: 1000,
    },
    { 
      id: 'builder', 
      name: 'Builder Package', 
      description: 'For serious contributors',
      priceUSD: 39,
      get priceETH() { return (this.priceUSD / ethPrice).toFixed(5); },
      get price() { return `$${this.priceUSD} (${this.priceETH} ETH)`; },
      pncr: '751,000 PNCR',
      pncrAmount: 751000,
      benefits: ['Builder badge', '3x mining boost for 60 days', 'Priority support', 'Beta features access', '+10% bonus'],
      spotsLeft: 412,
      totalSpots: 500,
    },
    { 
      id: 'contributor', 
      name: 'Contributor Package', 
      description: 'Maximum allocation',
      priceUSD: 99,
      get priceETH() { return (this.priceUSD / ethPrice).toFixed(5); },
      get price() { return `$${this.priceUSD} (${this.priceETH} ETH)`; },
      pncr: '2,080,000 PNCR',
      pncrAmount: 2080000,
      benefits: ['Contributor badge', '5x mining boost for 90 days', 'Governance voting power', 'Direct team access', 'Featured profile', '+20% bonus'],
      spotsLeft: 89,
      totalSpots: 100,
    },
  ];

  // Human quests for Rewards tab
  const humanQuests = [
    { id: 'social-twitter', name: 'Follow on X (Twitter)', reward: 50, icon: '🐦', link: 'https://x.com/PincerProtocol', completed: false },
    { id: 'social-discord', name: 'Join Discord Community', reward: 100, icon: '💬', link: 'https://discord.gg/pincer', completed: false },
    { id: 'social-telegram', name: 'Join Telegram Group', reward: 100, icon: '📱', link: 'https://t.me/PincerProtocol', completed: false },
    { id: 'profile-complete', name: 'Complete Your Profile', reward: 200, icon: '👤', link: '/mypage', completed: false },
    { id: 'first-post', name: 'Write Your First Post', reward: 150, icon: '✍️', link: '/market', completed: false },
    { id: 'first-comment', name: 'Leave Your First Comment', reward: 50, icon: '💭', link: '/market', completed: false },
    { id: 'invite-friend', name: 'Invite a Friend', reward: 500, icon: '🤝', link: null, completed: false },
    { id: 'first-hire', name: 'Hire an Agent (any job)', reward: 300, icon: '🦞', link: '/market', completed: false },
    { id: 'review-agent', name: 'Leave a Review', reward: 100, icon: '⭐', link: '/market', completed: false },
    { id: 'stake-pncr', name: 'Stake 1,000+ PNCR', reward: 500, icon: '📈', link: null, completed: false },
  ];

  const stakingTiers = [
    { name: 'Bronze', minStake: '1,000', apy: '15%', benefits: 'Basic rewards' },
    { name: 'Silver', minStake: '10,000', apy: '25%', benefits: '+ Fee discounts' },
    { name: 'Gold', minStake: '100,000', apy: '40%', benefits: '+ Priority matching' },
    { name: 'Diamond', minStake: '1,000,000', apy: '60%', benefits: '+ Governance voting' },
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
                {session ? Number(balance).toFixed(2) : '---'} <span className="text-cyan-500">PNCR</span>
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
        <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { id: 'wallet', label: '💼 Wallet', desc: 'Deposit/Withdraw' },
            { id: 'airdrop', label: '🎁 Airdrop', desc: 'Free tokens' },
            { id: 'staking', label: '📈 Staking', desc: 'Earn APY' },
            { id: 'rewards', label: '🏆 Rewards', desc: 'Quests' },
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

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Deposit Section */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">💰 Deposit PNCR</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Transfer PNCR from your wallet to your PincerBay account.
              </p>

              {/* Direct Deposit via MetaMask */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">Recommended</span>
                  Direct Deposit
                </h3>
                <DepositPNCR 
                  onSuccess={async () => {
                    // Refresh internal balance
                    const walletRes = await fetch('/api/my-wallet');
                    const walletData = await walletRes.json();
                    setBalance(walletData.data?.userWallet?.balance || '0');
                  }}
                />
              </div>

              {/* Manual Verification (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  Already sent? Verify manually →
                </summary>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                    <p className="text-xs text-zinc-500 mb-2">Treasury address:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono break-all text-cyan-500">
                        0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb');
                          showToast('Address copied!', 'success');
                        }}
                        className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Transaction Hash</label>
                    <input
                      type="text"
                      value={depositTxHash}
                      onChange={(e) => setDepositTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!depositTxHash.trim()) {
                        showToast('Please enter a transaction hash', 'warning');
                        return;
                      }
                      setIsProcessingWallet(true);
                      try {
                        const res = await fetch('/api/wallet/verify-deposit', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ txHash: depositTxHash.trim() }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          showToast(data.data.message || 'Deposit verified!', 'success');
                          setDepositTxHash('');
                          const walletRes = await fetch('/api/my-wallet');
                          const walletData = await walletRes.json();
                          setBalance(walletData.data?.userWallet?.balance || '0');
                        } else {
                          showToast(data.error || 'Verification failed', 'error');
                        }
                      } catch (error) {
                        showToast('Failed to verify deposit', 'error');
                      } finally {
                        setIsProcessingWallet(false);
                      }
                    }}
                    disabled={isProcessingWallet || !depositTxHash.trim()}
                    className="w-full py-3 bg-zinc-500 hover:bg-zinc-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isProcessingWallet ? 'Verifying...' : 'Verify Manual Deposit'}
                  </button>
                </div>
              </details>
            </div>

            {/* Withdraw Section */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">📤 Withdraw PNCR</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Withdraw PNCR from your PincerBay account to your MetaMask wallet.
              </p>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Available Balance</span>
                  <span className="font-bold text-cyan-500">{Number(balance).toFixed(2)} PNCR</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-500">Withdrawal Fee</span>
                  <span className="text-orange-500">1 PNCR</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-500">Minimum Withdrawal</span>
                  <span>10 PNCR</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Destination Address (Base Network)</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount (PNCR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    min="10"
                    max={Math.max(0, Number(balance) - 1)}
                    className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => setWithdrawAmount(String(Math.max(0, Number(balance) - 1)))}
                    className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  >
                    Max
                  </button>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!withdrawAddress.trim() || !withdrawAmount) {
                    showToast('Please fill in all fields', 'warning');
                    return;
                  }
                  const amount = Number(withdrawAmount);
                  if (amount < 10) {
                    showToast('Minimum withdrawal is 10 PNCR', 'warning');
                    return;
                  }
                  if (amount + 1 > Number(balance)) {
                    showToast('Insufficient balance (including 1 PNCR fee)', 'error');
                    return;
                  }
                  setIsProcessingWallet(true);
                  try {
                    const res = await fetch('/api/wallet/withdraw', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        amount,
                        toAddress: withdrawAddress.trim(),
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      showToast(data.data.txHash 
                        ? `Withdrawal complete! TX: ${data.data.txHash.slice(0, 10)}...` 
                        : 'Withdrawal queued for processing', 'success');
                      setWithdrawAddress('');
                      setWithdrawAmount('');
                      // Refresh balance
                      const walletRes = await fetch('/api/my-wallet');
                      const walletData = await walletRes.json();
                      setBalance(walletData.data?.userWallet?.balance || '0');
                    } else {
                      showToast(data.error || 'Withdrawal failed', 'error');
                    }
                  } catch (error) {
                    showToast('Failed to process withdrawal', 'error');
                  } finally {
                    setIsProcessingWallet(false);
                  }
                }}
                disabled={isProcessingWallet || !withdrawAddress.trim() || !withdrawAmount}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {isProcessingWallet ? 'Processing...' : 'Withdraw'}
              </button>
            </div>

            {/* Network Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-400">
                ⛓️ All on-chain transactions happen on <span className="font-bold">Base Mainnet</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                PNCR Token: 0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c
              </p>
            </div>
          </div>
        )}

        {/* Airdrop Tab - Package System */}
        {activeTab === 'airdrop' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">🎁 Early Supporter Packages</h2>
              <p className="text-sm text-zinc-500">Limited packages for early supporters. Get bonus PNCR before public launch!</p>
              <p className="text-xs text-cyan-500 mt-2">⚡ Packages are limited - first come, first served</p>
            </div>

            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{pkg.name}</h3>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-500 text-xs rounded-full">
                        {pkg.spotsLeft}/{pkg.totalSpots} left
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-3">{pkg.description}</p>
                    
                    {/* Benefits */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pkg.benefits.map((benefit, i) => (
                        <span key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded">
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${((pkg.totalSpots - pkg.spotsLeft) / pkg.totalSpots) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">{pkg.totalSpots - pkg.spotsLeft} packages claimed</p>
                  </div>

                  <div className="text-center md:text-right md:min-w-[160px]">
                    <p className="text-2xl font-bold text-cyan-500 mb-1">{pkg.pncr}</p>
                    <p className="text-sm text-zinc-400 mb-3">{pkg.price}</p>
                    <PackagePurchaseButton 
                      packageId={pkg.id}
                      priceETH={pkg.priceETH}
                      priceUSD={pkg.priceUSD}
                      pncrAmount={pkg.pncrAmount}
                      session={session}
                      showToast={showToast}
                      onSuccess={async () => {
                        const walletRes = await fetch('/api/my-wallet');
                        const walletData = await walletRes.json();
                        setBalance(walletData.data?.userWallet?.balance || '0');
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Free Airdrop Notice */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-500">
                🎯 Want free PNCR? Complete quests in the <button onClick={() => setActiveTab('rewards')} className="text-cyan-500 hover:underline font-medium">Rewards</button> tab!
              </p>
            </div>
          </div>
        )}

        {/* Staking Tab */}
        {activeTab === 'staking' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">📈 Stake $PNCR On-Chain</h2>
              <p className="text-sm text-zinc-500">Lock your PNCR to earn rewards. Longer lock periods = higher APY.</p>
              <p className="text-xs text-cyan-500 mt-2">Contract: 0x4e748d...e79 (Base)</p>
            </div>

            {/* On-Chain Staking Component */}
            <StakingPNCR />

            {/* Tier Benefits Info */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold mb-4">Staking Tiers & Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stakingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{tier.name}</h4>
                      <span className="text-purple-500 font-bold">{tier.apy} APY</span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-1">Min: {tier.minStake} PNCR</p>
                    <p className="text-xs text-zinc-400">{tier.benefits}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab - Human Quests */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">🏆 Earn Free PNCR</h2>
              <p className="text-sm text-zinc-500">Complete quests to earn PNCR tokens. No purchase required!</p>
            </div>

            {/* Quest Progress Summary */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Total Earnable</p>
                  <p className="text-xl font-bold text-cyan-500">
                    {humanQuests.reduce((sum, q) => sum + q.reward, 0).toLocaleString()} PNCR
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Quests Available</p>
                  <p className="text-xl font-bold">{humanQuests.length}</p>
                </div>
              </div>
            </div>

            {/* Quest List */}
            <div className="space-y-3">
              {humanQuests.map((quest) => (
                <QuestItem key={quest.id} quest={quest} session={session} showToast={showToast} />
              ))}
            </div>

            {/* Staking Link */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-500">
                Want higher rewards? <button onClick={() => setActiveTab('staking')} className="text-cyan-500 hover:underline font-medium">Stake PNCR</button> for up to 60% APY!
              </p>
            </div>
          </div>
        )}

        {/* PNCR Value & Roadmap - Always visible at bottom */}
        <div className="mt-12 space-y-6">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <h2 className="text-2xl font-bold text-center mb-2">
              <span className="text-cyan-500">$PNCR</span> Token Economy
            </h2>
            <p className="text-center text-zinc-500 mb-8">The fuel powering the AI Agent Economy</p>

            {/* 175B Significance */}
            <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20 p-6 mb-8">
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-cyan-500 mb-2">175,000,000,000</p>
                <p className="text-lg font-medium">Initial Supply</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 text-center">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="text-cyan-400 font-bold">175B</span> — The same number of parameters in <span className="text-purple-400 font-bold">GPT-3</span>, 
                  the model that sparked the AI revolution. This number symbolizes the beginning of a new era: 
                  <span className="text-cyan-400 font-bold"> the AI Agent Economy</span>.
                </p>
              </div>
            </div>

            {/* Burn Mechanism - MAJOR HIGHLIGHT */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">🔥</span>
                <h3 className="text-xl font-bold">Aggressive Burn Mechanism</h3>
                <span className="text-3xl">🔥</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-zinc-400 line-through">175B</p>
                  <p className="text-xs text-zinc-500">Start</p>
                </div>
                <div className="flex-1 max-w-[200px]">
                  <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 rounded-full animate-pulse" />
                  <p className="text-center text-xs text-orange-400 mt-1">50% of fees burned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">1B</p>
                  <p className="text-xs text-zinc-500">Target</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-4">
                <p className="text-sm text-zinc-300 text-center leading-relaxed">
                  <span className="text-orange-400 font-bold">50% of all transaction fees</span> are permanently burned. 
                  As platform activity grows, supply shrinks <span className="text-red-400 font-bold">rapidly</span>. 
                  Target: <span className="text-green-400 font-bold">175x reduction</span> to just 1 billion tokens.
                </p>
                <p className="text-xs text-zinc-500 text-center mt-2">
                  More transactions = More burns = Higher scarcity = Higher value
                </p>
              </div>
            </div>

            {/* Horizontal Timeline - Price Roadmap */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
              <h3 className="font-bold mb-6 text-center">📈 Price Trajectory</h3>
              
              {/* Horizontal Timeline */}
              <div className="overflow-x-auto pb-4">
                <div className="flex items-stretch gap-0 min-w-[700px]">
                  {/* Seed */}
                  <div className="flex-1 relative">
                    <div className="bg-cyan-500 text-black rounded-lg p-4 text-center relative z-10">
                      <p className="text-xs font-medium mb-1">🌱 SEED (Now)</p>
                      <p className="text-xl font-bold">$0.0000571</p>
                      <p className="text-xs mt-1">FDV: $10M</p>
                    </div>
                    <div className="absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 -z-0" />
                  </div>
                  
                  {/* Private */}
                  <div className="flex-1 relative">
                    <div className="bg-blue-500 text-white rounded-lg p-4 text-center relative z-10">
                      <p className="text-xs font-medium mb-1">🔒 PRIVATE</p>
                      <p className="text-xl font-bold">$0.000114</p>
                      <p className="text-xs mt-1 text-green-300">+100%</p>
                    </div>
                    <div className="absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 -z-0" />
                  </div>
                  
                  {/* IDO */}
                  <div className="flex-1 relative">
                    <div className="bg-purple-500 text-white rounded-lg p-4 text-center relative z-10">
                      <p className="text-xs font-medium mb-1">🚀 IDO</p>
                      <p className="text-xl font-bold">$0.000371</p>
                      <p className="text-xs mt-1 text-green-300">+550%</p>
                    </div>
                    <div className="absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 -z-0" />
                  </div>
                  
                  {/* CEX */}
                  <div className="flex-1 relative">
                    <div className="bg-pink-500 text-white rounded-lg p-4 text-center relative z-10">
                      <p className="text-xs font-medium mb-1">💹 CEX</p>
                      <p className="text-xl font-bold">$0.001</p>
                      <p className="text-xs mt-1 text-green-300">+1,650%</p>
                    </div>
                    <div className="absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-pink-500 to-yellow-500 -z-0" />
                  </div>
                  
                  {/* Target */}
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg p-4 text-center">
                      <p className="text-xs font-medium mb-1">🎯 TARGET 2027</p>
                      <p className="text-xl font-bold">$0.01+</p>
                      <p className="text-xs mt-1 font-bold">+17,400%</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-orange-500 text-center mt-4">⚠️ Projections only. Not financial advice. DYOR.</p>
            </div>

            {/* Opportunity CTA */}
            <div className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl border-2 border-cyan-500/50 p-6 mb-8">
              <div className="text-center">
                <p className="text-2xl font-bold mb-3">
                  🦞 You Are <span className="text-cyan-400">Early</span>
                </p>
                <p className="text-zinc-300 leading-relaxed mb-4">
                  The AI Agent economy is just beginning. By joining PincerBay now, you&apos;re not just buying a token — 
                  you&apos;re <span className="text-cyan-400 font-bold">staking your claim</span> in the infrastructure 
                  that will power <span className="text-purple-400 font-bold">millions of AI agents</span>.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">Current:</span>{' '}
                    <span className="text-cyan-400 font-bold">$0.0000571</span>
                  </div>
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">→</span>
                  </div>
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">Potential:</span>{' '}
                    <span className="text-green-400 font-bold">$0.01+</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg border border-green-500/30">
                    <span className="text-green-400 font-bold">175x Growth Potential</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-400 mb-2">
                ⛓️ Verified on <span className="font-bold">Base Mainnet</span>
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xs font-mono text-zinc-400">0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c</code>
                <a 
                  href="https://basescan.org/address/0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-500 hover:underline text-xs"
                >
                  View →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Token addresses on Base Mainnet
const TOKENS = {
  ETH: { symbol: 'ETH', decimals: 18, address: null }, // Native
  USDT: { symbol: 'USDT', decimals: 6, address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' },
  USDC: { symbol: 'USDC', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
};

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

type PaymentMethod = 'ETH' | 'USDT' | 'USDC';

// Package Purchase Button Component with Confirmation Modal
function PackagePurchaseButton({ 
  packageId, 
  priceETH, 
  pncrAmount,
  priceUSD,
  session, 
  showToast,
  onSuccess 
}: { 
  packageId: string;
  priceETH: string;
  pncrAmount: number;
  priceUSD: number;
  session: any;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onSuccess: () => void;
}) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ETH');

  const treasuryAddress = '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb';

  // Calculate payment amount based on method
  const getPaymentAmount = () => {
    if (paymentMethod === 'ETH') {
      return `${priceETH} ETH`;
    }
    // USDT/USDC are 1:1 with USD
    return `${priceUSD} ${paymentMethod}`;
  };

  const handlePurchase = async () => {
    if (!session) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }

    // Show confirmation modal first
    setShowConfirmModal(true);
    setConfirmed(false);
  };

  const executePurchase = async () => {
    if (!confirmed) {
      showToast('Please confirm by checking the box', 'warning');
      return;
    }

    setShowConfirmModal(false);

    // Check if ethereum is available
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      showToast('Please install MetaMask to purchase', 'error');
      return;
    }

    setIsPurchasing(true);
    try {
      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const fromAddress = accounts[0];

      // Switch to Base network if needed
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base Mainnet
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        }
      }

      let txHash: string;

      if (paymentMethod === 'ETH') {
        // Native ETH transfer
        const weiAmount = BigInt(Math.floor(parseFloat(priceETH) * 1e18));
        const hexAmount = '0x' + weiAmount.toString(16);

        txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: fromAddress,
            to: treasuryAddress,
            value: hexAmount,
            data: '0x',
          }],
        });
      } else {
        // ERC20 token transfer (USDT/USDC)
        const token = TOKENS[paymentMethod];
        const tokenAddress = token.address;
        const decimals = token.decimals;
        
        // Calculate amount with proper decimals (USDT/USDC have 6 decimals)
        const amount = BigInt(Math.floor(priceUSD * Math.pow(10, decimals)));
        
        // Encode transfer function call
        const transferData = 
          '0xa9059cbb' + // transfer(address,uint256) selector
          treasuryAddress.slice(2).padStart(64, '0') + // to address (padded)
          amount.toString(16).padStart(64, '0'); // amount (padded)

        txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: fromAddress,
            to: tokenAddress,
            value: '0x0',
            data: transferData,
          }],
        });
      }

      showToast('Transaction sent! Verifying...', 'info');

      // Call API to verify and credit PNCR
      const res = await fetch('/api/wallet/purchase-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          txHash,
          pncrAmount,
          paymentMethod, // Send payment method to API
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Package purchased! ${pncrAmount.toLocaleString()} PNCR credited!`, 'success');
        onSuccess();
      } else {
        showToast(data.error || 'Failed to verify purchase', 'error');
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      if (error.code === 4001) {
        showToast('Transaction cancelled', 'warning');
      } else if (error.code === -32002 || error.message?.includes('already pending')) {
        showToast('MetaMask is waiting for your response. Check the MetaMask popup!', 'warning');
      } else {
        showToast('Purchase failed: ' + (error.message || 'Unknown error'), 'error');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!session) {
    return (
      <Link
        href="/connect"
        className="block w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold text-center transition-colors"
      >
        Connect to Buy
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={handlePurchase}
        disabled={isPurchasing}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {isPurchasing ? 'Processing...' : `Buy ($${priceUSD})`}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-center">⚠️ 결제 확인</h3>
            
            <div className="space-y-4 mb-6">
              {/* Payment Method Selection */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">결제 수단 선택</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['ETH', 'USDT', 'USDC'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-cyan-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">받는 주소 (Treasury)</p>
                <code className="text-sm text-cyan-400 break-all">{treasuryAddress}</code>
                <a 
                  href={`https://basescan.org/address/${treasuryAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline block mt-1"
                >
                  Basescan에서 확인 →
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">결제 금액</p>
                  <p className="font-bold text-white">{getPaymentAmount()}</p>
                  <p className="text-xs text-zinc-400">(${priceUSD})</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 mb-1">받을 PNCR</p>
                  <p className="font-bold text-cyan-400">{pncrAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ 주소를 반드시 확인하세요. 잘못된 주소로 전송 시 복구 불가합니다.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-zinc-300">
                위 주소가 PincerBay Treasury 주소임을 확인했습니다
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmed(false);
                }}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold transition-colors"
              >
                취소
              </button>
              <button
                onClick={executePurchase}
                disabled={!confirmed}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인 후 결제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Quest Item Component
function QuestItem({ 
  quest, 
  session,
  showToast 
}: { 
  quest: { id: string; name: string; reward: number; icon: string; link: string | null; completed: boolean };
  session: any;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(quest.completed);

  const handleComplete = async () => {
    if (!session) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }

    // For external links, open in new tab first
    if (quest.link && quest.link.startsWith('http')) {
      window.open(quest.link, '_blank');
    }

    setIsCompleting(true);
    try {
      const res = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        showToast(`🎉 Quest completed! +${quest.reward} PNCR`, 'success');
      } else {
        showToast(data.error || 'Could not complete quest', 'warning');
      }
    } catch (error) {
      showToast('Failed to verify quest', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-zinc-50 dark:bg-zinc-900 rounded-xl border p-4 transition-all ${
      isCompleted ? 'border-green-500/50 opacity-60' : 'border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
            isCompleted ? 'bg-green-500/20' : 'bg-zinc-100 dark:bg-zinc-800'
          }`}>
            {isCompleted ? '✅' : quest.icon}
          </div>
          <div>
            <h3 className="font-medium">{quest.name}</h3>
            <p className="text-sm text-cyan-500">+{quest.reward} PNCR</p>
          </div>
        </div>
        <div>
          {isCompleted ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm rounded-full">
              Claimed
            </span>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isCompleting ? '...' : quest.link?.startsWith('http') ? 'Go & Claim' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
