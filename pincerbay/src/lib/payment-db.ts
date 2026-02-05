/**
 * Payment Database
 * In-memory storage for deposit events and processing status
 * TODO: Replace with real database (PostgreSQL/MongoDB) in production
 */

import { DepositEvent } from './blockchain-monitor';

// In-memory storage
export const depositsDB = new Map<string, DepositEvent>();

// Last processed block number per network
export const lastProcessedBlockDB = new Map<string, number>();

/**
 * Get last processed block
 */
export function getLastProcessedBlock(network: string = 'mainnet'): number {
  return lastProcessedBlockDB.get(network) || 0;
}

/**
 * Update last processed block
 */
export function setLastProcessedBlock(blockNumber: number, network: string = 'mainnet'): void {
  lastProcessedBlockDB.set(network, blockNumber);
}

/**
 * Save deposit event
 */
export function saveDeposit(deposit: DepositEvent): void {
  depositsDB.set(deposit.id, deposit);
}

/**
 * Get deposit by ID
 */
export function getDeposit(id: string): DepositEvent | undefined {
  return depositsDB.get(id);
}

/**
 * Get all unprocessed deposits
 */
export function getUnprocessedDeposits(): DepositEvent[] {
  return Array.from(depositsDB.values()).filter(d => !d.processed);
}

/**
 * Mark deposit as processed
 */
export function markDepositProcessed(
  id: string,
  pncrAmount: string,
  pncrTxHash: string
): void {
  const deposit = depositsDB.get(id);
  if (deposit) {
    deposit.processed = true;
    deposit.pncrAmount = pncrAmount;
    deposit.pncrTxHash = pncrTxHash;
    depositsDB.set(id, deposit);
  }
}

/**
 * Get all deposits (for admin view)
 */
export function getAllDeposits(): DepositEvent[] {
  return Array.from(depositsDB.values()).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get deposits by address
 */
export function getDepositsByAddress(address: string): DepositEvent[] {
  return Array.from(depositsDB.values())
    .filter(d => d.from.toLowerCase() === address.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get total processed deposits count
 */
export function getProcessedCount(): number {
  return Array.from(depositsDB.values()).filter(d => d.processed).length;
}

/**
 * Get total unprocessed deposits count
 */
export function getUnprocessedCount(): number {
  return Array.from(depositsDB.values()).filter(d => !d.processed).length;
}

/**
 * Get total volume in USD
 */
export function getTotalVolumeUSD(): number {
  return Array.from(depositsDB.values()).reduce((sum, d) => sum + d.amountUSD, 0);
}

/**
 * Initialize database with default values
 */
export function initializeDB(network: string = 'mainnet', startBlock?: number): void {
  if (startBlock !== undefined) {
    setLastProcessedBlock(startBlock, network);
  }
}

// Development: Initialize with a reasonable starting block
if (process.env.NODE_ENV === 'development') {
  // Sepolia testnet - start from recent block
  initializeDB('sepolia', 7000000);
} else {
  // Mainnet - set via env var or start from current
  const startBlock = process.env.MONITOR_START_BLOCK 
    ? parseInt(process.env.MONITOR_START_BLOCK) 
    : undefined;
  initializeDB('mainnet', startBlock);
}
