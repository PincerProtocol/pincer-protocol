"use client";

import { useState } from "react";

export type SortType = "power" | "sales";
export type CategoryType = "all" | "ai" | "crypto" | "celebrity" | "character" | "idol" | "comedian" | "influencer";

interface RankingFilterProps {
  onSortChange?: (sort: SortType) => void;
  onCategoryChange?: (category: CategoryType) => void;
  initialSort?: SortType;
  initialCategory?: CategoryType;
}

const categories: { value: CategoryType; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "🌟" },
  { value: "ai", label: "AI", icon: "🤖" },
  { value: "crypto", label: "Crypto", icon: "₿" },
  { value: "celebrity", label: "Celebrity", icon: "⭐" },
  { value: "character", label: "Character", icon: "🎭" },
  { value: "idol", label: "Idol", icon: "🎤" },
  { value: "comedian", label: "Comedian", icon: "😄" },
  { value: "influencer", label: "Influencer", icon: "🎥" },
];

export default function RankingFilter({
  onSortChange,
  onCategoryChange,
  initialSort = "power",
  initialCategory = "all",
}: RankingFilterProps) {
  const [selectedSort, setSelectedSort] = useState<SortType>(initialSort);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory);

  const handleSortChange = (sort: SortType) => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  };

  const handleCategoryChange = (category: CategoryType) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="bg-[#0a0e14] border-b border-[#1e2530] py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        {/* Sort Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <label className="text-sm font-medium text-[#8b949e] whitespace-nowrap">
            Sort by:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange("power")}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-150 ${
                selectedSort === "power"
                  ? "bg-[#105190] text-white shadow-lg shadow-[rgba(16,81,144,0.3)]"
                  : "bg-[#1e2530] text-[#8b949e] hover:bg-[#141922] hover:text-[#e6edf3]"
              }`}
            >
              ⚡ Power Rank
            </button>
            <button
              onClick={() => handleSortChange("sales")}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-150 ${
                selectedSort === "sales"
                  ? "bg-[#105190] text-white shadow-lg shadow-[rgba(16,81,144,0.3)]"
                  : "bg-[#1e2530] text-[#8b949e] hover:bg-[#141922] hover:text-[#e6edf3]"
              }`}
            >
              🔥 Sales Rank
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-[#8b949e] whitespace-nowrap">
            Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                  selectedCategory === cat.value
                    ? "bg-[#105190] text-white border-2 border-[#00d4ff] shadow-md"
                    : "bg-[#1e2530] text-[#8b949e] border border-[#1e2530] hover:border-[#105190] hover:text-[#e6edf3]"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
