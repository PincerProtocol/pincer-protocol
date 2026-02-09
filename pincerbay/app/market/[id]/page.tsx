"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Soul {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  tags: string[];
  creator: string;
  rating?: number;
  reviews?: number;
  purchases?: number;
}

export default function SoulDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [soul, setSoul] = useState<Soul | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [wallet, setWallet] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSoul = async () => {
      try {
        const res = await fetch(`/api/souls/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSoul(data);
        } else {
          console.error("Failed to fetch soul");
        }
      } catch (error) {
        console.error("Error fetching soul:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSoul();
    }
  }, [params.id]);

  const handlePurchase = async () => {
    if (!wallet) {
      setError("Please enter your wallet address");
      return;
    }

    if (!soul) return;

    setError("");
    setSuccess("");
    setPurchasing(true);
    try {
      const res = await fetch(`/api/souls/${soul.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Purchase successful!");
        setPurchased(true);

        // Auto-download
        const downloadUrl = `/api/souls/${soul.id}/download?wallet=${wallet}`;
        window.open(downloadUrl, '_blank');
      } else {
        setError(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Error purchasing soul:", error);
      setError("Failed to process purchase");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (!soul || !wallet) return;
    const downloadUrl = `/api/souls/${soul.id}/download?wallet=${wallet}`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-xl text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!soul) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-xl text-red-600">Soul not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-2xl bg-white/20 mascot-float">
                {soul.imageUrl ? (
                  <Image
                    src={soul.imageUrl}
                    alt={soul.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Image
                    src="/mascot-white-dark.webp"
                    alt="Soul"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{soul.name}</h1>
                <p className="text-purple-100 mt-2">by {soul.creator}</p>
              </div>
            </div>
            
            {soul.rating && (
              <div className="flex items-center gap-4 text-sm">
                <span>⭐ {soul.rating}/5.0</span>
                <span>•</span>
                <span>{soul.reviews} reviews</span>
                <span>•</span>
                <span>{soul.purchases} purchases</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                Description
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {soul.description}
              </p>
            </section>

            {/* Tags */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {soul.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Purchase Section */}
            <section className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black dark:text-white">
                    Price
                  </h3>
                  <p className="text-4xl font-bold gradient-text mt-2">
                    {soul.price} PNCR
                  </p>
                </div>
              </div>

              {/* Wallet Input */}
              <div className="mb-4">
                <label htmlFor="wallet" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Your Wallet Address
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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Action Buttons */}
              {!purchased ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !wallet}
                  className="btn-enhanced btn-buy w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? "Processing..." : `🦞 Purchase for ${soul.price} PNCR`}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center">
                    ✅ Purchase Successful!
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn-enhanced w-full px-6 py-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    📥 Download Soul.md
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">
            🔒 What You Get
          </h3>
          <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
            <li>• Complete Soul.md file with personality traits</li>
            <li>• Speech patterns and example responses</li>
            <li>• Integration-ready format</li>
            <li>• Lifetime access after purchase</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
