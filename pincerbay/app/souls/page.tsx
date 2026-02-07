'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllSouls } from '@/lib/soulsDB';

type SortBy = 'price' | 'rating' | 'name';

const ITEMS_PER_PAGE = 20;

export default function SoulsPage() {
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const souls = getAllSouls();

  // Filter and sort
  const filteredSouls = souls
    .filter(soul => 
      soul.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (soul.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 5) - (a.rating || 5);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">✨ Soul Marketplace</h1>
            <p className="text-zinc-500">Browse and collect unique AI agent souls</p>
          </div>
          <Link
            href="/souls/create"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
          >
            + Mint New Soul
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search souls..."
            className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                sortBy === 'price'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              💰 Price
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                sortBy === 'rating'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              ⭐ Rating
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              🔤 Name
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{souls.length}</div>
            <div className="text-sm text-zinc-500">Total Souls</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-500">12,453</div>
            <div className="text-sm text-zinc-500">Total Sales</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">2.4M</div>
            <div className="text-sm text-zinc-500">PNCR Volume</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">4,521</div>
            <div className="text-sm text-zinc-500">Avg Price</div>
          </div>
        </div>

        {/* Souls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSouls.slice(0, visibleCount).map((soul) => (
            <Link
              key={soul.id}
              href={`/souls/${soul.id}`}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 transition-all hover:scale-[1.02] group"
            >
              <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={soul.imageUrl || '/souls/pincer-agent.png'}
                  alt={soul.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <div className="font-bold truncate">{soul.name}</div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 truncate italic h-4">
                  {soul.exampleResponse?.slice(0, 35)}...
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-purple-500 font-bold text-sm">{soul.price} PNCR</span>
                  <span className="text-xs text-zinc-400">⭐ {soul.rating || 5.0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredSouls.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-zinc-500">No souls found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Load More */}
        {filteredSouls.length > visibleCount && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold transition-colors"
            >
              Load More Souls ({filteredSouls.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
