import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, base], // Sepolia 우선 (테스트용)
  connectors: [
    injected() // MetaMask, Coinbase Wallet 등
    // walletConnect - 나중에 추가
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  }
})
