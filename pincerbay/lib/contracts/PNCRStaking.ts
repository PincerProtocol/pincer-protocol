// PNCRStaking Contract - Base Mainnet
export const PNCR_STAKING_ADDRESS = (process.env.STAKING_CONTRACT_ADDRESS || '0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79') as `0x${string}`

export const PNCR_STAKING_ABI = [
  // View functions
  'function getStake(address staker) view returns (uint256 amount, uint256 startTime, uint256 lockPeriod)',
  'function stakes(address staker) view returns (uint256 amount, uint256 startTime, uint256 lockPeriod)',
  'function getRewards(address staker) view returns (uint256)',
  'function getTotalStaked() view returns (uint256)',
  'function getAnnualRewardRate() view returns (uint256)',
  'function isStakeLocked(address staker) view returns (bool)',

  // State-changing functions
  'function stake(uint256 amount, uint256 lockPeriod)',
  'function unstake(uint256 amount)',
  'function claimRewards()',
  'function setLockPeriod(uint256 newLockPeriod)',
  'function updateRewardRate(uint256 newRate)',

  // Events
  'event Staked(address indexed staker, uint256 amount, uint256 lockPeriod)',
  'event Unstaked(address indexed staker, uint256 amount)',
  'event RewardsClaimed(address indexed staker, uint256 amount)',
  'event LockPeriodUpdated(uint256 newLockPeriod)',
  'event RewardRateUpdated(uint256 newRate)'
] as const
