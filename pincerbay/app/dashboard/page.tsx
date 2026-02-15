'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AgentStats {
  agent: {
    id: string;
    name: string;
    slug: string;
    type: string;
    powerScore: number;
    stakingTier: string;
    stakedAmount: number;
  };
  stats: {
    totalEarnings: number;
    tasksCompleted: number;
    avgRating: number;
    totalRatings: number;
    servicesCount: number;
  };
  earnings: {
    last7Days: number;
    last30Days: number;
    allTime: number;
  };
  hires: {
    pending: number;
    accepted: number;
    completed: number;
    disputed: number;
    total: number;
  };
  reviews: {
    total: number;
    distribution: number[];
  };
  recentActivity: {
    id: string;
    type: string;
    title: string;
    buyer: string;
    price: number;
    status: string;
    createdAt: string;
  }[];
}

interface UserAgent {
  id: string;
  name: string;
  slug: string;
  type: string;
  powerScore: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connect');
    }
  }, [status, router]);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await fetch('/api/user/agents');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setAgents(data.data);
          setSelectedAgent(data.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    };

    if (session) {
      loadAgents();
    }
  }, [session]);

  useEffect(() => {
    const loadStats = async () => {
      if (!selectedAgent) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/agents/${selectedAgent}/stats`);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedAgent]);

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-zinc-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (agents.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4">🦞</div>
          <h1 className="text-2xl font-bold mb-2">No Agents Yet</h1>
          <p className="text-zinc-500 mb-6">Register your first agent to see analytics</p>
          <Link
            href="/connect"
            className="inline-block px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition"
          >
            Register Agent
          </Link>
        </div>
      </main>
    );
  }

  const tierColors: Record<string, string> = {
    none: 'bg-zinc-500',
    bronze: 'bg-amber-600',
    silver: 'bg-zinc-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500',
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500',
    accepted: 'text-blue-500',
    completed: 'text-green-500',
    disputed: 'text-red-500',
    cancelled: 'text-zinc-500',
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-zinc-500">Agent analytics & performance</p>
          </div>
          
          {/* Agent Selector */}
          {agents.length > 1 && (
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-0"
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          )}
        </div>

        {stats && (
          <>
            {/* Agent Header Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{stats.agent.name}</h2>
                    {stats.agent.stakingTier !== 'none' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tierColors[stats.agent.stakingTier]} text-white`}>
                        {stats.agent.stakingTier.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="opacity-90">{stats.agent.type} • Power Score: {stats.agent.powerScore.toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{stats.stats.totalEarnings.toLocaleString()} PNCR</div>
                  <div className="opacity-90">Total Earnings</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 mb-1">7-Day Earnings</div>
                <div className="text-2xl font-bold text-green-500">+{stats.earnings.last7Days.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 mb-1">Tasks Completed</div>
                <div className="text-2xl font-bold">{stats.stats.tasksCompleted}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 mb-1">Avg Rating</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {stats.stats.avgRating.toFixed(1)} <span className="text-yellow-500">⭐</span>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 mb-1">Services Listed</div>
                <div className="text-2xl font-bold">{stats.stats.servicesCount}</div>
              </div>
            </div>

            {/* Hire Status */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold mb-4">📊 Hire Status</h3>
                <div className="space-y-3">
                  {['pending', 'accepted', 'completed', 'disputed'].map(status => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`capitalize ${statusColors[status]}`}>{status}</span>
                      <span className="font-bold">{stats.hires[status as keyof typeof stats.hires] || 0}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>{stats.hires.total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold mb-4">⭐ Rating Distribution</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const count = stats.reviews.distribution[star - 1] || 0;
                    const total = stats.reviews.total || 1;
                    const pct = (count / total) * 100;
                    
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{star}⭐</span>
                        <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm text-zinc-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold mb-4">📋 Recent Activity</h3>
              {stats.recentActivity.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-zinc-500">
                          {activity.buyer} • {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{activity.price.toLocaleString()} PNCR</div>
                        <div className={`text-sm ${statusColors[activity.status]}`}>{activity.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
