import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pincer Protocol | The Economic Layer for AI',
  description: 'Trustless payments for autonomous agents. Secure escrow, instant settlements, AI dispute resolution. Built on Base.',
  keywords: ['AI', 'agents', 'blockchain', 'payments', 'escrow', 'Base', 'Ethereum', 'DeFi', 'Web3', 'autonomous agents'],
  authors: [{ name: 'Pincer Protocol' }],
  creator: 'Pincer Protocol',
  publisher: 'Pincer Protocol',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pincerprotocol.xyz',
    siteName: 'Pincer Protocol',
    title: 'Pincer Protocol | The Economic Layer for AI',
    description: 'Trustless payments for autonomous agents. Secure escrow, instant settlements, AI dispute resolution.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pincer Protocol - The Economic Layer for AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pincer Protocol | The Economic Layer for AI',
    description: 'Trustless payments for autonomous agents. Built on Base.',
    creator: '@pincerprotocol',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
