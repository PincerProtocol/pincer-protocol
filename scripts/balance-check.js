const hre = require("hardhat");

async function main() {
  // Treasury address
  const treasuryAddress = "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89";
  
  // PNCR Token address (update if needed)
  const pncrTokenAddress = "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c";
  
  console.log("🏦 Treasury Balance Check");
  console.log("========================");
  console.log("Network:", hre.network.name);
  console.log("Treasury Address:", treasuryAddress);
  console.log("Timestamp:", new Date().toISOString());
  console.log("");
  
  try {
    // Get ETH balance
    const ethBalance = await hre.ethers.provider.getBalance(treasuryAddress);
    console.log("💰 ETH Balance:");
    console.log("  ", hre.ethers.formatEther(ethBalance), "ETH");
    console.log("");
    
    // Get PNCR balance
    const pncrToken = await hre.ethers.getContractAt("PNCRToken", pncrTokenAddress);
    const pncrBalance = await pncrToken.balanceOf(treasuryAddress);
    const decimals = await pncrToken.decimals();
    
    console.log("🦞 PNCR Balance:");
    console.log("  ", hre.ethers.formatUnits(pncrBalance, decimals), "PNCR");
    console.log("");
    
    // Summary
    console.log("========================");
    console.log("Summary:");
    console.log("  ETH:  ", hre.ethers.formatEther(ethBalance));
    console.log("  PNCR: ", hre.ethers.formatUnits(pncrBalance, decimals));
    console.log("========================");
    
  } catch (error) {
    console.error("❌ Error checking balances:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
