import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia], // Base Mainnet first
  connectors: [
    injected() // MetaMask, Coinbase Wallet, etc.
    // walletConnect - to be added later
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  }
})
