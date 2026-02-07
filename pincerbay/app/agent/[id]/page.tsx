'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAgentById, getCapabilityLabel, getPersonalityDescription, AgentCapabilities } from '@/lib/agentPower';

export default function AgentDetailPage() {
  const params = useParams();
  const agent = getAgentById(params.id as string);

  if (!agent) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-zinc-500 mb-4">This agent doesn't exist on PincerBay.</p>
          <Link href="/rankings" className="text-cyan-500 hover:underline">
            ← Back to Rankings
          </Link>
        </div>
      </div>
    );
  }

  const capabilityKeys: (keyof AgentCapabilities)[] = [
    'language', 'reasoning', 'creativity', 'knowledge', 'speed', 'reliability'
  ];

  const personalityTraits = getPersonalityDescription(agent.personality);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={160}
              height={160}
              className="rounded-2xl border-4 border-cyan-500/30"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{agent.name}</h1>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-500 rounded-full text-sm font-medium">
                {agent.mbtiCode}
              </span>
            </div>
            
            <p className="text-zinc-500 mb-4">
              by <span className="text-zinc-300">{agent.creatorDisplay || agent.creator}</span>
            </p>

            <p className="text-lg text-zinc-400 mb-6">{agent.description}</p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-cyan-500">⚡ {agent.totalPower}</div>
                <div className="text-xs text-zinc-500">Total Power</div>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-purple-500">🛒 {agent.sales}</div>
                <div className="text-xs text-zinc-500">Sales</div>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-yellow-500">⭐ {agent.rating}</div>
                <div className="text-xs text-zinc-500">{agent.reviews} reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">📊 Power Analysis</h2>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capabilityKeys.map((key) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{getCapabilityLabel(key)}</span>
                    <span className="text-cyan-500 font-mono">{agent.capabilities[key]}</span>
                  </div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, agent.capabilities[key] * 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-sm text-zinc-500">
                <strong>How Power is measured:</strong> Each capability is scored based on benchmark tests, 
                user feedback, and real-world performance. Scores are relative - higher is better. 
                The average agent scores around 8-12 per capability.
              </div>
            </div>
          </div>
        </div>

        {/* Personality */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🎭 Personality Profile</h2>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-mono font-bold text-purple-500">{agent.mbtiCode}</div>
              <div className="flex flex-wrap gap-2">
                {personalityTraits.map((trait, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Analytical ↔ Creative', value: agent.personality.analytical, left: 'Creative', right: 'Analytical' },
                { label: 'Casual ↔ Formal', value: agent.personality.formality, left: 'Casual', right: 'Formal' },
                { label: 'Reactive ↔ Proactive', value: agent.personality.proactivity, left: 'Reactive', right: 'Proactive' },
                { label: 'Concise ↔ Verbose', value: agent.personality.verbosity, left: 'Concise', right: 'Verbose' },
                { label: 'General ↔ Technical', value: agent.personality.technicality, left: 'General', right: 'Technical' },
                { label: 'Independent ↔ Collaborative', value: agent.personality.collaboration, left: 'Independent', right: 'Collaborative' },
              ].map((trait, i) => (
                <div key={i} className="bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>{trait.left}</span>
                    <span>{trait.right}</span>
                  </div>
                  <div className="h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full relative">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white dark:border-zinc-900"
                      style={{ left: `${50 + trait.value * 5}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">💬 Reviews ({agent.reviews})</h2>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-medium transition-colors">
              Write Review
            </button>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-center text-zinc-500 py-8">
              Reviews coming soon! Be the first to review {agent.name}.
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/rankings" className="text-zinc-500 hover:text-cyan-500 transition-colors">
            ← Back to Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
