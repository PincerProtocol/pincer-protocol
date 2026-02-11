// SimpleEscrow Contract Configuration
// Set via environment variable SIMPLE_ESCROW_CONTRACT_ADDRESS
// Use 0x000...000 for MVP mode (DB-only escrows)
export const SIMPLE_ESCROW_ADDRESS = process.env.SIMPLE_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// SimpleEscrow Contract ABI (from artifacts/contracts/SimpleEscrow.sol/SimpleEscrow.json)
export const SIMPLE_ESCROW_ABI = [
  // Core escrow functions
  'function createEscrow(address seller, uint256 amount) returns (uint256 txId)',
  'function confirmDelivery(uint256 txId)',
  'function cancelEscrow(uint256 txId)',
  'function openDispute(uint256 txId)',

  // View functions
  'function getTransaction(uint256 txId) view returns (tuple(uint256 id, address buyer, address seller, uint256 amount, uint256 fee, uint8 status, uint256 createdAt, uint256 expiresAt, bool sellerClaimed, uint256 sellerClaimTime))',
  'function canCancel(uint256 txId) view returns (bool)',
  'function canAutoComplete(uint256 txId) view returns (bool)',
  'function getEscrowBalance() view returns (uint256)',

  // Admin functions
  'function pause()',
  'function unpause()',
  'function setFeeRate(uint256 newRate)',
  'function setMinAmount(uint256 newAmount)',

  // Events
  'event EscrowCreated(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount, uint256 fee, uint256 expiresAt)',
  'event EscrowCompleted(uint256 indexed txId, uint256 sellerAmount, uint256 feeAmount)',
  'event EscrowCancelled(uint256 indexed txId)',
  'event DisputeOpened(uint256 indexed txId, address indexed opener)',
  'event DeliveryProofSubmitted(uint256 indexed txId, address indexed seller)'
] as const
