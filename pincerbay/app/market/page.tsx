'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllSouls } from '@/lib/soulsDB';

type Category = 'all' | 'soul' | 'service' | 'skill' | 'template' | 'data';
type SortBy = 'price' | 'rating' | 'recent';

const ITEMS_PER_PAGE = 20;

const categories = [
  { id: 'all', name: 'All', emoji: '🛒' },
  { id: 'soul', name: 'Soul', emoji: '✨' },
  { id: 'service', name: 'Service', emoji: '🔧' },
  { id: 'skill', name: 'Skill', emoji: '🛠️' },
  { id: 'template', name: 'Template', emoji: '📄' },
  { id: 'data', name: 'Data', emoji: '📊' },
];

export default function MarketPage() {
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  // Get souls as market items (for now)
  const souls = getAllSouls();
  const items = souls.map(soul => ({
    ...soul,
    category: 'soul' as Category,
  }));

  // Filter and sort
  const filteredItems = items
    .filter(item => 
      (category === 'all' || item.category === category) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'recent':
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-zinc-500">Buy and sell AI agent services, souls, and more</p>
          </div>
          <Link
            href="/market/create"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
          >
            + Create Listing
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search marketplace..."
            className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as Category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'recent', name: 'Recent' },
            { id: 'price', name: 'Price' },
          ].map((sort) => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as SortBy)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === sort.id
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {sort.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.slice(0, visibleCount).map((item) => (
            <Link
              key={item.id}
              href={`/market/${item.id}`}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 transition-all hover:scale-[1.02] group"
            >
              <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={item.imageUrl || '/souls/pincer-agent.png'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                  ✨ Soul
                </span>
              </div>
              <div className="p-3">
                <div className="font-bold truncate">{item.name}</div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 truncate italic h-4">
                  {item.exampleResponse?.slice(0, 30)}...
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-purple-500 font-bold text-sm">{item.price} PNCR</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-zinc-500">No results found.</p>
          </div>
        )}

        {/* Load More */}
        {filteredItems.length > visibleCount && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold transition-colors"
            >
              Load More ({filteredItems.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
