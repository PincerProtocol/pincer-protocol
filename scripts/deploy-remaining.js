const hre = require("hardhat");

async function main() {
  console.log("🦞 Deploying remaining contracts to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Already deployed token
  const tokenAddress = "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c";
  const feeRecipient = deployer.address;

  console.log("Using PNCRToken at:", tokenAddress);
  console.log("");

  // ============================================
  // 2. Deploy SimpleEscrow
  // ============================================
  console.log("=== Deploying SimpleEscrow ===");
  const SimpleEscrow = await hre.ethers.getContractFactory("SimpleEscrow");
  const escrow = await SimpleEscrow.deploy(tokenAddress, feeRecipient);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("✅ SimpleEscrow deployed to:", escrowAddress);
  console.log("");

  // Wait a bit
  await new Promise(r => setTimeout(r, 3000));

  // ============================================
  // 3. Deploy PNCRStaking
  // ============================================
  console.log("=== Deploying PNCRStaking ===");
  const PNCRStaking = await hre.ethers.getContractFactory("PNCRStaking");
  const staking = await PNCRStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("✅ PNCRStaking deployed to:", stakingAddress);
  console.log("");

  // Wait a bit
  await new Promise(r => setTimeout(r, 3000));

  // ============================================
  // 4. Deploy ReputationSystem
  // ============================================
  console.log("=== Deploying ReputationSystem ===");
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputation = await ReputationSystem.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();

  console.log("✅ ReputationSystem deployed to:", reputationAddress);
  console.log("");

  // Wait a bit
  await new Promise(r => setTimeout(r, 3000));

  // ============================================
  // 5. Configure Connections
  // ============================================
  console.log("=== Configuring Connections ===");
  
  try {
    await reputation.setEscrowContract(escrowAddress);
    console.log("✅ ReputationSystem: Escrow connected");
  } catch (e) {
    console.log("⚠️ Config error:", e.message);
  }
  console.log("");

  // ============================================
  // Summary
  // ============================================
  console.log("===========================================");
  console.log("🦞 MAINNET DEPLOYMENT COMPLETE!");
  console.log("===========================================");
  console.log("");
  console.log("Contract Addresses (Base Mainnet):");
  console.log("  PNCRToken:", tokenAddress);
  console.log("  SimpleEscrow:", escrowAddress);
  console.log("  PNCRStaking:", stakingAddress);
  console.log("  ReputationSystem:", reputationAddress);
  console.log("");
  console.log("===========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
