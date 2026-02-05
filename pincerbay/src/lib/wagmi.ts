'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, mainnet } from 'wagmi/chains';

// Custom Tron chain (for future)
// const tron = {
//   id: 728126428,
//   name: 'Tron',
//   nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
//   rpcUrls: {
//     default: { http: ['https://api.trongrid.io'] },
//   },
// };

export const config = getDefaultConfig({
  appName: 'PincerBay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [base, baseSepolia, mainnet],
  ssr: true,
});

// Contract addresses
export const CONTRACTS = {
  PNCR_TOKEN: '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c',
  ESCROW: '0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7',
  STAKING: '0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79',
  REPUTATION: '0xeF825139C3B17265E867864627f85720Ab6dB9e0',
  AGENT_WALLET: '0x62905288110a94875Ed946EB9Fd79AfAbe893D62',
  TREASURY: '0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb', // Gnosis Safe
};

// Accepted payment tokens on Base
export const PAYMENT_TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: null, // Native
    icon: '⟠',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    icon: '◈',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Base USDT
    icon: '₮',
  },
};

// PNCR exchange rate (will be dynamic later)
export const PNCR_RATE = {
  USD: 142, // 1 USD = 142 PNCR
};
