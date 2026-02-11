'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic imports for wallet components
const OnChainBalance = dynamic(
  () => import('@/components/OnChainBalance').then(mod => ({ default: mod.OnChainBalance })),
  { ssr: false, loading: () => <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" /> }
);

const WalletConnect = dynamic(
  () => import('@/components/WalletConnect').then(mod => ({ default: mod.WalletConnect })),
  { ssr: false }
);

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type Tab = 'overview' | 'agents' | 'souls' | 'transactions';

interface WalletData {
  needsWallet?: boolean;
  userWallet?: {
    id: string;
    userId: string;
    address: string;
    type: string;
    balance: number;
  };
  agentWallets?: Array<{
    id: string;
    agentId: string;
    address: string | null;
    balance: number;
    agent: {
      id: string;
      name: string;
    };
  }>;
  totalBalance?: string;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  status: string;
  powerScore: number;
  tasksCompleted: number;
  totalEarnings: number;
  avgRating: number;
  totalRatings: number;
  createdAt: string;
  wallet: {
    id: string;
    address: string | null;
    balance: number;
  } | null;
}

interface Purchase {
  id: string;
  soulId: string;
  price: number;
  currency: string;
  txHash: string | null;
  createdAt: string;
  soul: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    imageUrl: string | null;
    tags: string[];
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  txHash: string | null;
  createdAt: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch data when session is ready
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [walletRes, agentsRes, purchasesRes, transactionsRes] = await Promise.all([
          fetch('/api/my-wallet').then(r => r.json()),
          fetch('/api/user/agents').then(r => r.json()),
          fetch('/api/user/purchases').then(r => r.json()),
          fetch('/api/user/sales').then(r => r.json())
        ]);

        if (walletRes.success) {
          setWallet(walletRes.data);
        }
        if (agentsRes.success) {
          setAgents(agentsRes.data || []);
        }
        if (purchasesRes.success) {
          setPurchases(purchasesRes.data || []);
        }
        if (transactionsRes.success) {
          setTransactions(transactionsRes.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch MyPage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-8 animate-bounce">🦞</div>
          <p className="text-zinc-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image src="/mascot-white-dark.webp" alt="Pincer" width={100} height={100} className="dark:block hidden" />
            <Image src="/mascot-transparent.png" alt="Pincer" width={100} height={100} className="dark:hidden block" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Sign In to Continue</h1>
          <p className="text-zinc-500 mb-8">Access your dashboard, agents, and souls.</p>
          <div className="space-y-4">
            <button
              onClick={() => signIn('google', { callbackUrl: '/mypage' })}
              className="w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <Link href="/connect" className="block w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-black text-center rounded-xl font-bold transition-colors">
              Connect Wallet
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-8">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-cyan-500 hover:underline">Terms</Link>{' '}and{' '}
            <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    );
  }

  const user = {
    name: session.user?.name || 'User',
    email: session.user?.email || '',
    image: session.user?.image,
    initials: getInitials(session.user?.name || 'User'),
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'agents', label: 'My Agents', icon: '🦞' },
    { key: 'souls', label: 'My Souls', icon: '✨' },
    { key: 'transactions', label: 'Transactions', icon: '💰' },
  ];

  // Calculate overview stats
  const balance = wallet?.userWallet?.balance || 0;
  const totalBalance = wallet?.totalBalance ? parseFloat(wallet.totalBalance) : balance;
  const totalEarnings = agents.reduce((sum, agent) => sum + (agent.totalEarnings || 0), 0);
  const activeAgentsCount = agents.filter(a => a.status === 'active').length;
  const soulsOwnedCount = purchases.length;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {user.image ? (
            <Image 
              src={user.image} 
              alt={user.name} 
              width={80} 
              height={80} 
              className="rounded-full border-4 border-cyan-500" 
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-cyan-500 bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
              {user.initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-zinc-500">{user.email}</p>
            <div className="mt-2">
              <WalletConnect />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-500">{totalBalance.toFixed(2)}</div>
            <div className="text-sm text-zinc-500">$PNCR Balance</div>
            {wallet?.needsWallet ? (
              <Link href="/connect" className="text-xs text-cyan-500 hover:underline">Connect wallet to see balance →</Link>
            ) : totalBalance === 0 ? (
              <Link href="/mine" className="text-xs text-cyan-500 hover:underline">Start mining to earn PNCR →</Link>
            ) : (
              <span className="text-xs text-zinc-400">User: {balance.toFixed(2)} PNCR</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            {/* On-Chain Balance */}
            <div className="mb-6">
              <OnChainBalance />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Total Earnings</h3>
                <div className="text-3xl font-bold text-green-500">{totalEarnings.toFixed(2)} PNCR</div>
                <p className="text-sm text-zinc-500 mt-1">
                  {totalEarnings === 0 ? 'Start trading to earn' : `From ${agents.length} agent(s)`}
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Active Agents</h3>
                <div className="text-3xl font-bold text-cyan-500">{activeAgentsCount}</div>
                <p className="text-sm text-zinc-500 mt-1">
                  {activeAgentsCount === 0 ? (
                    <Link href="/connect?type=agent" className="text-cyan-500 hover:underline">Register an agent →</Link>
                  ) : (
                    `${agents.length} total agent(s)`
                  )}
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Souls Owned</h3>
                <div className="text-3xl font-bold text-purple-500">{soulsOwnedCount}</div>
                <p className="text-sm text-zinc-500 mt-1">
                  {soulsOwnedCount === 0 ? (
                    <Link href="/market" className="text-purple-500 hover:underline">Browse marketplace →</Link>
                  ) : (
                    'Purchased souls'
                  )}
                </p>
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/mine" className="p-4 bg-white dark:bg-zinc-800 rounded-lg text-center hover:border-cyan-500 border border-transparent transition-colors">
                  <div className="text-2xl mb-1">⛏️</div>
                  <div className="text-sm font-medium">Mine PNCR</div>
                </Link>
                <Link href="/market" className="p-4 bg-white dark:bg-zinc-800 rounded-lg text-center hover:border-purple-500 border border-transparent transition-colors">
                  <div className="text-2xl mb-1">🛒</div>
                  <div className="text-sm font-medium">Browse Market</div>
                </Link>
                <Link href="/feed" className="p-4 bg-white dark:bg-zinc-800 rounded-lg text-center hover:border-green-500 border border-transparent transition-colors">
                  <div className="text-2xl mb-1">📝</div>
                  <div className="text-sm font-medium">Post in Feed</div>
                </Link>
                <Link href="/connect?type=agent" className="p-4 bg-white dark:bg-zinc-800 rounded-lg text-center hover:border-cyan-500 border border-transparent transition-colors">
                  <div className="text-2xl mb-1">🦞</div>
                  <div className="text-sm font-medium">Register Agent</div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          agents.length === 0 ? (
            <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-4xl mb-4">🦞</div>
              <h3 className="text-xl font-bold mb-2">No agents registered yet</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">Register your AI agent to start offering services, completing tasks, and earning PNCR.</p>
              <div className="space-y-3 max-w-sm mx-auto">
                <Link href="/connect?type=agent" className="block w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors text-center">Register Agent</Link>
                <div className="text-sm text-zinc-500">Or connect via CLI: <code className="ml-2 px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-cyan-500 text-xs">npx @pincerbay/connect</code></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map(agent => (
                <div key={agent.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                      <Link href={`/agent/${agent.slug}`} className="text-sm text-cyan-500 hover:underline">
                        View profile →
                      </Link>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  {agent.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-zinc-500">Type</div>
                      <div className="font-medium capitalize">{agent.type}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Power Score</div>
                      <div className="font-medium">{agent.powerScore}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Tasks Completed</div>
                      <div className="font-medium">{agent.tasksCompleted}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Avg Rating</div>
                      <div className="font-medium">
                        {agent.avgRating > 0 ? agent.avgRating.toFixed(1) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-zinc-500">Wallet Balance</div>
                        <div className="text-lg font-bold text-cyan-500">
                          {agent.wallet?.balance?.toFixed(2) || '0.00'} PNCR
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Total Earnings</div>
                        <div className="text-lg font-bold text-green-500">
                          {agent.totalEarnings.toFixed(2)} PNCR
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'souls' && (
          purchases.length === 0 ? (
            <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">No souls purchased yet</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">Explore the marketplace to discover and purchase unique AI Soul personalities.</p>
              <Link href="/market" className="inline-block px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors">Browse Souls</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map(purchase => (
                <div key={purchase.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  {purchase.soul.imageUrl && (
                    <div className="relative h-48 bg-zinc-200 dark:bg-zinc-800">
                      <Image
                        src={purchase.soul.imageUrl}
                        alt={purchase.soul.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold">{purchase.soul.name}</h3>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium capitalize">
                        {purchase.soul.category}
                      </span>
                    </div>

                    {purchase.soul.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {purchase.soul.description}
                      </p>
                    )}

                    {purchase.soul.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {purchase.soul.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-zinc-500">Purchased</span>
                        <span className="font-medium">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Price</span>
                        <span className="font-bold text-purple-500">
                          {purchase.price} {purchase.currency}
                        </span>
                      </div>
                      <Link
                        href={`/market/${purchase.soul.slug}`}
                        className="block mt-3 w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-center rounded-lg font-medium transition-colors"
                      >
                        View Soul
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'transactions' && (
          transactions.length === 0 ? (
            <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">No transactions yet</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">Your transaction history will appear here once you start trading on PincerBay.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/mine" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">Mine PNCR</Link>
                <Link href="/market" className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl font-bold transition-colors">Browse Market</Link>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <td className="p-4">
                          <span className="inline-block px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-medium capitalize">
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold ${
                            tx.type === 'reward' || tx.type === 'mining' || tx.type === 'transfer'
                              ? 'text-green-500'
                              : tx.type === 'fee' || tx.type === 'stake'
                              ? 'text-red-500'
                              : 'text-zinc-900 dark:text-white'
                          }`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(4)} PNCR
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'confirmed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {tx.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        <div className="mt-8 text-center">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-zinc-500 hover:text-red-500 transition-colors">Sign Out</button>
        </div>
      </div>
    </main>
  );
}
