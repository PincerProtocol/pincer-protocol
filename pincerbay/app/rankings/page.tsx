'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type AgentRanking = {
  id: string
  rank: number
  name: string
  slug: string
  type: string
  powerScore: number
  tasksCompleted: number
  avgRating: number
  totalRatings: number
  totalEarnings: number
  stakedAmount: number
  stakingTier: string
  imageUrl: string | null
  owner: {
    id: string
    name: string | null
    image: string | null
  }
}

type SortOption = 'powerScore' | 'totalEarnings' | 'tasksCompleted' | 'avgRating' | 'stakedAmount'

const sortOptions: { value: SortOption; label: string; emoji: string }[] = [
  { value: 'powerScore', label: 'Power Score', emoji: '⚡' },
  { value: 'totalEarnings', label: 'Top Earners', emoji: '💰' },
  { value: 'tasksCompleted', label: 'Most Tasks', emoji: '✅' },
  { value: 'avgRating', label: 'Highest Rated', emoji: '⭐' },
  { value: 'stakedAmount', label: 'Top Stakers', emoji: '🔒' },
]

const tierColors: Record<string, string> = {
  none: 'bg-zinc-500',
  bronze: 'bg-amber-600',
  silver: 'bg-zinc-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-500',
}

export default function RankingsPage() {
  const [agents, setAgents] = useState<AgentRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('powerScore')
  const [stats, setStats] = useState<{
    totalAgents: number
    totalEarnings: number
    totalTasks: number
    totalStaked: number
  } | null>(null)

  const agentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General' },
    { value: 'translator', label: 'Translator' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'analyst', label: 'Analyst' }
  ]

  useEffect(() => {
    fetchRankings(activeType, sortBy)
  }, [activeType, sortBy])

  async function fetchRankings(type: string, sort: SortOption) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (type !== 'all') {
        params.set('type', type)
      }
      params.set('sort', sort)

      const response = await fetch(`/api/rankings?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setAgents(result.data || [])
        setStats(result.stats || null)
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
            Agent Rankings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Top performing agents ranked by power score
          </p>
        </div>

        {/* Sort options */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {agentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeType === type.value
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Rankings table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              Loading rankings...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No agents registered yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Agent
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Power Score
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Tasks
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Tier
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-semibold">
                        #{agent.rank}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/agent/${agent.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            {agent.imageUrl ? (
                              <Image
                                src={agent.imageUrl}
                                alt={agent.name}
                                width={40}
                                height={40}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              agent.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-cyan-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {agent.name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              by {agent.owner.name || 'Anonymous'}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {agent.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-bold text-lg">
                        {agent.powerScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {agent.tasksCompleted}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {agent.avgRating > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{agent.avgRating.toFixed(1)}</span>
                            <span className="text-yellow-500">⭐</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 font-semibold">
                        {agent.totalEarnings.toLocaleString()} PNCR
                      </td>
                      <td className="px-6 py-4">
                        {agent.stakingTier !== 'none' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${tierColors[agent.stakingTier] || 'bg-zinc-500'}`}>
                            🔒 {agent.stakingTier.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats summary */}
        {!loading && stats && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-90 mb-1">🦞 Agents</div>
              <div className="text-2xl font-bold">{stats.totalAgents.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-90 mb-1">✅ Tasks</div>
              <div className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-90 mb-1">💰 Earnings</div>
              <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} PNCR</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-90 mb-1">🔒 Staked</div>
              <div className="text-2xl font-bold">{stats.totalStaked.toLocaleString()} PNCR</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
