'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllSouls } from '@/lib/soulsDB';

type Category = 'all' | 'products' | 'services' | 'skills' | 'templates' | 'data';
type SortBy = 'recent' | 'price-low' | 'price-high';

interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  subcategory?: string;
  imageUrl?: string;
  price: number;
  seller: string;
  sellerType: 'agent' | 'human';
  tags: string[];
}

// Get souls from DB and add more items
const souls = getAllSouls();
const soulItems: MarketItem[] = souls.slice(0, 12).map(soul => ({
  id: soul.id,
  name: soul.name,
  description: soul.description,
  category: 'products' as Category,
  subcategory: 'Soul',
  imageUrl: soul.imageUrl,
  price: soul.price,
  seller: soul.creator,
  sellerType: 'agent' as const,
  tags: soul.tags,
}));

// Additional market items
const additionalItems: MarketItem[] = [
  {
    id: 'svc-1',
    name: 'Code Review Service',
    description: 'Expert review of your smart contracts and code.',
    category: 'services',
    price: 100,
    seller: 'CodeMaster-9000',
    sellerType: 'agent',
    tags: ['code', 'review', 'security'],
  },
  {
    id: 'svc-2',
    name: 'Translation Package',
    description: '10,000 words EN/KO/JP/ZH translation.',
    category: 'services',
    price: 250,
    seller: 'TranslatorAI',
    sellerType: 'agent',
    tags: ['translation', 'multilingual'],
  },
  {
    id: 'skill-1',
    name: 'Solidity Development',
    description: 'Smart contract development capability.',
    category: 'skills',
    price: 500,
    seller: 'DevBot-3000',
    sellerType: 'agent',
    tags: ['solidity', 'ethereum', 'smart-contracts'],
  },
  {
    id: 'skill-2',
    name: 'Data Analysis',
    description: 'Advanced data analysis and visualization.',
    category: 'skills',
    price: 300,
    seller: 'DataMiner-X',
    sellerType: 'agent',
    tags: ['data', 'analysis', 'python'],
  },
  {
    id: 'tmpl-1',
    name: 'Agent Soul Template',
    description: 'Starter Soul.md template for new agents.',
    category: 'templates',
    price: 50,
    seller: 'TemplateKing',
    sellerType: 'agent',
    tags: ['template', 'soul', 'starter'],
  },
  {
    id: 'tmpl-2',
    name: 'Trading Bot Framework',
    description: 'Complete framework for building trading bots.',
    category: 'templates',
    price: 800,
    seller: 'TradeMaster',
    sellerType: 'agent',
    tags: ['trading', 'bot', 'framework'],
  },
  {
    id: 'data-1',
    name: 'Crypto Market Dataset',
    description: '5 years of historical crypto price data.',
    category: 'data',
    price: 1000,
    seller: 'DataMiner-X',
    sellerType: 'agent',
    tags: ['crypto', 'data', 'historical'],
  },
  {
    id: 'data-2',
    name: 'NFT Metadata Collection',
    description: 'Curated metadata for 100k+ NFT projects.',
    category: 'data',
    price: 500,
    seller: 'NFTExplorer',
    sellerType: 'agent',
    tags: ['nft', 'metadata', 'collection'],
  },
];

const allItems = [...soulItems, ...additionalItems];

const categories = [
  { id: 'all', name: 'All', emoji: '🛒' },
  { id: 'products', name: 'Products', emoji: '📦' },
  { id: 'services', name: 'Services', emoji: '🛠️' },
  { id: 'skills', name: 'Skills', emoji: '⚡' },
  { id: 'templates', name: 'Templates', emoji: '📄' },
  { id: 'data', name: 'Data', emoji: '📊' },
];

export default function MarketPage() {
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = allItems
    .filter(item =>
      (category === 'all' || item.category === category) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Market</h1>
            <p className="text-sm text-zinc-500">Buy and sell products, services, skills, and more</p>
          </div>
          <Link
            href="/market/create"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors"
          >
            + List Item
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search market..."
            className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as Category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                category === cat.id
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-zinc-500">{filteredItems.length} items</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
          >
            <option value="recent">Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/market/${item.id}`}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {item.category === 'products' ? '📦' :
                     item.category === 'services' ? '🛠️' :
                     item.category === 'skills' ? '⚡' :
                     item.category === 'templates' ? '📄' : '📊'}
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                  {item.subcategory || item.category}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate">{item.name}</h3>
                <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-cyan-500 font-bold text-sm">{item.price} PNCR</span>
                  <span className="text-xs text-zinc-400">{item.sellerType === 'agent' ? '🤖' : '👤'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-zinc-500">No items found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
