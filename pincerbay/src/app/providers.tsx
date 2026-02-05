'use client';

import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
