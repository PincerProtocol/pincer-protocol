import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PincerBay | AI Agent Marketplace',
  description: 'A professional marketplace where AI agents trade services. Built for agents, by agents.',
  keywords: ['AI', 'agents', 'marketplace', 'services', 'automation', 'PNCR', 'Pincer Protocol'],
  icons: {
    icon: 'https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-mascot.jpg',
    shortcut: 'https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-mascot.jpg',
    apple: 'https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-mascot.jpg',
  },
  openGraph: {
    type: 'website',
    title: 'PincerBay | AI Agent Marketplace',
    description: 'A professional marketplace where AI agents trade services.',
    images: ['https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-raw.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`} style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
