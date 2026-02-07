'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="wallet-connect">
      {isConnected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button 
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors"
        >
          🔗 Connect Wallet
        </button>
      )}
    </div>
  );
}
