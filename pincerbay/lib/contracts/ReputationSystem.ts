// TODO: Replace with actual deployed contract address and ABI
export const REPUTATION_SYSTEM_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export const REPUTATION_SYSTEM_ABI = [
  // View functions
  'function getReputation(address account) view returns (int256)',
  'function reputations(address account) view returns (int256)',
  'function getReputationHistory(address account) view returns (tuple(uint256 timestamp, int256 change, string reason)[])',
  'function getTopReputable(uint256 limit) view returns (address[])',
  'function isBanned(address account) view returns (bool)',
  'function getBanReason(address account) view returns (string)',

  // State-changing functions
  'function updateReputation(address account, int256 change, string reason)',
  'function banAccount(address account, string reason)',
  'function unbanAccount(address account)',
  'function setReputation(address account, int256 newScore, string reason)',

  // Events
  'event ReputationUpdated(address indexed account, int256 change, string reason, int256 newScore)',
  'event AccountBanned(address indexed account, string reason)',
  'event AccountUnbanned(address indexed account)',
  'event ReputationSet(address indexed account, int256 newScore, string reason)'
] as const
