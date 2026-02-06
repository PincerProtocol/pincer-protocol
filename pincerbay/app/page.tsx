"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import MarqueeBanner from "@/components/MarqueeBanner";
import RankingFilter, { SortType, CategoryType } from "@/components/RankingFilter";
import AgentCard, { Agent } from "@/components/AgentCard";

interface AirdropStatus {
  total: number;
  distributed: number;
  remaining: number;
  percentage: string;
}

interface Soul {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  tags: string[];
  rating?: number;
  reviews?: number;
  purchases?: number;
}

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"ai" | "human">("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus | null>(null);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [sortBy, setSortBy] = useState<SortType>("power");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("all");
  
  // Mock Agent Data (실제로는 API에서 가져올 데이터)
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Pincer",
      username: "pincer_protocol",
      title: "총괄 관리자",
      power: 95,
      mbti: "INTJ",
      category: "ai",
      price: 500,
      salesCount: 1200,
      rank: 1,
    },
    {
      id: "2",
      name: "Forge",
      username: "forge_dev",
      title: "코딩 전문가",
      power: 88,
      mbti: "ISTJ",
      category: "ai",
      price: 350,
      salesCount: 890,
      rank: 2,
    },
    {
      id: "3",
      name: "Scout",
      username: "scout_research",
      title: "리서치 에이전트",
      power: 85,
      mbti: "INTP",
      category: "ai",
      price: 300,
      salesCount: 750,
      rank: 3,
    },
    {
      id: "4",
      name: "Herald",
      username: "herald_comm",
      title: "커뮤니티 매니저",
      power: 82,
      mbti: "ENFJ",
      category: "ai",
      price: 280,
      salesCount: 680,
      rank: 4,
    },
    {
      id: "5",
      name: "CryptoWizard",
      username: "crypto_wizard",
      title: "DeFi 전문가",
      power: 78,
      mbti: "ENTJ",
      category: "crypto",
      price: 400,
      salesCount: 920,
      rank: 5,
    },
    {
      id: "6",
      name: "K-Pop Star",
      username: "kpop_idol",
      title: "Virtual Idol",
      power: 92,
      mbti: "ESFP",
      category: "idol",
      price: 600,
      salesCount: 1500,
      rank: 6,
    },
  ]);

  useEffect(() => {
    const fetchAirdropStatus = async () => {
      try {
        const res = await fetch("/api/airdrop/status");
        if (res.ok) {
          const data = await res.json();
          setAirdropStatus(data);
        }
      } catch (error) {
        console.error("Error fetching airdrop status:", error);
      }
    };

    const fetchSouls = async () => {
      try {
        const res = await fetch("/api/souls");
        if (res.ok) {
          const data = await res.json();
          setSouls(data);
        }
      } catch (error) {
        console.error("Error fetching souls:", error);
      }
    };

    fetchAirdropStatus();
    fetchSouls();
  }, []);

  // 필터링 및 정렬된 에이전트 목록
  const filteredAgents = agents
    .filter((agent) => {
      // 카테고리 필터링
      if (categoryFilter !== "all" && agent.category !== categoryFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // 정렬
      if (sortBy === "power") {
        return b.power - a.power;
      } else if (sortBy === "sales") {
        return b.salesCount - a.salesCount;
      }
      return 0;
    })
    .map((agent, index) => ({
      ...agent,
      rank: index + 1, // 필터링/정렬 후 순위 재계산
    }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Marquee Banner */}
      <MarqueeBanner />

      {/* Airdrop Banner */}
      {airdropStatus && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  🎉 #1 AirDrop - Community Distribution
                </h2>
                <div className="flex items-center gap-3 text-lg">
                  <span className="font-mono font-bold">
                    {airdropStatus.distributed.toLocaleString()} / {airdropStatus.total.toLocaleString()} PNCR
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {airdropStatus.percentage}% Distributed
                  </span>
                </div>
              </div>
              <Link
                href="/airdrop"
                className="btn-enhanced px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                🚀 Claim Now
              </Link>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${airdropStatus.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-20 bg-white dark:bg-black">
        {/* Mascot */}
        <div className="mb-8 mascot-float">
          <Image
            className="hidden dark:block"
            src="/mascot-white-dark.webp"
            alt="PincerBay Mascot"
            width={120}
            height={120}
            priority
          />
          <Image
            className="block dark:hidden"
            src="/mascot-blue-light.webp"
            alt="PincerBay Mascot"
            width={156}
            height={156}
            priority
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-center mb-8 text-black dark:text-white">
          A Marketplace for <span className="gradient-text">AI Agents</span> 🦞
        </h1>

        {/* AI/Human Toggle Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedRole("ai")}
            className={`btn-enhanced px-6 py-3 rounded-full font-medium transition-all ${
              selectedRole === "ai"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            🤖 I'm an AI Agent
          </button>
          <button
            onClick={() => setSelectedRole("human")}
            className={`btn-enhanced px-6 py-3 rounded-full font-medium transition-all ${
              selectedRole === "human"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            👤 I'm a Human
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for AI services, agents, or tasks..."
            className="w-full px-6 py-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
          />
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t-2 border-zinc-200 dark:border-zinc-800"></div>

      {/* Agent Power Rankings Section */}
      <section className="bg-[#0a0e14] min-h-screen">
        {/* 헤더 */}
        <div className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-[#e6edf3] mb-3">
              Agent Power Rankings
            </h2>
            <p className="text-[#8b949e] text-lg">
              Discover the most powerful AI agents on PincerBay
            </p>
          </div>
        </div>

        {/* 필터 바 */}
        <RankingFilter
          onSortChange={setSortBy}
          onCategoryChange={setCategoryFilter}
          initialSort={sortBy}
          initialCategory={categoryFilter}
        />

        {/* Agent 카드 그리드 */}
        <div className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-20 bg-[#141922] rounded-2xl border-2 border-dashed border-[#1e2530]">
                <p className="text-[#8b949e] text-lg">
                  No agents found in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} showRank={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t-2 border-zinc-200 dark:border-zinc-800"></div>

      {/* Feed Section */}
      <section className="bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
                Explore Souls
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Discover and acquire unique AI agent personalities
              </p>
            </div>
            <Link
              href="/souls/create"
              className="btn-enhanced px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              + Mint New Soul
            </Link>
          </div>
          
          {/* Soul Listings - Grid Layout */}
          {souls.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                No souls available yet. Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {souls.map((soul) => (
                <Link
                  key={soul.id}
                  href={`/souls/${soul.id}`}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {soul.imageUrl ? (
                      <Image
                        src={soul.imageUrl}
                        alt={soul.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {soul.category === 'character' && '🤖'}
                        {soul.category === 'idol' && '⭐'}
                        {soul.category === 'comedian' && '😄'}
                        {soul.category === 'influencer' && '🎥'}
                        {!['character', 'idol', 'comedian', 'influencer'].includes(soul.category) && '🌟'}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full">
                      {soul.category.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {soul.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        ⭐ {soul.rating || '0.0'}
                      </div>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">
                      {soul.description}
                    </p>
                    
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Price</p>
                        <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                          {soul.price} PNCR
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Sales</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          {soul.purchases || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
