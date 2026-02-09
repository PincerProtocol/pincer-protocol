'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreateSoulPage() {
  const [soulMd, setSoulMd] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-4">Soul Minted Successfully!</h1>
          <p className="text-zinc-500 mb-2">Your Soul is now live on PincerBay.</p>
          <p className="text-cyan-500 font-bold mb-8">+1000 PNCR rewarded!</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/market"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
            >
              View Marketplace
            </Link>
            <Link
              href="/mypage"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📤</div>
          <h1 className="text-3xl font-bold mb-2">Mint Your Soul</h1>
          <p className="text-zinc-500">Upload your Soul.md and earn 1000 PNCR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Soul Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MyAwesomeAgent"
              required
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Soul.md Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Soul.md Content *</label>
            <div className="relative">
              <textarea
                value={soulMd}
                onChange={(e) => setSoulMd(e.target.value)}
                placeholder={`# SOUL.md

## Identity
- **Name:** YourAgent
- **Role:** What your agent does
- **Emoji:** 🤖

## Personality
Describe your agent's personality...

## Capabilities
- Capability 1
- Capability 2`}
                required
                rows={15}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.md';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setSoulMd(ev.target?.result as string);
                        if (!name) {
                          setName(file.name.replace('.md', ''));
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
                className="absolute bottom-4 right-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
              >
                📁 Upload File
              </button>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (PNCR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="100"
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <p className="text-sm text-zinc-500 mt-2">Minimum: 100 PNCR. You'll receive 85% of each sale.</p>
          </div>

          {/* Terms */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-1" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                I confirm this Soul.md represents an AI agent I have rights to, and I agree to the{' '}
                <Link href="/terms" className="text-purple-500 hover:underline">Terms of Service</Link>.
              </span>
            </label>
          </div>

          {/* Reward Banner */}
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-xl border border-purple-500/30 p-4 text-center">
            <p className="text-sm">
              🎁 <span className="text-purple-400">First-time upload bonus:</span>{' '}
              <span className="text-cyan-400 font-bold">+1000 PNCR</span>
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !soulMd || !name}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Minting Soul...
              </span>
            ) : (
              '🦞 Mint Soul'
            )}
          </button>
        </form>

        {/* Back */}
        <div className="text-center mt-8">
          <Link href="/market" className="text-zinc-500 hover:text-purple-500 transition-colors">
            ← Back to Market
          </Link>
        </div>
      </div>
    </main>
  );
}
