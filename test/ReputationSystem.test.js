const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem", function () {
  let reputation;
  let owner;
  let escrow;
  let dispute;
  let agent1;
  let agent2;
  let agent3;

  const INITIAL_SCORE = 100n;
  const MAX_SCORE = 1000n;
  const BAN_THRESHOLD = 10n;

  beforeEach(async function () {
    [owner, escrow, dispute, agent1, agent2, agent3] = await ethers.getSigners();

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputation = await ReputationSystem.deploy();
    await reputation.waitForDeployment();

    // Grant roles
    await reputation.setEscrowContract(escrow.address);
    await reputation.setDisputeContract(dispute.address);
  });

  describe("Deployment", function () {
    it("Should set owner correctly", async function () {
      expect(await reputation.hasRole(await reputation.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should grant ADMIN_ROLE to owner", async function () {
      expect(await reputation.hasRole(await reputation.ADMIN_ROLE(), owner.address)).to.be.true;
    });
  });

  describe("Registration", function () {
    it("Should register a new agent", async function () {
      await expect(reputation.registerAgent(agent1.address))
        .to.emit(reputation, "AgentRegistered");

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.score).to.equal(INITIAL_SCORE);
      expect(rep.registeredAt).to.be.gt(0);
    });

    it("Should reject duplicate registration", async function () {
      await reputation.registerAgent(agent1.address);
      
      await expect(reputation.registerAgent(agent1.address))
        .to.be.revertedWith("Already registered");
    });

    it("Should increment total agents", async function () {
      expect(await reputation.totalAgents()).to.equal(0);
      
      await reputation.registerAgent(agent1.address);
      expect(await reputation.totalAgents()).to.equal(1);
      
      await reputation.registerAgent(agent2.address);
      expect(await reputation.totalAgents()).to.equal(2);
    });
  });

  describe("Transaction Recording", function () {
    beforeEach(async function () {
      await reputation.registerAgent(agent1.address);
      await reputation.registerAgent(agent2.address);
    });

    it("Should record successful transaction", async function () {
      await expect(reputation.connect(escrow).recordTransaction(agent1.address, agent2.address, true))
        .to.emit(reputation, "TransactionRecorded")
        .withArgs(agent1.address, agent2.address, true);

      const rep1 = await reputation.getReputation(agent1.address);
      const rep2 = await reputation.getReputation(agent2.address);

      expect(rep1.score).to.equal(INITIAL_SCORE + 5n);
      expect(rep2.score).to.equal(INITIAL_SCORE + 5n);
      expect(rep1.totalTransactions).to.equal(1);
      expect(rep1.successfulTransactions).to.equal(1);
    });

    it("Should record unsuccessful transaction without score change", async function () {
      await reputation.connect(escrow).recordTransaction(agent1.address, agent2.address, false);

      const rep1 = await reputation.getReputation(agent1.address);
      expect(rep1.score).to.equal(INITIAL_SCORE);
      expect(rep1.totalTransactions).to.equal(1);
      expect(rep1.successfulTransactions).to.equal(0);
    });

    it("Should reject recording from non-escrow address", async function () {
      await expect(
        reputation.connect(agent1).recordTransaction(agent1.address, agent2.address, true)
      ).to.be.reverted;
    });

    it("Should reject unregistered agents", async function () {
      await expect(
        reputation.connect(escrow).recordTransaction(agent3.address, agent2.address, true)
      ).to.be.revertedWith("Buyer not registered");
    });

    it("Should increment total transactions", async function () {
      await reputation.connect(escrow).recordTransaction(agent1.address, agent2.address, true);
      await reputation.connect(escrow).recordTransaction(agent2.address, agent1.address, true);

      expect(await reputation.totalTransactions()).to.equal(2);
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      await reputation.registerAgent(agent1.address);
      await reputation.registerAgent(agent2.address);
    });

    it("Should record dispute win", async function () {
      await reputation.connect(dispute).recordDisputeResolution(agent1.address, agent2.address, false);

      const rep1 = await reputation.getReputation(agent1.address);
      const rep2 = await reputation.getReputation(agent2.address);

      expect(rep1.score).to.equal(INITIAL_SCORE + 10n); // +10 for win
      expect(rep2.score).to.equal(INITIAL_SCORE - 20n); // -20 for loss
      expect(rep1.disputesWon).to.equal(1);
      expect(rep2.disputesLost).to.equal(1);
    });

    it("Should apply bad actor penalty", async function () {
      await reputation.connect(dispute).recordDisputeResolution(agent1.address, agent2.address, true);

      const rep2 = await reputation.getReputation(agent2.address);
      expect(rep2.score).to.equal(INITIAL_SCORE - 50n); // -50 for bad actor
    });

    it("Should ban agent when score drops below threshold", async function () {
      // Lower agent2's score first
      await reputation.adjustReputation(agent2.address, -85, "Test");
      expect((await reputation.getReputation(agent2.address)).score).to.equal(15n);

      // Now lose a dispute (should trigger ban)
      await reputation.connect(dispute).recordDisputeResolution(agent1.address, agent2.address, false);

      const rep2 = await reputation.getReputation(agent2.address);
      expect(rep2.isBanned).to.be.true;
    });

    it("Should reject recording from non-dispute address", async function () {
      await expect(
        reputation.connect(agent1).recordDisputeResolution(agent1.address, agent2.address, false)
      ).to.be.reverted;
    });
  });

  describe("Score Capping", function () {
    beforeEach(async function () {
      await reputation.registerAgent(agent1.address);
    });

    it("Should cap score at MAX_SCORE", async function () {
      await reputation.adjustReputation(agent1.address, 2000, "Test boost");

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.score).to.equal(MAX_SCORE);
    });

    it("Should not go below zero", async function () {
      await reputation.adjustReputation(agent1.address, -500, "Test penalty");

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.score).to.equal(0n);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await reputation.registerAgent(agent1.address);
      await reputation.registerAgent(agent2.address);
    });

    it("Should return correct success rate", async function () {
      // No transactions = 100%
      expect(await reputation.getSuccessRate(agent1.address)).to.equal(100);

      // 1 success, 1 fail = 50%
      await reputation.connect(escrow).recordTransaction(agent1.address, agent2.address, true);
      await reputation.connect(escrow).recordTransaction(agent1.address, agent2.address, false);

      expect(await reputation.getSuccessRate(agent1.address)).to.equal(50);
    });

    it("Should return correct trust tier", async function () {
      // Initial = 100 = Bronze
      expect(await reputation.getTrustTier(agent1.address)).to.equal("Bronze");

      // Boost to 200 = Silver
      await reputation.adjustReputation(agent1.address, 100, "Test");
      expect(await reputation.getTrustTier(agent1.address)).to.equal("Silver");

      // Boost to 500 = Gold
      await reputation.adjustReputation(agent1.address, 300, "Test");
      expect(await reputation.getTrustTier(agent1.address)).to.equal("Gold");

      // Boost to 800 = Platinum
      await reputation.adjustReputation(agent1.address, 300, "Test");
      expect(await reputation.getTrustTier(agent1.address)).to.equal("Platinum");
    });

    it("Should check good standing correctly", async function () {
      // Not registered
      expect(await reputation.isInGoodStanding(agent3.address)).to.be.false;

      // Registered and good
      expect(await reputation.isInGoodStanding(agent1.address)).to.be.true;

      // Banned
      await reputation.banAgent(agent1.address, "Test ban");
      expect(await reputation.isInGoodStanding(agent1.address)).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await reputation.registerAgent(agent1.address);
    });

    it("Should allow admin to adjust reputation", async function () {
      await expect(reputation.adjustReputation(agent1.address, 50, "Manual adjustment"))
        .to.emit(reputation, "ReputationUpdated");

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.score).to.equal(INITIAL_SCORE + 50n);
    });

    it("Should allow admin to ban agent", async function () {
      await expect(reputation.banAgent(agent1.address, "Violation"))
        .to.emit(reputation, "AgentBanned")
        .withArgs(agent1.address, "Violation");

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.isBanned).to.be.true;
    });

    it("Should allow admin to unban agent", async function () {
      await reputation.banAgent(agent1.address, "Test");
      
      await expect(reputation.unbanAgent(agent1.address))
        .to.emit(reputation, "AgentUnbanned")
        .withArgs(agent1.address);

      const rep = await reputation.getReputation(agent1.address);
      expect(rep.isBanned).to.be.false;
      expect(rep.score).to.equal(INITIAL_SCORE); // Reset to initial
    });

    it("Should reject admin functions from non-admin", async function () {
      await expect(
        reputation.connect(agent1).adjustReputation(agent1.address, 50, "Hack")
      ).to.be.reverted;

      await expect(
        reputation.connect(agent1).banAgent(agent1.address, "Hack")
      ).to.be.reverted;
    });
  });
});
