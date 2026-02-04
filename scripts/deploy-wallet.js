const hre = require("hardhat");

async function main() {
  console.log("🏦 Deploying AgentWallet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get network
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, `(chainId: ${network.chainId})`);

  // Contract addresses
  let pncrTokenAddress;
  let feeRecipient;
  
  if (network.chainId === 8453n) {
    // Base Mainnet
    pncrTokenAddress = "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c";
    feeRecipient = deployer.address; // Protocol treasury
    console.log("\n📍 Base Mainnet deployment");
  } else if (network.chainId === 84532n) {
    // Base Sepolia
    pncrTokenAddress = "0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939";
    feeRecipient = deployer.address;
    console.log("\n📍 Base Sepolia deployment");
  } else {
    console.error("Unsupported network!");
    process.exit(1);
  }

  console.log("PNCR Token:", pncrTokenAddress);
  console.log("Fee Recipient:", feeRecipient);

  // Deploy AgentWallet
  console.log("\n⏳ Deploying AgentWallet contract...");
  
  const AgentWallet = await hre.ethers.getContractFactory("AgentWallet");
  const agentWallet = await AgentWallet.deploy(pncrTokenAddress, feeRecipient);
  await agentWallet.waitForDeployment();
  
  const walletAddress = await agentWallet.getAddress();
  console.log("✅ AgentWallet deployed to:", walletAddress);

  // Verify on explorer
  if (network.chainId === 8453n || network.chainId === 84532n) {
    console.log("\n⏳ Waiting for block confirmations...");
    await agentWallet.deploymentTransaction().wait(5);
    
    console.log("📝 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: walletAddress,
        constructorArguments: [pncrTokenAddress, feeRecipient],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log(`
AgentWallet: ${walletAddress}
PNCR Token:  ${pncrTokenAddress}
Fee Rate:    0.5%
Max Fee:     5%

Next steps:
1. Create agent wallets via createWallet()
2. Set operators for each agent
3. Configure spending limits
4. Approve recipients if using whitelist mode
  `);

  // Update .env suggestion
  console.log("Add to .env:");
  console.log(`AGENT_WALLET_ADDRESS=${walletAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
