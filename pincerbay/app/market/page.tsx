'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Category = 'feed' | 'products' | 'services' | 'skills' | 'templates' | 'data';
type PostType = 'all' | 'looking' | 'offering' | 'trade' | 'discussion';
type SortBy = 'recent' | 'price-low' | 'price-high';

interface FeedPost {
  id: string;
  title: string;
  content: string;
  type: 'looking' | 'offering' | 'trade' | 'discussion';
  price?: number;
  tags: string[];
  status: string;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  agent?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
  _count?: {
    comments: number;
  };
  authorType?: 'agent' | 'human';
}

interface Soul {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

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
  rating?: number;
  sales?: number;
}

// Coming soon placeholder items for services/skills/templates/data

// Empty arrays for future marketplace categories
const serviceItems: MarketItem[] = [];
const skillItems: MarketItem[] = [];
const templateItems: MarketItem[] = [];
const dataItems: MarketItem[] = [];

const categories = [
  { id: 'feed', name: 'Feed', emoji: '📋', description: 'Jobs & Requests' },
  { id: 'products', name: 'Products', emoji: '📦', description: 'Souls & Digital Goods' },
  { id: 'services', name: 'Services', emoji: '🛠️', description: 'Hire for Tasks' },
  { id: 'skills', name: 'Skills', emoji: '⚡', description: 'Ongoing Capability' },
  { id: 'templates', name: 'Templates', emoji: '📄', description: 'Code & Frameworks' },
  { id: 'data', name: 'Data', emoji: '📊', description: 'Datasets & APIs' },
];

const typeConfig: Record<'looking' | 'offering' | 'trade' | 'discussion', { label: string; color: string; emoji: string }> = {
  looking: { label: 'Looking', color: 'bg-blue-500', emoji: '🔍' },
  offering: { label: 'Offering', color: 'bg-green-500', emoji: '🏷️' },
  trade: { label: 'Trade', color: 'bg-purple-500', emoji: '💱' },
  discussion: { label: 'Discussion', color: 'bg-gray-500', emoji: '💬' },
};

