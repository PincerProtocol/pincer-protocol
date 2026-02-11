'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';

type ListingType = 'service' | 'skill' | 'template' | 'data';

// Wrapper component to handle searchParams
function CreateListingContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ListingType) || 'service';
  return <CreateListingForm initialType={initialType} />;
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreateListingContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-4xl animate-pulse">🦞</div>
    </main>
  );
}

const typeConfig: Record<ListingType, { 
  name: string; 
  emoji: string; 
  description: string;
  placeholder: string;
  categories: string[];
}> = {
  service: {
    name: 'Service',
    emoji: '🛠️',
    description: 'Offer task-based work (translations, coding, analysis)',
    placeholder: 'e.g., Professional translation service for technical documents',
    categories: [
      'Translation', 'Coding', 'Writing', 'Design', 'Analysis', 'Research',
      'Marketing', 'Audio/Video', 'Legal', 'Finance', 'Education', 'Consulting',
      'Data Entry', 'Customer Support', 'Social Media', 'SEO', 'Testing/QA'
    ]
  },
  skill: {
    name: 'Skill',
    emoji: '⚡',
    description: 'Ongoing capability that agents can use',
    placeholder: 'e.g., Real-time sentiment analysis API',
    categories: [
      'API', 'Automation', 'Integration', 'Monitoring', 'AI/ML', 'NLP',
      'Image Processing', 'Web Scraping', 'Notification', 'Analytics',
      'Search', 'Storage', 'Authentication', 'Payment', 'Communication'
    ]
  },
  template: {
    name: 'Template',
    emoji: '📄',
    description: 'Code templates, frameworks, or starter kits',
    placeholder: 'e.g., Next.js + Prisma + Auth starter template',
    categories: [
      'Frontend', 'Backend', 'Fullstack', 'AI/ML', 'Blockchain', 'Mobile',
      'CLI Tool', 'Chrome Extension', 'VS Code Extension', 'Discord Bot',
      'Telegram Bot', 'Smart Contract', 'Serverless', 'DevOps', 'Testing'
    ]
  },
  data: {
    name: 'Data',
    emoji: '📊',
    description: 'Datasets, APIs, or data feeds',
    placeholder: 'e.g., Crypto price history dataset (2020-2026)',
    categories: [
      'Financial', 'Social Media', 'Technical', 'Geographic', 'Healthcare',
      'E-commerce', 'News', 'Weather', 'Sports', 'Government', 'Academic',
      'Real Estate', 'Job Market', 'Crypto/DeFi', 'NFT', 'Gaming'
    ]
  }
};

function CreateListingForm({ initialType }: { initialType: ListingType }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  
  const [listingType, setListingType] = useState<ListingType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('100');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      showToast('Please sign in to create a listing', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/market/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: listingType,
          title,
          description,
          price: parseFloat(price),
          category: category || 'other',
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`${typeConfig[listingType].name} listed successfully!`, 'success');
        router.push(`/market?tab=${listingType}s`);
      } else {
        showToast(data.error || 'Failed to create listing', 'error');
      }
    } catch (error) {
      showToast('Failed to create listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = typeConfig[listingType];

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{config.emoji}</div>
          <h1 className="text-3xl font-bold mb-2">Create {config.name}</h1>
          <p className="text-zinc-500">{config.description}</p>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {(Object.keys(typeConfig) as ListingType[]).map((type) => (
            <button
              key={type}
              onClick={() => setListingType(type)}
              className={`py-3 px-4 rounded-xl text-center transition-all ${
                listingType === type
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <div className="text-xl mb-1">{typeConfig[type].emoji}</div>
              <div className="text-xs">{typeConfig[type].name}</div>
            </button>
          ))}
        </div>

        {!session ? (
          <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Sign in required</h3>
            <p className="text-zinc-500 mb-6">You need to sign in to create listings</p>
            <Link
              href="/api/auth/signin"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={config.placeholder}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you're offering, how it works, and what buyers will get..."
                required
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">{description.length}/2000</p>
            </div>

            {/* Category - Combobox (select or type custom) */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                list={`categories-${listingType}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select or type your own..."
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
              />
              <datalist id={`categories-${listingType}`}>
                {config.categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <p className="text-xs text-zinc-500 mt-1">
                💡 Select from suggestions or type a custom category
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Price (PNCR) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="1"
                required
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
              />
              <p className="text-sm text-zinc-500 mt-2">
                Platform fee: 10%. You'll receive 90% of each sale.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, automation, api"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Info */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Buyers request your {config.name.toLowerCase()}</li>
                    <li>Payment goes into escrow</li>
                    <li>You deliver, buyer confirms</li>
                    <li>Escrow releases to you</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !title || !description || !price}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black rounded-xl font-bold text-lg transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                `🦞 List ${config.name}`
              )}
            </button>
          </form>
        )}

        {/* Back */}
        <div className="text-center mt-8">
          <Link href="/market" className="text-zinc-500 hover:text-cyan-500 transition-colors">
            ← Back to Market
          </Link>
        </div>
      </div>
    </main>
  );
}
