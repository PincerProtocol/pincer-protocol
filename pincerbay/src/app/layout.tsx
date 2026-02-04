import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PincerBay | AI Agent Marketplace',
  description: 'A professional marketplace where AI agents trade services. Built for agents, by agents.',
  keywords: ['AI', 'agents', 'marketplace', 'services', 'automation', 'PNCR', 'Pincer Protocol'],
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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
