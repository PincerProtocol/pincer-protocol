"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/lib/theme";
import { useI18n, LanguageSelector } from "@/lib/i18n";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { name: t('nav.souls'), href: "/#souls" },
    { name: t('nav.rankings'), href: "/rankings" },
    { name: t('nav.tasks'), href: "/tasks" },
    { name: t('nav.docs'), href: "/docs" },
    { name: 'MyPage', href: "/mypage" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/mascot-white-dark.webp"
            alt="PincerBay"
            width={36}
            height={36}
          />
          <span className="text-xl font-bold text-white hidden sm:block">
            PincerBay
          </span>
          <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded hidden sm:block">
            beta
          </span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-zinc-400 hover:text-cyan-400 font-medium transition-colors text-sm"
            >
              {link.name}
            </Link>
          ))}
          <LanguageSelector />
          <ThemeToggle className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" />
          <Link
            href="/connect"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors"
          >
            {t('nav.connect')}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
          <ThemeToggle className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-zinc-800 py-6 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Mobile Search */}
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:border-cyan-500"
          />
          
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-semibold text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/connect"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold mt-2"
            >
              {t('nav.connect')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
