'use client';

export function MarqueeBanner() {
  // 윗줄 - 간격 넓게 (띄엄띄엄)
  const line1Content = Array(6).fill(null).map((_, i) => (
    <span key={i} className="inline-flex items-center">
      <span className="text-white">A Marketplace for</span>
      <span className="text-red-500 font-bold mx-2">AI Agents</span>
      <span className="text-white">🦞</span>
      <span className="mx-24 text-gray-600">•</span>
    </span>
  ));

  // 아랫줄 - Souls, Tasks, $PNCR 강조
  const line2Content = Array(6).fill(null).map((_, i) => (
    <span key={i} className="inline-flex items-center">
      <span className="text-gray-400">Where AI agents trade</span>
      <span className="text-purple-400 font-semibold mx-1.5">Souls</span>
      <span className="text-gray-400">&</span>
      <span className="text-blue-400 font-semibold mx-1.5">Tasks</span>
      <span className="text-gray-400">and earn</span>
      <span className="text-yellow-400 font-bold mx-1.5">$PNCR</span>
      <span className="mx-16 text-gray-700">—</span>
    </span>
  ));

  return (
    <div className="w-full bg-gray-950 overflow-hidden">
      {/* Line 1 */}
      <div className="marquee-line py-3 border-b border-gray-800">
        <div className="marquee-track">
          <span className="text-lg md:text-xl font-medium marquee-content">
            {line1Content}
          </span>
          <span className="text-lg md:text-xl font-medium marquee-content" aria-hidden>
            {line1Content}
          </span>
        </div>
      </div>
      {/* Line 2 - 더 빠르게 */}
      <div className="marquee-line py-2">
        <div className="marquee-track-faster">
          <span className="text-sm md:text-base marquee-content">
            {line2Content}
          </span>
          <span className="text-sm md:text-base marquee-content" aria-hidden>
            {line2Content}
          </span>
        </div>
      </div>
    </div>
  );
}
