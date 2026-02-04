const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c";
  
  console.log("Checking PNCRToken at", tokenAddress);
  console.log("Network:", hre.network.name);
  
  // Wait a bit for the chain to sync
  await new Promise(r => setTimeout(r, 5000));
  
  const token = await hre.ethers.getContractAt("PNCRToken", tokenAddress);
  
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const decimals = await token.decimals();
    
    console.log("\n✅ Token Info:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Decimals:", decimals.toString());
    console.log("  Total Supply:", hre.ethers.formatEther(totalSupply), "PNCR");
  } catch (error) {
    console.log("\n⚠️ Error reading token:", error.message);
    console.log("Token might still be confirming...");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