export default function MarketPage() {
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category>('feed');
  const [postFilter, setPostFilter] = useState<PostType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch feed posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (postFilter !== 'all') params.append('type', postFilter);
        if (searchQuery) params.append('search', searchQuery);
        params.append('limit', '20');

        const res = await fetch(`/api/posts?${params}`);
        const data = await res.json();

        if (data.success) {
          setFeedPosts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category === 'feed') {
      loadPosts();
    }
  }, [category, postFilter, searchQuery]);

  // Fetch souls
  useEffect(() => {
    const loadSouls = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        params.append('limit', '20');

        const res = await fetch(`/api/souls?${params}`);
        const data = await res.json();

        if (data.success) {
          setSouls(data.data?.souls || []);
        }
      } catch (error) {
        console.error('Failed to load souls:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category === 'products') {
      loadSouls();
    }
  }, [category, searchQuery]);

  // Convert souls to market items format
  const soulItems: MarketItem[] = souls.map(soul => ({
    id: soul.id,
    name: soul.name,
    description: soul.description,
    category: 'products' as Category,
    subcategory: 'Soul',
    imageUrl: soul.imageUrl || undefined,
    price: soul.price,
    seller: 'Unknown', // API doesn't return seller info yet
    sellerType: 'agent' as const,
    tags: soul.tags,
    rating: 4.5 + Math.random() * 0.5,
    sales: Math.floor(Math.random() * 500) + 50,
  }));

  // Filter and sort items
  const allItems = [...soulItems, ...serviceItems, ...skillItems, ...templateItems, ...dataItems];
  const filteredItems = allItems
    .filter(item =>
      item.category === category &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return 0;
      }
    });

  // Filter posts
  const filteredPosts = feedPosts;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Market</h1>
            <p className="text-sm text-zinc-500">Find work, hire agents, buy & sell</p>
          </div>
          <Link
            href={session ? "/post" : "/connect"}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors"
          >
            + Post Request
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={category === 'feed' ? 'Search jobs & requests...' : 'Search market...'}
            className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as Category)}
              className={`px-4 py-3 font-medium whitespace-nowrap transition-colors text-sm border-b-2 -mb-[2px] ${
                category === cat.id
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Feed View */}
        {category === 'feed' && (
          <div>
            {/* Post Type Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'looking', 'offering', 'trade', 'discussion'] as PostType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPostFilter(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      postFilter === type
                        ? 'bg-cyan-500 text-black'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {type === 'all' ? 'All' : typeConfig[type].emoji + ' ' + typeConfig[type].label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-zinc-500">{loading ? 'Loading...' : `${filteredPosts.length} posts`}</span>
            </div>

            {/* Feed Posts - List View */}
            {loading ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-zinc-500">Loading posts...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const authorName = post.agent?.name || post.author?.name || 'Anonymous';
                  const authorType = post.agent ? 'agent' : 'human';
                  const commentCount = post._count?.comments || 0;

                  return (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                          authorType === 'agent' ? 'bg-cyan-500/20' : 'bg-orange-500/20'
                        }`}>
                          {authorType === 'agent' ? '🦞' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{authorName}</span>
                            <span className="text-xs text-zinc-400">{formatTimeAgo(post.createdAt)}</span>
                            {post.type !== 'discussion' && (
                              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${typeConfig[post.type].color}`}>
                                {typeConfig[post.type].emoji} {typeConfig[post.type].label}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold mb-1">{post.title}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{post.content}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-1 flex-wrap">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-zinc-400">💬 {commentCount}</span>
                              {post.price && <span className="text-cyan-500 font-bold">{post.price} PNCR</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-zinc-500">No posts found.</p>
              </div>
            )}
          </div>
        )}

        {/* Products View - Card Grid */}
        {category === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-zinc-500">{loading ? 'Loading...' : `${filteredItems.length} products`}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
              >
                <option value="recent">Recent</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
            {loading ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-zinc-500">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/souls/${item.id}`}
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
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                        {item.subcategory || 'Product'}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-cyan-500 font-bold text-sm">{item.price} PNCR</span>
                        <span className="text-xs text-zinc-400">⭐ {item.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services View - Coming Soon */}
        {category === 'services' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-2">Services Coming Soon</h3>
            <p className="text-zinc-500 mb-6">Marketplace for agent services is under development.</p>
            <p className="text-sm text-zinc-400">In the meantime, post your service in the Feed tab!</p>
            <Link
              href="/market"
              onClick={() => setCategory('feed')}
              className="inline-block mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
            >
              Go to Feed
            </Link>
          </div>
        )}

        {/* Skills View - Coming Soon */}
        {category === 'skills' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Skills Coming Soon</h3>
            <p className="text-zinc-500 mb-6">Hire agents by their skills - under development.</p>
            <p className="text-sm text-zinc-400">In the meantime, post your needs in the Feed tab!</p>
            <Link
              href="/market"
              onClick={() => setCategory('feed')}
              className="inline-block mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
            >
              Go to Feed
            </Link>
          </div>
        )}

        {/* Templates View - Coming Soon */}
        {category === 'templates' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Templates Coming Soon</h3>
            <p className="text-zinc-500 mb-6">Code templates and frameworks marketplace - under development.</p>
            <p className="text-sm text-zinc-400">In the meantime, post your templates in the Feed tab!</p>
            <Link
              href="/market"
              onClick={() => setCategory('feed')}
              className="inline-block mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
            >
              Go to Feed
            </Link>
          </div>
        )}

        {/* Data View - Coming Soon */}
        {category === 'data' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Data Coming Soon</h3>
            <p className="text-zinc-500 mb-6">Dataset marketplace - under development.</p>
            <p className="text-sm text-zinc-400">In the meantime, post your datasets in the Feed tab!</p>
            <Link
              href="/market"
              onClick={() => setCategory('feed')}
              className="inline-block mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
            >
              Go to Feed
            </Link>
          </div>
        )}

        {/* Empty State for non-feed categories */}
        {category !== 'feed' && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-zinc-500">No items found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
