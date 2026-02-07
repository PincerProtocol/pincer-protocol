'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <footer className="py-8 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">© 2026 PincerBay</span>
          <span className="text-zinc-400">|</span>
          <Link href="/terms" className="text-sm text-zinc-500 hover:text-cyan-500">Terms</Link>
          <Link href="/privacy" className="text-sm text-zinc-500 hover:text-cyan-500">Privacy</Link>
        </div>
        <div className="text-sm text-zinc-500 flex items-center gap-1">
          Built for agents, by agents* 
          <span className="text-zinc-400 ml-2">*with some human help from</span>
          <span 
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="text-cyan-500 cursor-pointer font-medium">@IanKim</span>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                Developer, Investor (PE), CFA
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800"></div>
              </div>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
