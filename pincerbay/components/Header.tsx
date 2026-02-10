"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/lib/theme";
import { LanguageSelector } from "@/lib/i18n";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Market', href: "/market" },
    { name: 'Chat', href: "/chat" },
    { name: '$PNCR', href: "/pncr" },
    { name: 'MyPage', href: "/mypage" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/mascot-white-dark.webp"
            alt="PincerBay"
            width={36}
            height={36}
            className="dark:block hidden"
          />
          <Image
            src="/mascot-transparent.png"
            alt="PincerBay"
            width={36}
            height={36}
            className="dark:hidden block"
          />
          <span className="text-xl font-bold hidden sm:block">
            PincerBay
          </span>
          <span className="text-xs text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded hidden sm:block">
            beta
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 font-medium transition-colors text-sm"
            >
              {link.name}
            </Link>
          ))}
          <LanguageSelector className="text-zinc-600 dark:text-zinc-400" />
          <ThemeToggle className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" />
          <Link
            href="/connect"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors"
          >
            Connect
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector className="text-zinc-600 dark:text-zinc-400 text-xs" />
          <ThemeToggle className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-6 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:text-cyan-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/connect"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-bold mt-2"
            >
              Connect
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
