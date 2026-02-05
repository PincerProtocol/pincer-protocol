'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

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
      </div>
    </footer>
  );
}
