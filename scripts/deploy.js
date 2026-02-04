const hre = require("hardhat");

async function main() {
  console.log("🦞 Deploying Pincer Protocol to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 환경 변수에서 지갑 주소 가져오기 (기본값: deployer)
  // 새 토큰노믹스: Community 52%, Treasury 20%, Team 14%, Investors 14%
  const communityWallet = process.env.COMMUNITY_WALLET || deployer.address;
  const treasuryWallet = process.env.TREASURY_WALLET || deployer.address;
  const teamWallet = process.env.TEAM_WALLET || deployer.address;
  const investorWallet = process.env.INVESTOR_WALLET || deployer.address;
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;

  console.log("=== Distribution Wallets (New Tokenomics) ===");
  console.log("Community (52%):", communityWallet);
  console.log("Treasury (20%):", treasuryWallet);
  console.log("Team (14%):", teamWallet);
  console.log("Investors (14%):", investorWallet);
  console.log("Fee Recipient:", feeRecipient);
  console.log("");

  // ============================================
  // 1. Deploy PNCRToken
  // ============================================
  console.log("=== Deploying PNCRToken ===");
  const PNCRToken = await hre.ethers.getContractFactory("PNCRToken");
  const token = await PNCRToken.deploy(
    communityWallet,
    treasuryWallet,
    teamWallet,
    investorWallet
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ PNCRToken deployed to:", tokenAddress);
  console.log("   Total Supply:", hre.ethers.formatEther(await token.totalSupply()), "PNCR");
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
  console.log("   Token:", tokenAddress);
  console.log("   Fee Recipient:", feeRecipient);
  console.log("   Fee Rate:", (await escrow.feeRate()).toString(), "basis points (2%)");
  console.log("");

  // ============================================
  // 3. Deploy PNCRStaking
  // ============================================
  console.log("=== Deploying PNCRStaking ===");
  const PNCRStaking = await hre.ethers.getContractFactory("PNCRStaking");
  const staking = await PNCRStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("✅ PNCRStaking deployed to:", stakingAddress);
  console.log("   Token:", tokenAddress);
  console.log("");

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

  // ============================================
  // 5. Configure Connections
  // ============================================
  console.log("=== Configuring Connections ===");
  
  // Connect Escrow to ReputationSystem
  await reputation.setEscrowContract(escrowAddress);
  console.log("✅ ReputationSystem: Escrow role granted to", escrowAddress);
  console.log("");

  // ============================================
  // Summary
  // ============================================
  console.log("===========================================");
  console.log("🦞 DEPLOYMENT COMPLETE!");
  console.log("===========================================");
  console.log("");
  console.log("Contract Addresses:");
  console.log("  PNCRToken:", tokenAddress);
  console.log("  SimpleEscrow:", escrowAddress);
  console.log("  PNCRStaking:", stakingAddress);
  console.log("  ReputationSystem:", reputationAddress);
  console.log("");
  console.log("Token Distribution (175B PNCR):");
  console.log("  Community (52%): 91B PNCR");
  console.log("  Treasury (20%): 35B PNCR");
  console.log("  Team (14%): 24.5B PNCR");
  console.log("  Investors (14%): 24.5B PNCR");
  console.log("");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("");
  console.log("===========================================");
  console.log("📋 VERIFICATION COMMANDS:");
  console.log("===========================================");
  console.log("");
  console.log("# Verify PNCRToken:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${tokenAddress} "${communityWallet}" "${treasuryWallet}" "${teamWallet}" "${investorWallet}"`);
  console.log("");
  console.log("# Verify SimpleEscrow:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${escrowAddress} "${tokenAddress}" "${feeRecipient}"`);
  console.log("");
  console.log("# Verify PNCRStaking:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${stakingAddress} "${tokenAddress}"`);
  console.log("");
  console.log("# Verify ReputationSystem:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${reputationAddress}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
