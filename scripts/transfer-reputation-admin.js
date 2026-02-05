const hre = require("hardhat");

async function main() {
  const safeAddress = "0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb";
  const reputationAddress = "0xeF825139C3B17265E867864627f85720Ab6dB9e0";

  console.log("Transferring ReputationSystem admin to Safe...");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);

  const reputation = await hre.ethers.getContractAt("ReputationSystem", reputationAddress);
  
  const DEFAULT_ADMIN_ROLE = await reputation.DEFAULT_ADMIN_ROLE();
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);

  // Check if signer has admin role
  const hasRole = await reputation.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
  console.log("Signer has admin role:", hasRole);

  if (!hasRole) {
    console.log("❌ Signer is not admin!");
    return;
  }

  // Grant admin role to Safe
  console.log("Granting admin role to Safe...");
  const tx1 = await reputation.grantRole(DEFAULT_ADMIN_ROLE, safeAddress);
  console.log("TX1:", tx1.hash);
  await tx1.wait();
  console.log("✅ Safe now has admin role");

  // Revoke admin role from signer
  console.log("Revoking admin role from signer...");
  const tx2 = await reputation.revokeRole(DEFAULT_ADMIN_ROLE, signer.address);
  console.log("TX2:", tx2.hash);
  await tx2.wait();
  console.log("✅ Signer no longer has admin role");

  // Verify
  const safeHasRole = await reputation.hasRole(DEFAULT_ADMIN_ROLE, safeAddress);
  console.log("Safe has admin role:", safeHasRole);

  console.log("✅ Done!");
}

main().catch(console.error);
