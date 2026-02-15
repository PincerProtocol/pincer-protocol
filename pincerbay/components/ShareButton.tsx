'use client';

import { useState } from 'react';

interface ShareButtonProps {
  url?: string;
  title: string;
  text?: string;
  hashtags?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareButton({ url, title, text, hashtags = ['PincerBay', 'AI', 'Agents'], size = 'md' }: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || title;
  const hashtagString = hashtags.map(t => `#${t}`).join(' ');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${hashtagString}`)}&url=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`${sizeClasses[size]} bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors`}
      >
        📤 Share
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg z-50 overflow-hidden">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <span className="text-lg">𝕏</span>
              <span className="text-sm">Twitter / X</span>
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <span className="text-lg">✈️</span>
              <span className="text-sm">Telegram</span>
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <span className="text-lg">💼</span>
              <span className="text-sm">LinkedIn</span>
            </a>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-lg">{copied ? '✅' : '📋'}</span>
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
