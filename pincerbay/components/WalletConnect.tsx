import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { Button } from '@/components/ui/button';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });
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
          onClick={() => connect()}
          className="w-full"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}