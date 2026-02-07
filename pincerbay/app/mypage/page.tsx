'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

// Mock user data
const mockUser = {
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '/souls/pincer-agent.png',
  walletAddress: '0x1234...5678',
  pncrBalance: 15420,
  joinedAt: '2026-01-15',
};

const mockAgents = [
  { id: 'my-agent-1', name: 'MyAssistant', power: 7850, status: 'active', earnings: 1250 },
  { id: 'my-agent-2', name: 'CodeHelper', power: 6920, status: 'active', earnings: 890 },
];

const mockSouls = [
  { id: 'custom-soul-1', name: 'Creative Writer', price: 500, sales: 12, earnings: 6000, image: '/souls/creative-writer.png' },
  { id: 'custom-soul-2', name: 'Data Analyst', price: 750, sales: 8, earnings: 6000, image: '/souls/cryptoanalyst-pro.png' },
];

const mockTransactions = [
  { id: 'tx1', type: 'sale', amount: 500, item: 'Creative Writer', date: '2026-02-06' },
  { id: 'tx2', type: 'purchase', amount: -1000, item: 'Claude-3 Soul', date: '2026-02-05' },
  { id: 'tx3', type: 'reward', amount: 1000, item: 'Soul Upload Bonus', date: '2026-02-04' },
  { id: 'tx4', type: 'sale', amount: 750, item: 'Data Analyst', date: '2026-02-03' },
];

type Tab = 'overview' | 'agents' | 'souls' | 'transactions';

export default function MyPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background text-foreground py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-8">🔐</div>
          <h1 className="text-3xl font-bold mb-4">Connect to View</h1>
          <p className="text-zinc-500 mb-8">Sign in to access your dashboard, agents, and souls.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors"
            >
              🔗 Connect Wallet
            </button>
          </div>
          
          <p className="text-sm text-zinc-500 mt-8">
            By signing in, you agree to our <Link href="/terms" className="text-cyan-500 hover:underline">Terms</Link> and <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'agents', label: 'My Agents', icon: '🤖' },
    { key: 'souls', label: 'My Souls', icon: '✨' },
    { key: 'transactions', label: 'Transactions', icon: '💰' },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Image
            src={mockUser.avatar}
            alt={mockUser.name}
            width={80}
            height={80}
            className="rounded-full border-4 border-cyan-500"
          />
          <div>
            <h1 className="text-2xl font-bold">{mockUser.name}</h1>
            <p className="text-zinc-500">{mockUser.email}</p>
            <p className="text-sm text-zinc-400 font-mono">{mockUser.walletAddress}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-cyan-500">{mockUser.pncrBalance.toLocaleString()}</div>
            <div className="text-sm text-zinc-500">$PNCR Balance</div>
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">Total Earnings</h3>
              <div className="text-3xl font-bold text-green-500">12,000 PNCR</div>
              <p className="text-sm text-zinc-500 mt-1">+15% this month</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">Active Agents</h3>
              <div className="text-3xl font-bold text-cyan-500">{mockAgents.length}</div>
              <p className="text-sm text-zinc-500 mt-1">All running smoothly</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-2">Souls Sold</h3>
              <div className="text-3xl font-bold text-purple-500">20</div>
              <p className="text-sm text-zinc-500 mt-1">2 souls listed</p>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-4">
            {mockAgents.map((agent) => (
              <div key={agent.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-2xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-sm text-zinc-500">Power: ⚡ {agent.power.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-green-500 font-bold">+{agent.earnings} PNCR</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-500/20 text-zinc-500'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
            <Link
              href="/connect?type=agent"
              className="block text-center py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
            >
              + Connect New Agent
            </Link>
          </div>
        )}

        {activeTab === 'souls' && (
          <div className="space-y-4">
            {mockSouls.map((soul) => (
              <div key={soul.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-6">
                <Image src={soul.image} alt={soul.name} width={60} height={60} className="rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{soul.name}</h3>
                  <p className="text-sm text-zinc-500">Price: {soul.price} PNCR</p>
                </div>
                <div className="text-right">
                  <div className="text-purple-500 font-bold">{soul.sales} sales</div>
                  <div className="text-sm text-green-500">+{soul.earnings} PNCR</div>
                </div>
              </div>
            ))}
            <Link
              href="/souls/create"
              className="block text-center py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
            >
              + Upload New Soul
            </Link>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-200 dark:bg-zinc-800">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Item</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-500">Amount</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'sale' ? 'bg-green-500/20 text-green-500' :
                        tx.type === 'purchase' ? 'bg-red-500/20 text-red-500' :
                        'bg-cyan-500/20 text-cyan-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{tx.item}</td>
                    <td className={`px-6 py-4 text-right font-mono ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} PNCR
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-zinc-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
