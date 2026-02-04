// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentWallet
 * @dev Enables AI agents to have autonomous economic capabilities with controlled permissions
 * 
 * Key Features:
 * - Individual wallets for each AI agent
 * - Owner-controlled spending limits
 * - Whitelist-based recipient approval
 * - Operator system for agent-initiated transactions
 * - Daily spending limits with auto-reset
 * 
 * "Giving AI agents economic sovereignty, one wallet at a time" 🦞
 */
contract AgentWallet is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable pncrToken;
    
    struct Wallet {
        address owner;              // Human owner of this agent wallet
        string agentId;             // Agent identifier (e.g., "pincer", "forge")
        uint256 balance;            // Current PNCR balance
        uint256 dailyLimit;         // Maximum daily spending
        uint256 spentToday;         // Amount spent today
        uint256 lastResetDay;       // Last day spending was reset
        bool whitelistEnabled;      // If true, only approved recipients allowed
        bool active;                // Wallet status
        uint256 createdAt;          // Creation timestamp
        uint256 totalSpent;         // Lifetime spending
        uint256 transactionCount;   // Total number of transactions
    }
    
    // walletId => Wallet
    mapping(bytes32 => Wallet) public wallets;
    
    // walletId => recipient => approved
    mapping(bytes32 => mapping(address => bool)) public approvedRecipients;
    
    // walletId => list of approved recipients
    mapping(bytes32 => address[]) private _recipientList;
    
    // walletId => operator => approved (operators can execute transfers on behalf of agent)
    mapping(bytes32 => mapping(address => bool)) public operators;
    
    // walletId => list of operators
    mapping(bytes32 => address[]) private _operatorList;
    
    // owner => list of their wallet IDs
    mapping(address => bytes32[]) public ownerWallets;
    
    // Transaction log for audit trail
    struct Transaction {
        bytes32 walletId;
        address to;
        uint256 amount;
        string memo;
        uint256 timestamp;
        address initiatedBy;
    }
    
    // walletId => transactions
    mapping(bytes32 => Transaction[]) public transactionHistory;
    
    // Protocol fee (in basis points, e.g., 50 = 0.5%)
    uint256 public protocolFee = 50; // 0.5%
    uint256 public constant MAX_FEE = 500; // 5% max
    address public feeRecipient;
    
    // Events
    event WalletCreated(bytes32 indexed walletId, address indexed owner, string agentId, uint256 dailyLimit);
    event Deposited(bytes32 indexed walletId, address indexed from, uint256 amount);
    event Withdrawn(bytes32 indexed walletId, address indexed to, uint256 amount);
    event AgentTransfer(bytes32 indexed walletId, address indexed to, uint256 amount, uint256 fee, string memo, address initiatedBy);
    event LimitUpdated(bytes32 indexed walletId, uint256 oldLimit, uint256 newLimit);
    event RecipientApproved(bytes32 indexed walletId, address indexed recipient);
    event RecipientRemoved(bytes32 indexed walletId, address indexed recipient);
    event OperatorUpdated(bytes32 indexed walletId, address indexed operator, bool approved);
    event WhitelistModeChanged(bytes32 indexed walletId, bool enabled);
    event WalletDeactivated(bytes32 indexed walletId);
    event WalletReactivated(bytes32 indexed walletId);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event EmergencyWithdraw(bytes32 indexed walletId, uint256 amount);
    
    // Errors
    error WalletAlreadyExists();
    error WalletNotActive();
    error NotOwner();
    error NotAuthorized();
    error InsufficientBalance();
    error DailyLimitExceeded();
    error RecipientNotApproved();
    error InvalidAmount();
    error AlreadyApproved();
    error InvalidFee();
    
    constructor(address _pncrToken, address _feeRecipient) Ownable(msg.sender) {
        pncrToken = IERC20(_pncrToken);
        feeRecipient = _feeRecipient;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Generate unique wallet ID from owner address and agent ID
     */
    function getWalletId(address owner, string memory agentId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, agentId));
    }
    
    /**
     * @dev Get comprehensive wallet information
     */
    function getWalletInfo(bytes32 walletId) external view returns (
        address owner,
        string memory agentId,
        uint256 balance,
        uint256 dailyLimit,
        uint256 spentToday,
        uint256 remainingToday,
        bool whitelistEnabled,
        bool active,
        uint256 totalSpent,
        uint256 transactionCount
    ) {
        Wallet storage wallet = wallets[walletId];
        uint256 today = block.timestamp / 1 days;
        uint256 spent = (today > wallet.lastResetDay) ? 0 : wallet.spentToday;
        uint256 remaining = wallet.dailyLimit > spent ? wallet.dailyLimit - spent : 0;
        
        return (
            wallet.owner,
            wallet.agentId,
            wallet.balance,
            wallet.dailyLimit,
            spent,
            remaining,
            wallet.whitelistEnabled,
            wallet.active,
            wallet.totalSpent,
            wallet.transactionCount
        );
    }
    
    /**
     * @dev Get list of approved recipients for a wallet
     */
    function getApprovedRecipients(bytes32 walletId) external view returns (address[] memory) {
        return _recipientList[walletId];
    }
    
    /**
     * @dev Get list of operators for a wallet
     */
    function getOperators(bytes32 walletId) external view returns (address[] memory) {
        return _operatorList[walletId];
    }
    
    /**
     * @dev Get all wallets owned by an address
     */
    function getWalletsByOwner(address owner) external view returns (bytes32[] memory) {
        return ownerWallets[owner];
    }
    
    /**
     * @dev Get transaction history for a wallet
     */
    function getTransactionHistory(bytes32 walletId, uint256 offset, uint256 limit) 
        external view returns (Transaction[] memory) 
    {
        Transaction[] storage history = transactionHistory[walletId];
        uint256 total = history.length;
        
        if (offset >= total) {
            return new Transaction[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        Transaction[] memory result = new Transaction[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = history[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if an address can spend from a wallet
     */
    function canSpend(bytes32 walletId, address spender) external view returns (bool) {
        Wallet storage wallet = wallets[walletId];
        return wallet.active && (spender == wallet.owner || operators[walletId][spender]);
    }
    
    /**
     * @dev Check remaining daily allowance
     */
    function getRemainingAllowance(bytes32 walletId) external view returns (uint256) {
        Wallet storage wallet = wallets[walletId];
        uint256 today = block.timestamp / 1 days;
        uint256 spent = (today > wallet.lastResetDay) ? 0 : wallet.spentToday;
        return wallet.dailyLimit > spent ? wallet.dailyLimit - spent : 0;
    }
    
    // ============ WALLET MANAGEMENT ============
    
    /**
     * @dev Create a new agent wallet
     * @param agentId Unique identifier for the agent
     * @param dailyLimit Maximum amount the agent can spend per day
     * @param whitelistEnabled If true, only approved recipients can receive funds
     */
    function createWallet(
        string memory agentId, 
        uint256 dailyLimit, 
        bool whitelistEnabled
    ) external returns (bytes32 walletId) {
        walletId = getWalletId(msg.sender, agentId);
        if (wallets[walletId].active) revert WalletAlreadyExists();
        
        wallets[walletId] = Wallet({
            owner: msg.sender,
            agentId: agentId,
            balance: 0,
            dailyLimit: dailyLimit,
            spentToday: 0,
            lastResetDay: block.timestamp / 1 days,
            whitelistEnabled: whitelistEnabled,
            active: true,
            createdAt: block.timestamp,
            totalSpent: 0,
            transactionCount: 0
        });
        
        ownerWallets[msg.sender].push(walletId);
        
        emit WalletCreated(walletId, msg.sender, agentId, dailyLimit);
    }
    
    /**
     * @dev Deposit PNCR into an agent wallet
     */
    function deposit(bytes32 walletId, uint256 amount) external nonReentrant {
        if (!wallets[walletId].active) revert WalletNotActive();
        if (amount == 0) revert InvalidAmount();
        
        pncrToken.safeTransferFrom(msg.sender, address(this), amount);
        wallets[walletId].balance += amount;
        
        emit Deposited(walletId, msg.sender, amount);
    }
    
    /**
     * @dev Withdraw PNCR from wallet (owner only)
     */
    function withdraw(bytes32 walletId, uint256 amount) external nonReentrant {
        Wallet storage wallet = wallets[walletId];
        if (!wallet.active) revert WalletNotActive();
        if (msg.sender != wallet.owner) revert NotOwner();
        if (wallet.balance < amount) revert InsufficientBalance();
        if (amount == 0) revert InvalidAmount();
        
        wallet.balance -= amount;
        pncrToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(walletId, msg.sender, amount);
    }
    
    /**
     * @dev Agent-initiated transfer (called by operator or owner)
     * @param walletId The wallet to transfer from
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param memo Description of the transaction
     */
    function agentTransfer(
        bytes32 walletId, 
        address to, 
        uint256 amount,
        string memory memo
    ) external nonReentrant {
        Wallet storage wallet = wallets[walletId];
        if (!wallet.active) revert WalletNotActive();
        if (!operators[walletId][msg.sender] && msg.sender != wallet.owner) revert NotAuthorized();
        if (amount == 0) revert InvalidAmount();
        
        // Reset daily spending if new day
        uint256 today = block.timestamp / 1 days;
        if (today > wallet.lastResetDay) {
            wallet.spentToday = 0;
            wallet.lastResetDay = today;
        }
        
        // Calculate fee
        uint256 fee = (amount * protocolFee) / 10000;
        uint256 totalRequired = amount + fee;
        
        if (wallet.balance < totalRequired) revert InsufficientBalance();
        if (wallet.spentToday + amount > wallet.dailyLimit) revert DailyLimitExceeded();
        
        // Check whitelist if enabled
        if (wallet.whitelistEnabled && !approvedRecipients[walletId][to]) {
            revert RecipientNotApproved();
        }
        
        // Execute transfer
        wallet.balance -= totalRequired;
        wallet.spentToday += amount;
        wallet.totalSpent += amount;
        wallet.transactionCount++;
        
        pncrToken.safeTransfer(to, amount);
        if (fee > 0) {
            pncrToken.safeTransfer(feeRecipient, fee);
        }
        
        // Log transaction
        transactionHistory[walletId].push(Transaction({
            walletId: walletId,
            to: to,
            amount: amount,
            memo: memo,
            timestamp: block.timestamp,
            initiatedBy: msg.sender
        }));
        
        emit AgentTransfer(walletId, to, amount, fee, memo, msg.sender);
    }
    
    // ============ OWNER SETTINGS ============
    
    /**
     * @dev Update daily spending limit
     */
    function setDailyLimit(bytes32 walletId, uint256 newLimit) external {
        Wallet storage wallet = wallets[walletId];
        if (msg.sender != wallet.owner) revert NotOwner();
        
        uint256 oldLimit = wallet.dailyLimit;
        wallet.dailyLimit = newLimit;
        
        emit LimitUpdated(walletId, oldLimit, newLimit);
    }
    
    /**
     * @dev Approve a recipient for transfers
     */
    function approveRecipient(bytes32 walletId, address recipient) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        if (approvedRecipients[walletId][recipient]) revert AlreadyApproved();
        
        approvedRecipients[walletId][recipient] = true;
        _recipientList[walletId].push(recipient);
        
        emit RecipientApproved(walletId, recipient);
    }
    
    /**
     * @dev Approve multiple recipients at once
     */
    function approveRecipientsBatch(bytes32 walletId, address[] calldata recipients) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (!approvedRecipients[walletId][recipients[i]]) {
                approvedRecipients[walletId][recipients[i]] = true;
                _recipientList[walletId].push(recipients[i]);
                emit RecipientApproved(walletId, recipients[i]);
            }
        }
    }
    
    /**
     * @dev Remove a recipient from approved list
     */
    function removeRecipient(bytes32 walletId, address recipient) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        approvedRecipients[walletId][recipient] = false;
        emit RecipientRemoved(walletId, recipient);
    }
    
    /**
     * @dev Set operator status (operators can execute transfers)
     */
    function setOperator(bytes32 walletId, address operator, bool approved) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        bool wasOperator = operators[walletId][operator];
        operators[walletId][operator] = approved;
        
        if (approved && !wasOperator) {
            _operatorList[walletId].push(operator);
        }
        
        emit OperatorUpdated(walletId, operator, approved);
    }
    
    /**
     * @dev Toggle whitelist mode
     */
    function setWhitelistMode(bytes32 walletId, bool enabled) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        wallets[walletId].whitelistEnabled = enabled;
        emit WhitelistModeChanged(walletId, enabled);
    }
    
    /**
     * @dev Deactivate wallet (can be reactivated)
     */
    function deactivateWallet(bytes32 walletId) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        wallets[walletId].active = false;
        emit WalletDeactivated(walletId);
    }
    
    /**
     * @dev Reactivate wallet
     */
    function reactivateWallet(bytes32 walletId) external {
        if (wallets[walletId].owner != msg.sender) revert NotOwner();
        
        wallets[walletId].active = true;
        emit WalletReactivated(walletId);
    }
    
    // ============ PROTOCOL ADMIN ============
    
    /**
     * @dev Update protocol fee (protocol owner only)
     */
    function setProtocolFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_FEE) revert InvalidFee();
        
        uint256 oldFee = protocolFee;
        protocolFee = newFee;
        
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update fee recipient (protocol owner only)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        feeRecipient = newRecipient;
    }
    
    /**
     * @dev Emergency withdraw all funds from a wallet (owner only)
     */
    function emergencyWithdraw(bytes32 walletId) external nonReentrant {
        Wallet storage wallet = wallets[walletId];
        if (msg.sender != wallet.owner) revert NotOwner();
        
        uint256 amount = wallet.balance;
        wallet.balance = 0;
        wallet.active = false;
        
        pncrToken.safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdraw(walletId, amount);
    }
}
