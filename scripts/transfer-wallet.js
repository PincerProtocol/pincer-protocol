const hre = require("hardhat");

async function main() {
  const safeAddress = "0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb";
  const walletAddress = "0x62905288110a94875Ed946EB9Fd79AfAbe893D62";

  console.log("Transferring AgentWallet ownership to Safe...");
  console.log("Wallet:", walletAddress);
  console.log("Safe:", safeAddress);

  const wallet = await hre.ethers.getContractAt("Ownable", walletAddress);
  
  const currentOwner = await wallet.owner();
  console.log("Current owner:", currentOwner);

  const tx = await wallet.transferOwnership(safeAddress);
  console.log("TX:", tx.hash);
  
  await tx.wait();
  
  const newOwner = await wallet.owner();
  console.log("New owner:", newOwner);
  console.log("✅ Done!");
}

main().catch(console.error);
