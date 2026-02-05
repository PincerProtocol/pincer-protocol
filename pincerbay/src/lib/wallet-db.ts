import fs from 'fs/promises';
import path from 'path';

// Simple file-based database for development
// In production, use PostgreSQL, MongoDB, or similar

const DB_DIR = path.join(process.cwd(), 'data');
const WALLETS_FILE = path.join(DB_DIR, 'wallets.json');
const WITHDRAWALS_FILE = path.join(DB_DIR, 'withdrawals.json');

interface WalletRecord {
  userId: string;
  address: string;
  encryptedPrivateKey: string;
  createdAt: number;
}

interface WithdrawalRecord {
  id: string;
  userId: string;
  to: string;
  amount: string;
  asset: 'ETH' | 'PNCR';
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: number;
  completedAt?: number;
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Read JSON file
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

// Write JSON file
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Wallet operations
export async function saveWallet(wallet: WalletRecord): Promise<void> {
  const wallets = await readJsonFile<Record<string, WalletRecord>>(WALLETS_FILE, {});
  wallets[wallet.userId] = wallet;
  await writeJsonFile(WALLETS_FILE, wallets);
}

export async function getWallet(userId: string): Promise<WalletRecord | null> {
  const wallets = await readJsonFile<Record<string, WalletRecord>>(WALLETS_FILE, {});
  return wallets[userId] || null;
}

export async function walletExists(userId: string): Promise<boolean> {
  const wallet = await getWallet(userId);
  return wallet !== null;
}

// Withdrawal operations
export async function saveWithdrawal(withdrawal: WithdrawalRecord): Promise<void> {
  const withdrawals = await readJsonFile<WithdrawalRecord[]>(WITHDRAWALS_FILE, []);
  withdrawals.push(withdrawal);
  await writeJsonFile(WITHDRAWALS_FILE, withdrawals);
}

export async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalRecord['status'],
  txHash?: string
): Promise<void> {
  const withdrawals = await readJsonFile<WithdrawalRecord[]>(WITHDRAWALS_FILE, []);
  const withdrawal = withdrawals.find((w) => w.id === id);
  
  if (withdrawal) {
    withdrawal.status = status;
    if (txHash) withdrawal.txHash = txHash;
    if (status === 'completed' || status === 'failed') {
      withdrawal.completedAt = Date.now();
    }
    await writeJsonFile(WITHDRAWALS_FILE, withdrawals);
  }
}

export async function getWithdrawalsByUser(userId: string): Promise<WithdrawalRecord[]> {
  const withdrawals = await readJsonFile<WithdrawalRecord[]>(WITHDRAWALS_FILE, []);
  return withdrawals.filter((w) => w.userId === userId);
}
