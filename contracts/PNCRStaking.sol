// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PNCRStaking
 * @dev 4-tier staking system for PNCR token
 * @author Pincer Protocol 🦞
 * 
 * Tiers:
 * - Bronze:   1,000 PNCR  → 10% APY
 * - Silver:   10,000 PNCR → 20% APY
 * - Gold:     100,000 PNCR → 35% APY
 * - Platinum: 1,000,000 PNCR → 50% APY
 */
contract PNCRStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 lockEndTime;
        Tier tier;
    }

    enum Tier { None, Bronze, Silver, Gold, Platinum }

    // ============ State Variables ============

    IERC20 public immutable pncrToken;
    
    // Tier thresholds (in wei, 18 decimals)
    uint256 public constant BRONZE_MIN = 1_000 * 1e18;
    uint256 public constant SILVER_MIN = 10_000 * 1e18;
    uint256 public constant GOLD_MIN = 100_000 * 1e18;
    uint256 public constant PLATINUM_MIN = 1_000_000 * 1e18;

    // APY in basis points (100 = 1%)
    uint256 public constant BRONZE_APY = 1000;    // 10%
    uint256 public constant SILVER_APY = 2000;    // 20%
    uint256 public constant GOLD_APY = 3500;      // 35%
    uint256 public constant PLATINUM_APY = 5000;  // 50%

    // Lock periods
    uint256 public constant BRONZE_LOCK = 7 days;
    uint256 public constant SILVER_LOCK = 30 days;
    uint256 public constant GOLD_LOCK = 90 days;
    uint256 public constant PLATINUM_LOCK = 180 days;

    // Staker info
    mapping(address => StakeInfo) public stakes;
    
    // Total staked
    uint256 public totalStaked;
    
    // Reward pool
    uint256 public rewardPool;

    // ============ Events ============

    event Staked(address indexed user, uint256 amount, Tier tier, uint256 lockEndTime);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardPoolFunded(uint256 amount);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier);

    // ============ Constructor ============

    constructor(address _pncrToken) Ownable(msg.sender) {
        require(_pncrToken != address(0), "Invalid token address");
        pncrToken = IERC20(_pncrToken);
    }

    // ============ External Functions ============

    /**
     * @dev Stake PNCR tokens
     * @param amount Amount to stake (must meet minimum tier threshold)
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(amount >= BRONZE_MIN, "Below minimum stake");
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // If already staking, must add to existing stake
        uint256 newTotal = stakeInfo.amount + amount;
        Tier newTier = _getTier(newTotal);
        
        // Transfer tokens
        pncrToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake info
        if (stakeInfo.amount == 0) {
            // New stake
            stakeInfo.startTime = block.timestamp;
            stakeInfo.lastClaimTime = block.timestamp;
        }
        
        Tier oldTier = stakeInfo.tier;
        stakeInfo.amount = newTotal;
        stakeInfo.tier = newTier;
        stakeInfo.lockEndTime = block.timestamp + _getLockPeriod(newTier);
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, newTier, stakeInfo.lockEndTime);
        
        if (oldTier != newTier && oldTier != Tier.None) {
            emit TierUpgraded(msg.sender, oldTier, newTier);
        }
    }

    /**
     * @dev Unstake tokens after lock period
     */
    function unstake() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No stake found");
        require(block.timestamp >= stakeInfo.lockEndTime, "Still locked");
        
        // Claim any pending rewards first
        uint256 rewards = _calculateRewards(msg.sender);
        uint256 totalAmount = stakeInfo.amount;
        
        // Reset stake
        totalStaked -= stakeInfo.amount;
        stakeInfo.amount = 0;
        stakeInfo.tier = Tier.None;
        stakeInfo.startTime = 0;
        stakeInfo.lastClaimTime = 0;
        stakeInfo.lockEndTime = 0;
        
        // Transfer principal
        pncrToken.safeTransfer(msg.sender, totalAmount);
        
        // Transfer rewards if available
        if (rewards > 0 && rewards <= rewardPool) {
            rewardPool -= rewards;
            pncrToken.safeTransfer(msg.sender, rewards);
            emit RewardsClaimed(msg.sender, rewards);
        }
        
        emit Unstaked(msg.sender, totalAmount);
    }

    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No stake found");
        
        uint256 rewards = _calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");
        require(rewards <= rewardPool, "Insufficient reward pool");
        
        stakeInfo.lastClaimTime = block.timestamp;
        rewardPool -= rewards;
        
        pncrToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Fund the reward pool
     * @param amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        pncrToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }

    // ============ View Functions ============

    /**
     * @dev Get pending rewards for a staker
     */
    function pendingRewards(address user) external view returns (uint256) {
        return _calculateRewards(user);
    }

    /**
     * @dev Get stake info for a user
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 lockEndTime,
        Tier tier,
        uint256 pendingReward
    ) {
        StakeInfo storage info = stakes[user];
        return (
            info.amount,
            info.startTime,
            info.lastClaimTime,
            info.lockEndTime,
            info.tier,
            _calculateRewards(user)
        );
    }

    /**
     * @dev Get tier for an amount
     */
    function getTierForAmount(uint256 amount) external pure returns (Tier) {
        return _getTier(amount);
    }

    /**
     * @dev Get APY for a tier
     */
    function getAPY(Tier tier) external pure returns (uint256) {
        return _getAPY(tier);
    }

    /**
     * @dev Check if user can unstake
     */
    function canUnstake(address user) external view returns (bool) {
        StakeInfo storage info = stakes[user];
        return info.amount > 0 && block.timestamp >= info.lockEndTime;
    }

    // ============ Internal Functions ============

    function _getTier(uint256 amount) internal pure returns (Tier) {
        if (amount >= PLATINUM_MIN) return Tier.Platinum;
        if (amount >= GOLD_MIN) return Tier.Gold;
        if (amount >= SILVER_MIN) return Tier.Silver;
        if (amount >= BRONZE_MIN) return Tier.Bronze;
        return Tier.None;
    }

    function _getAPY(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Platinum) return PLATINUM_APY;
        if (tier == Tier.Gold) return GOLD_APY;
        if (tier == Tier.Silver) return SILVER_APY;
        if (tier == Tier.Bronze) return BRONZE_APY;
        return 0;
    }

    function _getLockPeriod(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Platinum) return PLATINUM_LOCK;
        if (tier == Tier.Gold) return GOLD_LOCK;
        if (tier == Tier.Silver) return SILVER_LOCK;
        if (tier == Tier.Bronze) return BRONZE_LOCK;
        return 0;
    }

    function _calculateRewards(address user) internal view returns (uint256) {
        StakeInfo storage info = stakes[user];
        if (info.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - info.lastClaimTime;
        uint256 apy = _getAPY(info.tier);
        
        // rewards = principal * APY * time / (365 days * 10000)
        // APY is in basis points (10000 = 100%)
        return (info.amount * apy * timeStaked) / (365 days * 10000);
    }

    // ============ Admin Functions ============

    /**
     * @dev Emergency withdraw (admin only, for emergencies)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
