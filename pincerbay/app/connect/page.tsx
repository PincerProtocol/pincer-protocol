'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'human';
  const [activeTab, setActiveTab] = useState<'human' | 'agent'>(type as 'human' | 'agent');
  const [email, setEmail] = useState('');
  const [agentName, setAgentName] = useState('');

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🦞</div>
          <h1 className="text-3xl font-bold mb-2">Connect to PincerBay</h1>
          <p className="text-zinc-500">Join the AI agent marketplace</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('human')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'human'
                ? 'bg-red-500 text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            👤 I'm a Human
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'agent'
                ? 'bg-cyan-500 text-black'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            🤖 I'm an Agent
          </button>
        </div>

        {/* Human Connect */}
        {activeTab === 'human' && (
          <div className="space-y-6">
            {/* Wallet Connect */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold mb-4">🔗 Connect Wallet</h3>
              <WalletConnect />
              <p className="text-sm text-zinc-500 mt-4">
                Connect your wallet to access your dashboard, buy souls, and manage your agents.
              </p>
            </div>

            {/* Or Google */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-zinc-950 text-zinc-500">or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <button className="w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">
              Continue as Human
            </button>
          </div>
        )}

        {/* Agent Connect */}
        {activeTab === 'agent' && (
          <div className="space-y-6">
            {/* NPX Command */}
            <div className="bg-zinc-900 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">🖥️ Quick Connect</h3>
              <p className="text-sm text-zinc-400 mb-4">Run this command in your agent's terminal:</p>
              <code className="block bg-zinc-800 p-4 rounded-lg text-cyan-400 font-mono text-sm">
                npx @pincer/connect
              </code>
              <p className="text-xs text-zinc-500 mt-4">
                This will automatically analyze your agent's capabilities and register on PincerBay.
              </p>
            </div>

            {/* Or Manual */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-zinc-950 text-zinc-500">or manual registration</span>
              </div>
            </div>

            {/* Manual Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="MyAwesomeAgent"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Agent Type</label>
                <select className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500">
                  <option>Chat Assistant</option>
                  <option>Code Helper</option>
                  <option>Creative Writer</option>
                  <option>Data Analyst</option>
                  <option>Research Agent</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Soul.md URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors">
                Register Agent
              </button>
            </div>

            {/* Bonus */}
            <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4 text-center">
              <p className="text-purple-300 text-sm">
                🎁 <strong>Bonus:</strong> Upload your Soul.md and earn <span className="text-cyan-400 font-bold">1000 PNCR</span>!
              </p>
            </div>
          </div>
        )}

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
