const hre = require("hardhat");

/**
 * Transfer Ownership Script
 * 
 * Transfers ownership of all Pincer Protocol contracts to a Gnosis Safe multisig
 * 
 * Usage:
 *   SAFE_ADDRESS=0x... npx hardhat run scripts/transfer-ownership.js --network baseMainnet
 */

// Contract addresses on Base Mainnet
const CONTRACTS = {
  PNCRToken: "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c",
  SimpleEscrow: "0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7",
  PNCRStaking: "0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79",
  ReputationSystem: "0xeF825139C3B17265E867864627f85720Ab6dB9e0",
};

async function main() {
  console.log("⚒️ Transfer Ownership to Gnosis Safe");
  console.log("Network:", hre.network.name);
  console.log("");

  // Get Safe address from environment
  const safeAddress = process.env.SAFE_ADDRESS;
  
  if (!safeAddress) {
    console.error("❌ Error: SAFE_ADDRESS environment variable not set");
    console.log("Usage: SAFE_ADDRESS=0x... npx hardhat run scripts/transfer-ownership.js --network baseMainnet");
    process.exit(1);
  }

  // Validate Safe address
  if (!hre.ethers.isAddress(safeAddress)) {
    console.error("❌ Error: Invalid Safe address:", safeAddress);
    process.exit(1);
  }

  console.log("Target Safe Address:", safeAddress);
  console.log("");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Current Owner (Signer):", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");
  console.log("");

  // Confirm action
  console.log("⚠️  WARNING: This action will transfer ownership of all contracts!");
  console.log("Please verify the Safe address is correct before proceeding.");
  console.log("");

  // Transfer ownership for each contract
  const results = [];

  for (const [name, address] of Object.entries(CONTRACTS)) {
    console.log(`=== Processing ${name} ===`);
    console.log("Contract Address:", address);

    try {
      // Get contract instance
      const contract = await hre.ethers.getContractAt("Ownable", address);

      // Check current owner
      const currentOwner = await contract.owner();
      console.log("Current Owner:", currentOwner);

      if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
        console.log("⚠️  Warning: Signer is not the current owner!");
        console.log("Skipping this contract...");
        results.push({ name, address, status: "SKIPPED", reason: "Not owner" });
        console.log("");
        continue;
      }

      if (currentOwner.toLowerCase() === safeAddress.toLowerCase()) {
        console.log("✅ Already owned by Safe");
        results.push({ name, address, status: "ALREADY_OWNED" });
        console.log("");
        continue;
      }

      // Transfer ownership
      console.log("Transferring ownership to Safe...");
      const tx = await contract.transferOwnership(safeAddress);
      console.log("Transaction Hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Ownership transferred! Gas used:", receipt.gasUsed.toString());

      // Verify new owner
      const newOwner = await contract.owner();
      if (newOwner.toLowerCase() === safeAddress.toLowerCase()) {
        console.log("✅ Verified: New owner is Safe");
        results.push({ name, address, status: "SUCCESS", txHash: tx.hash });
      } else {
        console.log("❌ Verification failed: Owner mismatch");
        results.push({ name, address, status: "FAILED", reason: "Owner mismatch after transfer" });
      }

    } catch (error) {
      console.log("❌ Error:", error.message);
      results.push({ name, address, status: "ERROR", error: error.message });
    }

    console.log("");
  }

  // Summary
  console.log("===========================================");
  console.log("⚒️ TRANSFER COMPLETE!");
  console.log("===========================================");
  console.log("");
  console.log("Summary:");
  
  const successful = results.filter(r => r.status === "SUCCESS");
  const failed = results.filter(r => r.status === "ERROR" || r.status === "FAILED");
  const skipped = results.filter(r => r.status === "SKIPPED" || r.status === "ALREADY_OWNED");

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⚠️  Skipped: ${skipped.length}`);
  console.log("");

  if (successful.length > 0) {
    console.log("Successful Transfers:");
    successful.forEach(r => {
      console.log(`  ${r.name}: ${r.txHash}`);
    });
    console.log("");
  }

  if (failed.length > 0) {
    console.log("Failed Transfers:");
    failed.forEach(r => {
      console.log(`  ${r.name}: ${r.error || r.reason}`);
    });
    console.log("");
  }

  if (skipped.length > 0) {
    console.log("Skipped Contracts:");
    skipped.forEach(r => {
      console.log(`  ${r.name}: ${r.status === "ALREADY_OWNED" ? "Already owned by Safe" : r.reason}`);
    });
    console.log("");
  }

  console.log("Safe Address:", safeAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("");

  // Exit with error code if any transfers failed
  if (failed.length > 0) {
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
