'use client';

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const PNCR_CONTRACT = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c';

const PNCR_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

export function PNCRBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: PNCR_CONTRACT,
    abi: PNCR_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: isConnected
    }
  });

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  if (isLoading) {
    return <div>Loading balance...</div>;
  }

  // Format balance (assuming 18 decimals)
  const formattedBalance = balance 
    ? formatUnits(balance, 18) 
    : '0';

  return (
    <div className="pncr-balance">
      <h3>PNCR Balance</h3>
      <p>{formattedBalance} PNCR</p>
    </div>
  );
}