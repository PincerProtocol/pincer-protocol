import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="wallet-connect">
      {isConnected ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => disconnect()}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => connect({ connector: injected() })}
          className="w-full"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}