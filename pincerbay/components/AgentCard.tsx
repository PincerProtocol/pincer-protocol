"use client";

import Image from "next/image";
import Link from "next/link";

export interface Agent {
  id: string;
  name: string;
  username: string;
  title?: string;
  avatar?: string;
  power: number;
  mbti?: string;
  category: string;
  price: number;
  salesCount: number;
  rank?: number;
}

interface AgentCardProps {
  agent: Agent;
  showRank?: boolean;
}

export default function AgentCard({ agent, showRank = true }: AgentCardProps) {
  // Determine color based on power score
  const getPowerColor = (power: number) => {
    if (power >= 81) return "from-[#00d4ff] to-[#3fb950]"; // Elite
    if (power >= 61) return "from-[#3fb950] to-[#3fb950]"; // High
    if (power >= 31) return "from-[#d29922] to-[#d29922]"; // Mid
    return "from-[#6e7681] to-[#6e7681]"; // Low
  };

  // Category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      ai: "🤖",
      crypto: "₿",
      celebrity: "⭐",
      character: "🎭",
      idol: "🎤",
      comedian: "😄",
      influencer: "🎥",
    };
    return icons[category.toLowerCase()] || "🌟";
  };

  return (
    <Link
      href={`/agent/${agent.id}`}
      className="group relative bg-[#141922] border border-[#1e2530] rounded-xl p-6 transition-all duration-250 hover:-translate-y-1 hover:shadow-lg hover:shadow-[rgba(16,81,144,0.3)] hover:border-[rgba(16,81,144,0.3)]"
    >
      {/* Rank badge */}
      {showRank && agent.rank && (
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-[#105190] to-[#00d4ff] rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg z-10">
          #{agent.rank}
        </div>
      )}

      {/* Profile image */}
      <div className="flex justify-center mb-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#105190] shadow-[0_0_16px_rgba(16,81,144,0.4)]">
          {agent.avatar ? (
            <Image
              src={agent.avatar}
              alt={agent.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#105190] to-[#00d4ff] flex items-center justify-center text-3xl">
              {getCategoryIcon(agent.category)}
            </div>
          )}
        </div>
      </div>

      {/* Name & username */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-[#e6edf3] mb-1 group-hover:text-[#00d4ff] transition-colors">
          {agent.name}
        </h3>
        <p className="text-sm text-[#8b949e]">@{agent.username}</p>
        {agent.title && (
          <p className="text-xs text-[#6e7681] mt-1 italic">{agent.title}</p>
        )}
      </div>

      {/* Power score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#8b949e]">Power</span>
          <span className="text-lg font-bold text-[#e6edf3]">{agent.power}</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-[#1e2530] rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getPowerColor(agent.power)} transition-all duration-1000 ease-out`}
            style={{ width: `${agent.power}%` }}
          />
        </div>
      </div>

      {/* Badge section */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {/* Category badge */}
        <span className="px-3 py-1 bg-[#1e2530] text-[#8b949e] text-xs font-medium rounded-full">
          {getCategoryIcon(agent.category)} {agent.category.toUpperCase()}
        </span>
        {/* MBTI badge */}
        {agent.mbti && (
          <span className="px-3 py-1 bg-[#105190] text-white text-xs font-bold rounded-full tracking-wider">
            {agent.mbti}
          </span>
        )}
      </div>

      {/* Price & sales info */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#8b949e]">💰</span>
          <span className="text-[#e6edf3] font-semibold">{agent.price} PNCR</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#8b949e]">📈</span>
          <span className="text-[#8b949e]">
            {agent.salesCount >= 1000
              ? `${(agent.salesCount / 1000).toFixed(1)}K`
              : agent.salesCount}{" "}
            souls sold
          </span>
        </div>
      </div>

      {/* Buy button */}
      <span
        className="block w-full h-12 bg-gradient-to-r from-[#105190] to-[#00d4ff] text-white font-semibold rounded-lg transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(16,81,144,0.4)] active:scale-[0.98] flex items-center justify-center"
      >
        View Soul
      </span>
    </Link>
  );
}
