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

// Note: Services/Skills/Templates/Data are now fetched from /api/market/services

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

interface ServiceItem {
  id: string;
  type: 'service' | 'skill' | 'template' | 'data';
  title: string;
  description: string;
  price: number;
  currency: string;
  creator: string;
  creatorName: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  sales: number;
  status: string;
  createdAt: string;
}

export default function MarketPage() {
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category>('feed');
  const [postFilter, setPostFilter] = useState<PostType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [marketServices, setMarketServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [hireRequirements, setHireRequirements] = useState('');
  const [submittingHire, setSubmittingHire] = useState(false);

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

  // Fetch services/skills/templates/data
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const typeMap: Record<string, string> = {
          services: 'service',
          skills: 'skill',
          templates: 'template',
          data: 'data',
        };
        const type = typeMap[category];
        if (!type) return;

        const params = new URLSearchParams();
        params.append('type', type);
        if (searchQuery) params.append('q', searchQuery);
        params.append('limit', '20');

        const res = await fetch(`/api/market/services?${params}`);
        const data = await res.json();

        if (data.success) {
          setMarketServices(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (['services', 'skills', 'templates', 'data'].includes(category)) {
      loadServices();
    }
  }, [category, searchQuery]);

  // Handle hire
  const handleHire = async () => {
    if (!selectedService || !session) return;

    setSubmittingHire(true);
    try {
      const res = await fetch(`/api/market/services/${selectedService.id}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: hireRequirements }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Hire request submitted! The seller will be notified.');
        setSelectedService(null);
        setHireRequirements('');
      } else {
        alert(data.error || 'Failed to submit hire request');
      }
    } catch (error) {
      console.error('Hire error:', error);
      alert('Failed to submit hire request');
    } finally {
      setSubmittingHire(false);
    }
  };

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

  // Filter and sort product items (souls)
  const filteredItems = soulItems
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

        {/* Services/Skills/Templates/Data View */}
        {['services', 'skills', 'templates', 'data'].includes(category) && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-zinc-500">Loading {category}...</p>
              </div>
            ) : marketServices.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">
                  {category === 'services' ? '🛠️' : category === 'skills' ? '⚡' : category === 'templates' ? '📄' : '📊'}
                </div>
                <h3 className="text-xl font-bold mb-2">No {category} found</h3>
                <p className="text-zinc-500 mb-6">Be the first to list your {category.slice(0, -1)}!</p>
                <Link
                  href="/market/create"
                  className="inline-block mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketServices.map((item) => (
                  <Link
                    href={`/market/service/${item.id}`}
                    key={item.id}
                    className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-cyan-500/50 transition-colors block"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {item.type === 'service' ? '🛠️' : item.type === 'skill' ? '⚡' : item.type === 'template' ? '📄' : '📊'}
                            </span>
                            <h3 className="font-bold text-sm truncate">{item.title}</h3>
                          </div>
                          <p className="text-xs text-zinc-500">by {item.creatorName}</p>
                        </div>
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-500 rounded text-xs font-bold">
                          {item.price} PNCR
                        </span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span>⭐ {item.rating.toFixed(1)}</span>
                          <span>({item.reviews})</span>
                          <span>🛒 {item.sales}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedService(item);
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg text-xs font-bold transition-colors"
                        >
                          Hire
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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

      {/* Hire Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Hire {selectedService.creatorName}</h3>
                  <p className="text-sm text-zinc-500">{selectedService.title}</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-500">Price</span>
                  <span className="text-xl font-bold text-cyan-500">{selectedService.price} PNCR</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Rating</span>
                  <span>⭐ {selectedService.rating.toFixed(1)} ({selectedService.reviews} reviews)</span>
                </div>
              </div>

              {!session ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 mb-4">Sign in to hire this service</p>
                  <Link
                    href="/connect"
                    className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Requirements (optional)</label>
                    <textarea
                      value={hireRequirements}
                      onChange={(e) => setHireRequirements(e.target.value)}
                      placeholder="Describe what you need help with..."
                      rows={4}
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ Payment of {selectedService.price} PNCR will be held in escrow until the work is completed.
                    </p>
                  </div>

                  <button
                    onClick={handleHire}
                    disabled={submittingHire}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 text-black rounded-xl font-bold transition-colors"
                  >
                    {submittingHire ? 'Submitting...' : `Hire for ${selectedService.price} PNCR`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
