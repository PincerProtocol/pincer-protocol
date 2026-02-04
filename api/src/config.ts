import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
  // v2.0 contracts (175B supply, security enhanced)
  pncrTokenAddress: process.env.PNCR_TOKEN_ADDRESS || '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
  escrowAddress: process.env.ESCROW_ADDRESS || '0xE33FCd5AB5E739a0E051E543607374c6B58bCe35',
  stakingAddress: process.env.STAKING_ADDRESS || '0x8e28b009Bf4b517cA91089D179df1f6cE1ED8F6D',
  reputationAddress: process.env.REPUTATION_ADDRESS || '0x56771E7556d9A772D1De5F78861B2Da2A252adf8',
  privateKey: process.env.PRIVATE_KEY || '',
};

// Contract ABIs (matching actual deployed contracts)
export const PNCR_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export const ESCROW_ABI = [
  // Core functions
  'function createEscrow(address seller, uint256 amount) returns (uint256)',
  'function confirmDelivery(uint256 txId)',
  'function cancelEscrow(uint256 txId)',
  
  // Seller protection functions
  'function submitDeliveryProof(uint256 txId)',
  'function autoComplete(uint256 txId)',
  'function openDispute(uint256 txId)',
  
  // View functions
  'function getTransaction(uint256 txId) view returns (tuple(uint256 id, address buyer, address seller, uint256 amount, uint256 fee, uint8 status, uint256 createdAt, uint256 expiresAt, bool sellerClaimed, uint256 sellerClaimTime))',
  'function canAutoComplete(uint256 txId) view returns (bool)',
  'function canCancel(uint256 txId) view returns (bool)',
  'function transactionCount() view returns (uint256)',
  'function feeRate() view returns (uint256)',
  'function minAmount() view returns (uint256)',
  'function DEFAULT_ESCROW_DURATION() view returns (uint256)',
  'function SELLER_CLAIM_WINDOW() view returns (uint256)',
  'function paused() view returns (bool)',
  
  // Events
  'event EscrowCreated(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount, uint256 fee, uint256 expiresAt)',
  'event EscrowCompleted(uint256 indexed txId, uint256 sellerAmount, uint256 feeAmount)',
  'event EscrowCancelled(uint256 indexed txId)',
  'event DeliveryProofSubmitted(uint256 indexed txId, address indexed seller)',
  'event DisputeOpened(uint256 indexed txId, address indexed opener)',
];

export enum EscrowStatus {
  PENDING = 0,
  COMPLETED = 1,
  CANCELLED = 2,
  DISPUTED = 3,
}
