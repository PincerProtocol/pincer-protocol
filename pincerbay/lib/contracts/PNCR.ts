export const PNCR_ADDRESS = "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c" as const
export const TREASURY_ADDRESS = "0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb" as const

export const PNCR_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const
