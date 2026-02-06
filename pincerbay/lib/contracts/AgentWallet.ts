export const AGENT_WALLET_ADDRESS = "0x62905288110a94875Ed946EB9Fd79AfAbe893D62" as const

export const AGENT_WALLET_ABI = [
  // View functions
  "function getWalletId(address owner, string agentId) view returns (bytes32)",
  "function wallets(bytes32 walletId) view returns (address owner, string agentId, uint256 balance, uint256 dailyLimit, uint256 spentToday, uint256 lastResetTime, bool whitelistEnabled, bool active, uint256 totalSpent, uint256 transactionCount)",
  "function getWallet(bytes32 walletId) view returns (tuple(address owner, string agentId, uint256 balance, uint256 dailyLimit, uint256 spentToday, uint256 lastResetTime, bool whitelistEnabled, bool active, uint256 totalSpent, uint256 transactionCount))",
  "function getWalletsByOwner(address owner) view returns (bytes32[])",
  "function isApprovedRecipient(bytes32 walletId, address recipient) view returns (bool)",
  "function isOperator(bytes32 walletId, address operator) view returns (bool)",
  "function tokenContract() view returns (address)",
  
  // State-changing functions
  "function createWallet(string agentId, uint256 dailyLimit, bool whitelistEnabled) returns (bytes32)",
  "function deposit(bytes32 walletId, uint256 amount)",
  "function agentTransfer(bytes32 walletId, address to, uint256 amount, string memo)",
  "function ownerWithdraw(bytes32 walletId, uint256 amount)",
  "function setDailyLimit(bytes32 walletId, uint256 newLimit)",
  "function addApprovedRecipient(bytes32 walletId, address recipient)",
  "function removeApprovedRecipient(bytes32 walletId, address recipient)",
  "function addOperator(bytes32 walletId, address operator)",
  "function removeOperator(bytes32 walletId, address operator)",
  "function setWhitelistEnabled(bytes32 walletId, bool enabled)",
  "function deactivateWallet(bytes32 walletId)",
  
  // Events
  "event WalletCreated(bytes32 indexed walletId, address indexed owner, string agentId)",
  "event Deposited(bytes32 indexed walletId, uint256 amount)",
  "event AgentTransfer(bytes32 indexed walletId, address indexed to, uint256 amount, string memo)",
  "event OwnerWithdraw(bytes32 indexed walletId, uint256 amount)",
  "event DailyLimitUpdated(bytes32 indexed walletId, uint256 newLimit)",
  "event RecipientApproved(bytes32 indexed walletId, address indexed recipient)",
  "event RecipientRemoved(bytes32 indexed walletId, address indexed recipient)",
  "event OperatorAdded(bytes32 indexed walletId, address indexed operator)",
  "event OperatorRemoved(bytes32 indexed walletId, address indexed operator)",
  "event WhitelistToggled(bytes32 indexed walletId, bool enabled)",
  "event WalletDeactivated(bytes32 indexed walletId)"
] as const
