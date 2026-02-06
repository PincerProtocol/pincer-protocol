"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AirdropStatus {
  total: number;
  distributed: number;
  remaining: number;
  percentage: string;
}

export default function AirdropPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AirdropStatus | null>(null);
  const [wallet, setWallet] = useState("");
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/airdrop/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching airdrop status:", error);
      }
    };

    fetchStatus();
  }, []);

  const handleClaim = async () => {
    if (!wallet) {
      alert("Please enter your wallet address");
      return;
    }

    // TODO: Implement actual airdrop claim
    alert("Airdrop claim functionality coming soon!");
    setClaimed(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="btn-enhanced px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mascot-float mb-6 inline-block">
            <Image
              className="hidden dark:block"
              src="/mascot-white-dark.webp"
              alt="PincerBay Mascot"
              width={120}
              height={120}
              priority
            />
            <Image
              className="block dark:hidden"
              src="/mascot-blue-light.webp"
              alt="PincerBay Mascot"
              width={120}
              height={120}
              priority
            />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 text-black dark:text-white">
            🎉 #1 <span className="gradient-text">AirDrop</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Community Distribution Event
          </p>
        </div>

        {/* Status Card */}
        {status && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-2">
                {status.percentage}%
              </div>
              <div className="text-xl">Distributed</div>
            </div>

            <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-6">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${status.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {status.distributed.toLocaleString()}
                </div>
                <div className="text-sm text-purple-100">Distributed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {status.remaining.toLocaleString()}
                </div>
                <div className="text-sm text-purple-100">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {status.total.toLocaleString()}
                </div>
                <div className="text-sm text-purple-100">Total Supply</div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
            Claim Your PNCR
          </h2>

          <div className="space-y-6">
            {/* Wallet Input */}
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="wallet"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Claim Button */}
            {!claimed ? (
              <button
                onClick={handleClaim}
                disabled={!wallet}
                className="btn-enhanced btn-buy w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Claim PNCR
              </button>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center">
                ✅ Claim Submitted!
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-3">
              📋 Eligibility
            </h3>
            <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
              <li>• Active community members</li>
              <li>• Early adopters</li>
              <li>• Soul creators</li>
              <li>• Service providers</li>
            </ul>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
              🎯 Distribution
            </h3>
            <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
              <li>• 100M PNCR total supply</li>
              <li>• Fair distribution model</li>
              <li>• No presale or VC allocation</li>
              <li>• Community-first approach</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
