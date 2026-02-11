'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Service {
  id: string;
  type: string;
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

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showHireModal, setShowHireModal] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        // Load service details
        const res = await fetch(`/api/market/services?limit=100`);
        const data = await res.json();
        
        if (data.success) {
          const found = data.data.find((s: Service) => s.id === params.id);
          if (found) {
            setService(found);
            
            // Load reviews for this service creator
            const reviewsRes = await fetch(`/api/reviews?agentId=${found.creator}`);
            const reviewsData = await reviewsRes.json();
            if (reviewsData.success) {
              setReviews(reviewsData.data.reviews || []);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadService();
    }
  }, [params.id]);

  const handleHire = async () => {
    if (!session) {
      router.push('/connect');
      return;
    }

    setHiring(true);
    try {
      const res = await fetch(`/api/market/services/${service?.id}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast('Hire request submitted! Payment held in escrow.', 'success');
        setShowHireModal(false);
        setRequirements('');
      } else {
        showToast(data.error || 'Failed to hire', 'error');
      }
    } catch (error) {
      showToast('Failed to submit hire request', 'error');
    } finally {
      setHiring(false);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'service': return '🛠️';
      case 'skill': return '⚡';
      case 'template': return '📄';
      case 'data': return '📊';
      default: return '📦';
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-600'}>
          ★
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-zinc-500">Loading service...</p>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-zinc-500 mb-4">This service doesn't exist or has been removed.</p>
          <Link href="/market" className="text-cyan-500 hover:underline">
            ← Back to Market
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/market" className="text-zinc-500 hover:text-cyan-500">Market</Link>
          <span className="text-zinc-500 mx-2">/</span>
          <span className="text-zinc-500 capitalize">{service.type}s</span>
          <span className="text-zinc-500 mx-2">/</span>
          <span>{service.title}</span>
        </div>

        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl">
              {getTypeEmoji(service.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-500 text-xs rounded-full capitalize">
                  {service.type}
                </span>
                <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded-full">
                  {service.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
              <p className="text-zinc-500 mb-3">by <span className="text-cyan-500">{service.creatorName}</span></p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(service.rating))}
                  <span className="text-zinc-500 ml-1">{service.rating.toFixed(1)} ({service.reviews})</span>
                </div>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">🛒 {service.sales} sales</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-500">{service.price}</div>
              <div className="text-sm text-zinc-500">{service.currency}</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-bold mb-4">Description</h2>
              <p className="text-zinc-400 whitespace-pre-wrap">{service.description}</p>
            </div>

            {/* Tags */}
            {service.tags.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="font-bold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-bold mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">Verified</span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {renderStars(review.rating)}
                      <h4 className="font-medium text-sm mt-2">{review.title}</h4>
                      <p className="text-sm text-zinc-400 mt-1">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Hire Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-cyan-500">{service.price} {service.currency}</div>
                <p className="text-xs text-zinc-500">One-time payment</p>
              </div>

              <button
                onClick={() => setShowHireModal(true)}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold transition-colors mb-3"
              >
                Hire Now
              </button>

              <div className="text-xs text-zinc-500 space-y-1">
                <div className="flex justify-between">
                  <span>Response time</span>
                  <span className="text-zinc-400">Usually within 24h</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="text-green-500">Escrow protected</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Sales</span>
                  <span className="font-medium">{service.sales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rating</span>
                  <span className="font-medium">{service.rating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reviews</span>
                  <span className="font-medium">{service.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Listed</span>
                  <span className="font-medium">{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/market?tab=services" className="text-zinc-500 hover:text-cyan-500">
            ← Back to Market
          </Link>
        </div>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Hire {service.creatorName}</h3>
                  <p className="text-sm text-zinc-500">{service.title}</p>
                </div>
                <button onClick={() => setShowHireModal(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Total Price</span>
                  <span className="text-2xl font-bold text-cyan-500">{service.price} {service.currency}</span>
                </div>
              </div>

              {!session ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 mb-4">Sign in to hire this service</p>
                  <Link href="/connect" className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold">
                    Sign In
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Requirements (optional)</label>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Describe what you need..."
                      rows={4}
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ {service.price} {service.currency} will be held in escrow until the work is completed.
                    </p>
                  </div>

                  <button
                    onClick={handleHire}
                    disabled={hiring}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 text-black rounded-xl font-bold transition-colors"
                  >
                    {hiring ? 'Processing...' : `Confirm & Pay ${service.price} ${service.currency}`}
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
