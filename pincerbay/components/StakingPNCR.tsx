'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import { useToast } from '@/components/Toast';

// Contract addresses
const PNCR_ADDRESS = '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c' as const;
const STAKING_ADDRESS = '0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79' as const;

// ABIs
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

const STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'lockPeriod', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'unstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'claimRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'stakes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'staker', type: 'address' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'lockPeriod', type: 'uint256' }
    ]
  },
  {
    name: 'getRewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'staker', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getTotalStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

// Lock periods in seconds
const LOCK_PERIODS = [
  { label: '30 Days', value: 30 * 24 * 60 * 60, apy: '5%' },
  { label: '90 Days', value: 90 * 24 * 60 * 60, apy: '8%' },
  { label: '180 Days', value: 180 * 24 * 60 * 60, apy: '12%' },
  { label: '365 Days', value: 365 * 24 * 60 * 60, apy: '15%' },
];

export function StakingPNCR() {
  const { address, isConnected, chain } = useAccount();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS[0].value);
  const [isApproving, setIsApproving] = useState(false);

  // Read PNCR balance
  const { data: pncrBalance, refetch: refetchBalance } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PNCR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_ADDRESS] : undefined,
    chainId: base.id,
  });

  // Read stake info
  const { data: stakeInfo, refetch: refetchStake } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getRewards',
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  // Read total staked
  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getTotalStaked',
    chainId: base.id,
  });

  // Write contracts
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refresh data after transaction
  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
      refetchAllowance();
      refetchStake();
      refetchRewards();
      showToast('Transaction confirmed!', 'success');
      setAmount('');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      showToast(error.message.slice(0, 100) || 'Transaction failed', 'error');
    }
  }, [error]);

  const handleApprove = async () => {
    if (!amount) return;
    setIsApproving(true);
    try {
      writeContract({
        address: PNCR_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STAKING_ADDRESS, parseUnits(amount, 18)],
        chainId: base.id,
      });
    } catch (err) {
      showToast('Failed to approve', 'error');
    }
    setIsApproving(false);
  };

  const handleStake = async () => {
    if (!amount) return;
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [parseUnits(amount, 18), BigInt(selectedPeriod)],
      chainId: base.id,
    });
  };

  const handleUnstake = async () => {
    if (!stakeInfo || stakeInfo[0] === BigInt(0)) {
      showToast('No stake to withdraw', 'warning');
      return;
    }
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [stakeInfo[0]],
      chainId: base.id,
    });
  };

  const handleClaimRewards = async () => {
    if (!pendingRewards || pendingRewards === BigInt(0)) {
      showToast('No rewards to claim', 'warning');
      return;
    }
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'claimRewards',
      args: [],
      chainId: base.id,
    });
  };

  // Format values
  const formattedBalance = pncrBalance ? parseFloat(formatUnits(pncrBalance, 18)).toFixed(2) : '0.00';
  const formattedStake = stakeInfo ? parseFloat(formatUnits(stakeInfo[0], 18)).toFixed(2) : '0.00';
  const formattedRewards = pendingRewards ? parseFloat(formatUnits(pendingRewards, 18)).toFixed(4) : '0.0000';
  const formattedTotal = totalStaked ? parseFloat(formatUnits(totalStaked, 18)).toLocaleString() : '0';
  
  const needsApproval = amount && allowance !== undefined && 
    parseUnits(amount || '0', 18) > allowance;

  const isWrongNetwork = chain?.id !== base.id;
  const isProcessing = isPending || isConfirming;

  if (!isConnected) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-500 mb-4">Connect your wallet to stake PNCR</p>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
        <p className="text-orange-500 font-medium mb-2">Wrong Network</p>
        <p className="text-sm text-zinc-500">Please switch to Base Mainnet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Your Balance</p>
          <p className="text-lg font-bold text-cyan-500">{formattedBalance}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Your Stake</p>
          <p className="text-lg font-bold text-purple-500">{formattedStake}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Pending Rewards</p>
          <p className="text-lg font-bold text-green-500">{formattedRewards}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Total Staked</p>
          <p className="text-lg font-bold">{formattedTotal}</p>
        </div>
      </div>

      {/* Stake Form */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="font-bold mb-4">Stake PNCR</h3>
        
        {/* Lock Period Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Lock Period</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LOCK_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <div>{period.label}</div>
                <div className="text-xs opacity-75">{period.apy} APY</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              onClick={() => setAmount(formattedBalance)}
              disabled={isProcessing}
              className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isProcessing || !amount}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '⏳ Processing...' : '🔓 Approve PNCR'}
            </button>
          ) : (
            <button
              onClick={handleStake}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '⏳ Processing...' : '📈 Stake'}
            </button>
          )}
        </div>
      </div>

      {/* Manage Stake */}
      {stakeInfo && stakeInfo[0] > BigInt(0) && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-bold mb-4">Manage Stake</h3>
          <div className="flex gap-3">
            <button
              onClick={handleClaimRewards}
              disabled={isProcessing || !pendingRewards || pendingRewards === BigInt(0)}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '⏳...' : `🎁 Claim ${formattedRewards} PNCR`}
            </button>
            <button
              onClick={handleUnstake}
              disabled={isProcessing}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '⏳...' : '📤 Unstake All'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txHash && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-400">
            {isConfirming ? 'Confirming...' : '✅ Transaction sent!'}
          </p>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-500 hover:underline"
          >
            View on Basescan →
          </a>
        </div>
      )}
    </div>
  );
}
