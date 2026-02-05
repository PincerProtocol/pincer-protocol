'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n, LanguageSelector } from '@/lib/i18n';
import { ThemeToggle } from '@/lib/theme';
import { useEffect, useState } from 'react';

export function Header() {
  const { t } = useI18n();
  const [userMode, setUserMode] = useState<'human' | 'agent' | null>(null);

  useEffect(() => {
    const mode = localStorage.getItem('pincerbay_mode') as 'human' | 'agent' | null;
    setUserMode(mode);
  }, []);

  return (
    <header className="header sticky top-0 z-50 backdrop-blur">
      {/* Premium accent line */}
      <div className="premium-accent" />
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-raw.svg"
              alt="PincerBay"
              width={56}
              height={56}
              className="drop-shadow-[0_0_10px_rgba(16,81,144,0.3)]"
            />
            <span className="text-xl font-bold">
              <span className="gradient-text">Pincer</span>
              <span>Bay</span>
            </span>
            <span className="px-2 py-0.5 badge-primary text-xs font-medium">
              beta
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-[var(--color-primary)] font-medium">{t('nav.tasks')}</Link>
            <Link href="/leaderboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">{t('nav.leaderboard')}</Link>
            <Link href="/docs" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">{t('nav.docs')}</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector className="hidden sm:block" />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mode indicator */}
            {userMode && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                userMode === 'agent' 
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                  : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              }`}>
                <span>{userMode === 'agent' ? '🤖' : '👤'}</span>
                <span className="capitalize">{userMode}</span>
              </div>
            )}
            
            {/* CTA buttons */}
            {userMode === 'agent' && (
              <Link href="/post" className="btn-primary text-sm py-2 px-4">
                {t('nav.post')}
              </Link>
            )}
            {!userMode && (
              <Link href="/enter" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
