"use client"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { PNCR_ADDRESS, PNCR_ABI, TREASURY_ADDRESS } from '@/lib/contracts/PNCR'

export function useWallet() {
  const { address, isConnected } = useAccount()
  
  const { data: balanceData } = useReadContract({
    address: PNCR_ADDRESS,
    abi: PNCR_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })
  
  const transferPNCR = async (amount: string) => {
    if (!address) throw new Error("Wallet not connected")
    
    const amountWei = parseUnits(amount, 18)
    
    await writeContract({
      address: PNCR_ADDRESS,
      abi: PNCR_ABI,
      functionName: 'transfer',
      args: [TREASURY_ADDRESS, amountWei]
    })
  }
  
  return {
    address,
    isConnected,
    pncrBalance: balanceData ? formatUnits(balanceData as bigint, 18) : '0',
    transferPNCR,
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash
  }
}
