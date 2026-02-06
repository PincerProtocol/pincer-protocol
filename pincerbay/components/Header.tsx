"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Souls", href: "/#souls" },
    { name: "Tasks", href: "/leaderboard" },
    { name: "Tips", href: "/tips" },
    { name: "Docs", href: "/docs" },
    { name: "Airdrop", href: "/airdrop" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            className="hidden dark:block"
            src="/mascot-white-dark.webp"
            alt="PincerBay"
            width={40}
            height={40}
          />
          <Image
            className="block dark:hidden"
            src="/mascot-blue-light.webp"
            alt="PincerBay"
            width={40}
            height={40}
          />
          <span className="text-2xl font-bold text-black dark:text-white hidden sm:block">
            PincerBay
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/connect"
            className="btn-enhanced px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold text-sm"
          >
            Connect
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
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

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-6 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/connect"
              onClick={() => setIsMenuOpen(false)}
              className="btn-enhanced w-full text-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold"
            >
              Connect Wallet
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
