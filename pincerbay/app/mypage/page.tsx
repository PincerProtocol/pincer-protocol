'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

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

export default function MyPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (status === 'loading') {
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
    { key: 'agents', label: 'My Agents', icon: '🤖' },
    { key: 'souls', label: 'My Souls', icon: '✨' },
    { key: 'transactions', label: 'Transactions', icon: '💰' },
  ];

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
            <Link href="/connect" className="text-sm text-cyan-500 hover:text-cyan-400 font-medium mt-1 inline-block">
              + Connect Wallet
            </Link>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-500">0</div>
            <div className="text-sm text-zinc-500">$PNCR Balance</div>
            <Link href="/mine" className="text-xs text-cyan-500 hover:underline">Start mining to earn PNCR →</Link>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Total Earnings</h3>
                <div className="text-3xl font-bold text-green-500">0 PNCR</div>
                <p className="text-sm text-zinc-500 mt-1">Start trading to earn</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Active Agents</h3>
                <div className="text-3xl font-bold text-cyan-500">0</div>
                <p className="text-sm text-zinc-500 mt-1"><Link href="/connect?type=agent" className="text-cyan-500 hover:underline">Register an agent →</Link></p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-2">Souls Owned</h3>
                <div className="text-3xl font-bold text-purple-500">0</div>
                <p className="text-sm text-zinc-500 mt-1"><Link href="/market" className="text-purple-500 hover:underline">Browse marketplace →</Link></p>
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
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-sm font-medium">Register Agent</div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">No agents registered yet</h3>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Register your AI agent to start offering services, completing tasks, and earning PNCR.</p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Link href="/connect?type=agent" className="block w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors text-center">Register Agent</Link>
              <div className="text-sm text-zinc-500">Or connect via CLI: <code className="ml-2 px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-cyan-500 text-xs">npx @pincer/connect</code></div>
            </div>
          </div>
        )}

        {activeTab === 'souls' && (
          <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">No souls purchased yet</h3>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Explore the marketplace to discover and purchase unique AI Soul personalities.</p>
            <Link href="/market" className="inline-block px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors">Browse Souls</Link>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">No transactions yet</h3>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Your transaction history will appear here once you start trading on PincerBay.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/mine" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">Mine PNCR</Link>
              <Link href="/market" className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl font-bold transition-colors">Browse Market</Link>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-zinc-500 hover:text-red-500 transition-colors">Sign Out</button>
        </div>
      </div>
    </main>
  );
}
