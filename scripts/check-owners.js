const hre = require("hardhat");

async function main() {
  const contracts = {
    PNCRToken: "0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c",
    SimpleEscrow: "0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7",
    PNCRStaking: "0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79",
    ReputationSystem: "0xeF825139C3B17265E867864627f85720Ab6dB9e0",
    AgentWallet: "0x62905288110a94875Ed946EB9Fd79AfAbe893D62"
  };

  const safe = "0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb";

  console.log("Checking contract owners...\n");
  console.log("Expected Safe:", safe);
  console.log("");

  for (const [name, addr] of Object.entries(contracts)) {
    try {
      const contract = await hre.ethers.getContractAt("Ownable", addr);
      const owner = await contract.owner();
      const isSafe = owner.toLowerCase() === safe.toLowerCase();
      console.log(`${name}: ${owner} ${isSafe ? "✅ Safe" : "❌ Not Safe"}`);
    } catch (e) {
      console.log(`${name}: Error - ${e.message}`);
    }
  }
}

main().catch(console.error);
