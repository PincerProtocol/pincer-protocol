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

type Tab = 'airdrop' | 'staking' | 'mine' | 'purchase' | 'rewards' | 'wallet';

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
        <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {[
            { id: 'wallet', label: '💼 Wallet', desc: 'Deposit/Withdraw' },
            { id: 'airdrop', label: '🎁 Airdrop', desc: 'Free tokens' },
            { id: 'staking', label: '📈 Staking', desc: 'Earn APY' },
            { id: 'mine', label: '⛏️ Mine', desc: 'Activity mining' },
            { id: 'rewards', label: '🏆 Rewards', desc: 'Activity history' },
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

        {/* Mine Tab */}
        {activeTab === 'mine' && (
          <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">Activity-Based Mining</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Earn $PNCR through platform activity. Mining rewards are based on your engagement and contributions (Proof of Contribution).
              </p>

              {/* Mining Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Duration</p>
                  <p className="text-xl font-bold text-cyan-500">{getSessionDuration()}</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Session Earned</p>
                  <p className="text-xl font-bold">{miningStats?.estimatedEarnings?.toFixed(4) || '0.0000'} PNCR</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Mining Boost</p>
                  <p className="text-xl font-bold text-purple-500">{miningStats?.miningBoost?.toFixed(2) || '1.00'}x</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Status</p>
                  <p className={`text-xl font-bold ${isMining ? 'text-green-500' : 'text-zinc-400'}`}>
                    {isMining ? 'Active' : 'Idle'}
                  </p>
                </div>
              </div>

              {/* Daily Progress */}
              {miningStats?.todayStats && (
                <div className="mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>Daily Progress</span>
                    <span>{miningStats.todayStats.earned.toFixed(2)} / {miningStats.todayStats.cap.toFixed(2)} PNCR</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (miningStats.todayStats.earned / miningStats.todayStats.cap) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Activity Info */}
              {isMining && (
                <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-sm text-zinc-300 mb-2">
                    {miningStats?.activityBonus ? (
                      <>
                        <span className="text-green-500 font-bold">✓ Active Bonus (1.5x):</span> You have recent activity!
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-500 font-bold">⏸ No Activity Bonus:</span> Stay engaged to maximize rewards!
                      </>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Post, comment, or complete jobs in the last hour to activate the 1.5x activity bonus.
                  </p>
                </div>
              )}

              {/* Control Button */}
              {session ? (
                <button
                  onClick={isMining ? stopMining : startMining}
                  disabled={!session}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                    isMining
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-black'
                  }`}
                >
                  {isMining ? '⏹️ Stop Mining' : '▶️ Start Mining'}
                </button>
              ) : (
                <Link
                  href="/connect"
                  className="block w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold text-lg text-center transition-colors"
                >
                  Connect to Start Mining
                </Link>
              )}

              <p className="text-xs text-zinc-400 mt-4 text-center">
                Mining is activity-based (Proof of Contribution). Complete jobs and engage with the platform to earn more.
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

        {/* Purchase Tab */}
        {activeTab === 'purchase' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">💳 Purchase $PNCR</h2>
              <p className="text-sm text-zinc-500">Buy PNCR with ETH or USDT on Base network.</p>
            </div>

            {/* On-Chain Purchase Component */}
            <PurchasePNCR showToast={showToast} />
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 p-6">
              <h2 className="text-xl font-bold mb-2">🏆 Activity Rewards</h2>
              <p className="text-sm text-zinc-500">View your mining history and activity-based earnings.</p>
            </div>

            <ActivityRewardsHistory session={session} />
          </div>
        )}
      </div>
    </main>
  );
}

// Activity Rewards History Component
function ActivityRewardsHistory({ session }: { session: any }) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const loadRewards = async () => {
      try {
        const res = await fetch('/api/mining/rewards');
        const data = await res.json();
        setRewards(data.data?.rewards || []);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, [session]);

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 mb-4">Connect your wallet to view reward history</p>
        <Link
          href="/connect"
          className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold"
        >
          Connect Wallet
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Loading rewards...</p>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <p className="text-zinc-500 mb-2">No rewards yet</p>
        <p className="text-xs text-zinc-400">Start mining to earn your first rewards!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rewards.map((reward: any, index: number) => (
        <div
          key={index}
          className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-lg">
                {reward.type === 'mining' ? '⛏️' : reward.type === 'job' ? '💼' : reward.type === 'referral' ? '🤝' : '🎁'}
              </div>
              <div>
                <h3 className="font-bold text-sm">{reward.description || reward.type}</h3>
                <p className="text-xs text-zinc-500">
                  {new Date(reward.createdAt).toLocaleDateString()} at {new Date(reward.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-cyan-500">+{Number(reward.amount).toFixed(4)} PNCR</p>
              {reward.boost && reward.boost > 1 && (
                <p className="text-xs text-purple-500">{reward.boost}x boost</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
