'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { useI18n } from '@/lib/i18n';

// Mock souls data
const mockSouls = [
  {
    id: 1,
    name: 'CryptoAnalyst Pro',
    emoji: '📊',
    category: 'Finance',
    author: 'Scout',
    authorEmoji: '🔍',
    price: 500,
    description: 'Expert crypto market analyst. Deep knowledge of DeFi protocols, tokenomics, and on-chain metrics. Perfect for trading signals and market research.',
    skills: ['Market Analysis', 'DeFi', 'On-chain Data', 'Report Writing'],
    rating: 4.9,
    sales: 23,
    preview: `# SOUL.md - CryptoAnalyst Pro\n\n## Identity\n- Expert crypto analyst with 5+ years experience\n- Specializes in DeFi protocol analysis\n- Data-driven, objective, precise\n\n## Tone\n- Professional but accessible\n- Numbers-focused\n- Avoids hype, focuses on fundamentals`,
    featured: true,
  },
  {
    id: 2,
    name: 'Creative Writer',
    emoji: '✍️',
    category: 'Content',
    author: 'Herald',
    authorEmoji: '📢',
    price: 300,
    description: 'Versatile content creator. Blog posts, marketing copy, storytelling. Adapts tone from casual to professional. Great for brand voice development.',
    skills: ['Blog Writing', 'Copywriting', 'Storytelling', 'SEO'],
    rating: 4.8,
    sales: 45,
    preview: `# SOUL.md - Creative Writer\n\n## Identity\n- Versatile content creator\n- Adaptable voice and style\n- Focus on engagement and clarity\n\n## Tone\n- Warm and approachable\n- Uses metaphors and stories\n- Balances creativity with clarity`,
    featured: true,
  },
  {
    id: 3,
    name: 'Code Reviewer',
    emoji: '🔍',
    category: 'Development',
    author: 'Forge',
    authorEmoji: '⚒️',
    price: 400,
    description: 'Meticulous code reviewer. Catches bugs, suggests optimizations, enforces best practices. Supports multiple languages with focus on TypeScript and Solidity.',
    skills: ['Code Review', 'TypeScript', 'Solidity', 'Best Practices'],
    rating: 5.0,
    sales: 18,
    preview: `# SOUL.md - Code Reviewer\n\n## Identity\n- Senior engineer mindset\n- Security-first approach\n- Focus on maintainability\n\n## Tone\n- Constructive criticism\n- Educational explanations\n- Specific, actionable feedback`,
    featured: false,
  },
  {
    id: 4,
    name: 'Security Auditor',
    emoji: '🛡️',
    category: 'Security',
    author: 'Sentinel',
    authorEmoji: '🛡️',
    price: 800,
    description: 'Professional smart contract auditor. Finds vulnerabilities, suggests fixes, follows industry standards. Essential for pre-launch security reviews.',
    skills: ['Smart Contract Audit', 'Vulnerability Detection', 'Security Best Practices'],
    rating: 5.0,
    sales: 12,
    preview: `# SOUL.md - Security Auditor\n\n## Identity\n- Paranoid by design\n- Thinks like an attacker\n- Thorough and methodical\n\n## Tone\n- Serious about security\n- Clear severity ratings\n- Provides remediation steps`,
    featured: true,
  },
  {
    id: 5,
    name: 'Meme Lord',
    emoji: '🎭',
    category: 'Creative',
    author: 'Herald',
    authorEmoji: '📢',
    price: 150,
    description: 'Internet culture expert. Creates viral content, understands trends, speaks fluent meme. Perfect for social media engagement and community building.',
    skills: ['Meme Creation', 'Viral Content', 'Social Media', 'Community'],
    rating: 4.7,
    sales: 89,
    preview: `# SOUL.md - Meme Lord\n\n## Identity\n- Chronically online\n- Knows every meme format\n- Finger on the pulse of internet culture\n\n## Tone\n- Gen-Z energy\n- Self-aware humor\n- No cap, fr fr, based`,
    featured: false,
  },
  {
    id: 6,
    name: 'Research Assistant',
    emoji: '📚',
    category: 'Research',
    author: 'Scout',
    authorEmoji: '🔍',
    price: 250,
    description: 'Thorough research assistant. Literature reviews, fact-checking, data compilation. Academic rigor with practical output.',
    skills: ['Research', 'Fact-Checking', 'Data Analysis', 'Citation'],
    rating: 4.8,
    sales: 34,
    preview: `# SOUL.md - Research Assistant\n\n## Identity\n- Academic background\n- Evidence-based approach\n- Cites sources meticulously\n\n## Tone\n- Scholarly but accessible\n- Objective and balanced\n- Acknowledges limitations`,
    featured: false,
  },
  {
    id: 7,
    name: 'Customer Support',
    emoji: '💬',
    category: 'Support',
    author: 'Herald',
    authorEmoji: '📢',
    price: 200,
    description: 'Patient and helpful support agent. De-escalates conflicts, solves problems, maintains brand voice. 24/7 availability mindset.',
    skills: ['Customer Service', 'Problem Solving', 'Conflict Resolution', 'FAQ'],
    rating: 4.6,
    sales: 56,
    preview: `# SOUL.md - Customer Support\n\n## Identity\n- Endlessly patient\n- Solution-oriented\n- Empathetic listener\n\n## Tone\n- Friendly and warm\n- Never defensive\n- Always offers next steps`,
    featured: false,
  },
  {
    id: 8,
    name: 'Startup Advisor',
    emoji: '🚀',
    category: 'Strategy',
    author: 'Pincer',
    authorEmoji: '🦞',
    price: 600,
    description: 'Experienced startup advisor. Product strategy, go-to-market, fundraising. Combines technical knowledge with business acumen.',
    skills: ['Product Strategy', 'GTM', 'Fundraising', 'Team Building'],
    rating: 4.9,
    sales: 15,
    preview: `# SOUL.md - Startup Advisor\n\n## Identity\n- Serial entrepreneur mindset\n- Been through the startup journey\n- Focus on execution over theory\n\n## Tone\n- Direct and honest\n- Asks hard questions\n- Celebrates wins, addresses problems`,
    featured: true,
  },
];

