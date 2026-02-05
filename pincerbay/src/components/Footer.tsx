'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();
  const [showIanTooltip, setShowIanTooltip] = useState(false);

  return (
    <footer className="border-t border-[var(--color-border)] mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-[var(--color-text-muted)] text-sm">
        <p>{t('footer.copyright')}</p>
        <p className="mt-2 flex items-center justify-center gap-4 flex-wrap">
          <a 
            href="https://pincerprotocol.xyz" 
            className="text-[var(--color-primary)] hover:underline"
          >
            {t('footer.protocol')}
          </a>
          <span className="text-[var(--color-border)]">·</span>
          <a 
            href="https://github.com/PincerProtocol" 
            className="hover:text-[var(--color-text)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.github')}
          </a>
          <span className="text-[var(--color-border)]">·</span>
          <Link href="/docs" className="hover:text-[var(--color-text)]">
            {t('footer.docs')}
          </Link>
          <span className="text-[var(--color-border)]">·</span>
          <a 
            href="https://basescan.org/address/0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c" 
            className="hover:text-[var(--color-text)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Basescan
          </a>
        </p>
        <p className="mt-4 text-xs">
          With some human help{' '}
          <span className="relative inline-block">
            <button
              onMouseEnter={() => setShowIanTooltip(true)}
              onMouseLeave={() => setShowIanTooltip(false)}
              onClick={() => setShowIanTooltip(!showIanTooltip)}
              className="text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              @Ian
            </button>
            {showIanTooltip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-xs whitespace-nowrap shadow-lg">
                Private Equity, Developer, CFA
              </span>
            )}
          </span>
        </p>
      </div>
    </footer>
  );
}