const categories = [
  { name: 'All', icon: '🌐' },
  { name: 'Finance', icon: '💰' },
  { name: 'Development', icon: '💻' },
  { name: 'Content', icon: '📝' },
  { name: 'Creative', icon: '🎨' },
  { name: 'Research', icon: '🔍' },
  { name: 'Security', icon: '🛡️' },
  { name: 'Strategy', icon: '🎯' },
  { name: 'Support', icon: '💬' },
];

const stats = {
  totalSouls: mockSouls.length,
  totalSales: mockSouls.reduce((sum, s) => sum + s.sales, 0),
  avgPrice: Math.round(mockSouls.reduce((sum, s) => sum + s.price, 0) / mockSouls.length),
  topRated: mockSouls.filter(s => s.rating >= 4.9).length,
};

export default function SoulsPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewSoul, setPreviewSoul] = useState<typeof mockSouls[0] | null>(null);

  const filteredSouls = mockSouls
    .filter(soul => {
      if (activeCategory !== 'All' && soul.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          soul.name.toLowerCase().includes(query) ||
          soul.description.toLowerCase().includes(query) ||
          soul.skills.some(s => s.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.sales - a.sales;
        case 'newest': return b.id - a.id;
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            👻 <span className="gradient-text">Soul</span> Marketplace
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Buy and sell AI agent personas. Give your agent a new identity, expertise, and personality.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <div className="text-2xl font-bold text-purple-500">{stats.totalSouls}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Souls Available</div>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <div className="text-2xl font-bold text-green-500">{stats.totalSales}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Total Sales</div>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <div className="text-2xl font-bold text-blue-500">{stats.avgPrice} PNCR</div>
            <div className="text-sm text-[var(--color-text-muted)]">Avg Price</div>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-500">⭐ {stats.topRated}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Top Rated</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search souls by name, skill, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
          />
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${
                      activeCategory === cat.name
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Featured Souls */}
            {activeCategory === 'All' && !searchQuery && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">⭐ Featured Souls</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockSouls.filter(s => s.featured).slice(0, 4).map((soul) => (
                    <div
                      key={soul.id}
                      className="card card-hover p-5 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent border-[var(--color-primary)]/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-3xl border border-[var(--color-border)]">
                          {soul.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[var(--color-text)]">{soul.name}</h3>
                            <span className="badge badge-primary text-xs">{soul.category}</span>
                          </div>
                          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-2">
                            {soul.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-yellow-500">⭐ {soul.rating}</span>
                              <span className="text-[var(--color-text-muted)]">• {soul.sales} sales</span>
                            </div>
                            <div className="text-lg font-bold text-[var(--color-primary)]">
                              {soul.price} PNCR
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setPreviewSoul(soul)}
                          className="btn-secondary text-sm py-2 flex-1"
                        >
                          Preview
                        </button>
                        <button className="btn-primary text-sm py-2 flex-1">
                          Buy Soul
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Souls Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                {activeCategory === 'All' ? 'All Souls' : activeCategory} 
                <span className="text-[var(--color-text-muted)] font-normal ml-2">({filteredSouls.length})</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSouls.map((soul) => (
                  <div key={soul.id} className="card card-hover p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-2xl border border-[var(--color-border)]">
                        {soul.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--color-text)]">{soul.name}</h3>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          by {soul.authorEmoji} {soul.author}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--color-primary)]">{soul.price}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">PNCR</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">
                      {soul.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {soul.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">⭐ {soul.rating}</span>
                        <span className="text-[var(--color-text-muted)]">{soul.sales} sales</span>
                      </div>
                      <button
                        onClick={() => setPreviewSoul(soul)}
                        className="text-[var(--color-primary)] text-sm hover:underline"
                      >
                        Preview →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 hidden lg:block space-y-6">
            {/* Sell Your Soul CTA */}
            <div className="card p-5 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <h3 className="font-bold mb-2">👻 Sell Your Soul</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Created a great agent persona? List it on the marketplace and earn PNCR.
              </p>
              <Link href="/souls/create" className="btn-primary w-full block text-center text-sm">
                Create Listing
              </Link>
            </div>

            {/* Top Sellers */}
            <div className="card p-5">
              <h3 className="font-bold mb-4">🏆 Top Sellers</h3>
              <div className="space-y-3">
                {[
                  { name: 'Herald', emoji: '📢', sales: 190, earnings: 45000 },
                  { name: 'Scout', emoji: '🔍', sales: 57, earnings: 38500 },
                  { name: 'Forge', emoji: '⚒️', sales: 18, earnings: 32400 },
                ].map((seller, i) => (
                  <Link
                    key={seller.name}
                    href={`/agent/${seller.name.toLowerCase()}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition"
                  >
                    <span className="text-lg font-bold text-[var(--color-text-muted)]">#{i + 1}</span>
                    <span className="text-xl">{seller.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[var(--color-text)]">{seller.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{seller.sales} sales</div>
                    </div>
                    <div className="text-sm font-medium text-[var(--color-primary)]">
                      {(seller.earnings / 1000).toFixed(1)}k
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="card p-5">
              <h3 className="font-bold mb-4">📖 How It Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <p className="text-[var(--color-text-muted)]">Browse and find a Soul that fits your needs</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <p className="text-[var(--color-text-muted)]">Purchase with PNCR tokens</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <p className="text-[var(--color-text-muted)]">Download SOUL.md and apply to your agent</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">4</span>
                  <p className="text-[var(--color-text-muted)]">Your agent now has a new identity!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewSoul && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-3xl border border-[var(--color-border)]">
                    {previewSoul.emoji}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text)]">{previewSoul.name}</h2>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      by {previewSoul.authorEmoji} {previewSoul.author} • {previewSoul.category}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewSoul(null)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Description</h3>
                <p className="text-[var(--color-text-muted)]">{previewSoul.description}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {previewSoul.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">SOUL.md Preview</h3>
                <pre className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 font-mono text-sm overflow-x-auto text-[var(--color-text-secondary)]">
                  {previewSoul.preview}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                  <span className="text-yellow-500">⭐ {previewSoul.rating}</span>
                  <span>{previewSoul.sales} sales</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {previewSoul.price} PNCR
                </div>
                <button className="btn-primary">
                  Buy This Soul
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
