const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentWallet", function () {
  let pncrToken;
  let agentWallet;
  let owner;
  let operator;
  let recipient1;
  let recipient2;
  let feeRecipient;
  
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M PNCR
  const DAILY_LIMIT = ethers.parseEther("10000"); // 10K PNCR daily limit
  const DEPOSIT_AMOUNT = ethers.parseEther("50000"); // 50K PNCR
  
  beforeEach(async function () {
    [owner, operator, recipient1, recipient2, feeRecipient] = await ethers.getSigners();
    
    // Deploy PNCR Token (requires 4 wallet addresses)
    const PNCRToken = await ethers.getContractFactory("PNCRToken");
    pncrToken = await PNCRToken.deploy(
      owner.address,        // communityWallet
      owner.address,        // treasuryWallet  
      owner.address,        // teamWallet
      owner.address         // investorWallet
    );
    await pncrToken.waitForDeployment();
    
    // Deploy AgentWallet
    const AgentWallet = await ethers.getContractFactory("AgentWallet");
    agentWallet = await AgentWallet.deploy(
      await pncrToken.getAddress(),
      feeRecipient.address
    );
    await agentWallet.waitForDeployment();
    
    // Approve AgentWallet to spend owner's tokens
    await pncrToken.approve(await agentWallet.getAddress(), ethers.MaxUint256);
  });
  
  describe("Wallet Creation", function () {
    it("Should create a wallet successfully", async function () {
      const tx = await agentWallet.createWallet("pincer", DAILY_LIMIT, true);
      await tx.wait();
      
      const walletId = await agentWallet.getWalletId(owner.address, "pincer");
      const info = await agentWallet.getWalletInfo(walletId);
      
      expect(info.owner).to.equal(owner.address);
      expect(info.agentId).to.equal("pincer");
      expect(info.balance).to.equal(0);
      expect(info.dailyLimit).to.equal(DAILY_LIMIT);
      expect(info.active).to.be.true;
      expect(info.whitelistEnabled).to.be.true;
    });
    
    it("Should emit WalletCreated event", async function () {
      const walletId = await agentWallet.getWalletId(owner.address, "forge");
      
      await expect(agentWallet.createWallet("forge", DAILY_LIMIT, false))
        .to.emit(agentWallet, "WalletCreated")
        .withArgs(walletId, owner.address, "forge", DAILY_LIMIT);
    });
    
    it("Should not allow duplicate wallets", async function () {
      await agentWallet.createWallet("scout", DAILY_LIMIT, true);
      
      await expect(
        agentWallet.createWallet("scout", DAILY_LIMIT, true)
      ).to.be.revertedWithCustomError(agentWallet, "WalletAlreadyExists");
    });
    
    it("Should track owner's wallets", async function () {
      await agentWallet.createWallet("agent1", DAILY_LIMIT, true);
      await agentWallet.createWallet("agent2", DAILY_LIMIT, false);
      
      const wallets = await agentWallet.getWalletsByOwner(owner.address);
      expect(wallets.length).to.equal(2);
    });
  });
  
  describe("Deposits & Withdrawals", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("pincer", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "pincer");
    });
    
    it("Should deposit tokens", async function () {
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
      
      const info = await agentWallet.getWalletInfo(walletId);
      expect(info.balance).to.equal(DEPOSIT_AMOUNT);
    });
    
    it("Should emit Deposited event", async function () {
      await expect(agentWallet.deposit(walletId, DEPOSIT_AMOUNT))
        .to.emit(agentWallet, "Deposited")
        .withArgs(walletId, owner.address, DEPOSIT_AMOUNT);
    });
    
    it("Should withdraw tokens (owner only)", async function () {
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
      
      const balanceBefore = await pncrToken.balanceOf(owner.address);
      await agentWallet.withdraw(walletId, DEPOSIT_AMOUNT);
      const balanceAfter = await pncrToken.balanceOf(owner.address);
      
      expect(balanceAfter - balanceBefore).to.equal(DEPOSIT_AMOUNT);
    });
    
    it("Should not allow non-owner to withdraw", async function () {
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
      
      await expect(
        agentWallet.connect(operator).withdraw(walletId, DEPOSIT_AMOUNT)
      ).to.be.revertedWithCustomError(agentWallet, "NotOwner");
    });
    
    it("Should not allow withdrawal exceeding balance", async function () {
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
      
      await expect(
        agentWallet.withdraw(walletId, DEPOSIT_AMOUNT + 1n)
      ).to.be.revertedWithCustomError(agentWallet, "InsufficientBalance");
    });
  });
  
  describe("Agent Transfers", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("pincer", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "pincer");
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
    });
    
    it("Should transfer via owner", async function () {
      const amount = ethers.parseEther("1000");
      const fee = amount * 50n / 10000n; // 0.5% fee
      
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "Test payment");
      
      const recipientBalance = await pncrToken.balanceOf(recipient1.address);
      const feeBalance = await pncrToken.balanceOf(feeRecipient.address);
      
      expect(recipientBalance).to.equal(amount);
      expect(feeBalance).to.equal(fee);
    });
    
    it("Should transfer via operator", async function () {
      // Set operator
      await agentWallet.setOperator(walletId, operator.address, true);
      
      const amount = ethers.parseEther("500");
      await agentWallet.connect(operator).agentTransfer(
        walletId, 
        recipient1.address, 
        amount, 
        "Operator payment"
      );
      
      const recipientBalance = await pncrToken.balanceOf(recipient1.address);
      expect(recipientBalance).to.equal(amount);
    });
    
    it("Should not allow unauthorized transfers", async function () {
      const amount = ethers.parseEther("500");
      
      await expect(
        agentWallet.connect(recipient1).agentTransfer(
          walletId,
          recipient2.address,
          amount,
          "Unauthorized"
        )
      ).to.be.revertedWithCustomError(agentWallet, "NotAuthorized");
    });
    
    it("Should enforce daily limit", async function () {
      const amount = DAILY_LIMIT + 1n;
      
      await expect(
        agentWallet.agentTransfer(walletId, recipient1.address, amount, "Over limit")
      ).to.be.revertedWithCustomError(agentWallet, "DailyLimitExceeded");
    });
    
    it("Should accumulate daily spending", async function () {
      const amount = DAILY_LIMIT / 2n;
      
      // First transfer - should work
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "First");
      
      // Second transfer - should work (total = daily limit)
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "Second");
      
      // Third transfer - should fail (exceeds daily limit)
      await expect(
        agentWallet.agentTransfer(walletId, recipient1.address, 1n, "Third")
      ).to.be.revertedWithCustomError(agentWallet, "DailyLimitExceeded");
    });
    
    it("Should emit AgentTransfer event", async function () {
      const amount = ethers.parseEther("1000");
      const fee = amount * 50n / 10000n;
      
      await expect(
        agentWallet.agentTransfer(walletId, recipient1.address, amount, "Event test")
      ).to.emit(agentWallet, "AgentTransfer")
        .withArgs(walletId, recipient1.address, amount, fee, "Event test", owner.address);
    });
    
    it("Should log transaction history", async function () {
      const amount = ethers.parseEther("1000");
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "History test");
      
      const history = await agentWallet.getTransactionHistory(walletId, 0, 10);
      
      expect(history.length).to.equal(1);
      expect(history[0].to).to.equal(recipient1.address);
      expect(history[0].amount).to.equal(amount);
      expect(history[0].memo).to.equal("History test");
    });
  });
  
  describe("Whitelist Mode", function () {
    let walletId;
    
    beforeEach(async function () {
      // Create wallet WITH whitelist enabled
      await agentWallet.createWallet("secure-agent", DAILY_LIMIT, true);
      walletId = await agentWallet.getWalletId(owner.address, "secure-agent");
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
    });
    
    it("Should block unapproved recipients", async function () {
      const amount = ethers.parseEther("100");
      
      await expect(
        agentWallet.agentTransfer(walletId, recipient1.address, amount, "Blocked")
      ).to.be.revertedWithCustomError(agentWallet, "RecipientNotApproved");
    });
    
    it("Should allow approved recipients", async function () {
      await agentWallet.approveRecipient(walletId, recipient1.address);
      
      const amount = ethers.parseEther("100");
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "Approved");
      
      const balance = await pncrToken.balanceOf(recipient1.address);
      expect(balance).to.equal(amount);
    });
    
    it("Should batch approve recipients", async function () {
      await agentWallet.approveRecipientsBatch(walletId, [recipient1.address, recipient2.address]);
      
      const recipients = await agentWallet.getApprovedRecipients(walletId);
      expect(recipients.length).to.equal(2);
    });
    
    it("Should allow transfer after removing whitelist mode", async function () {
      await agentWallet.setWhitelistMode(walletId, false);
      
      const amount = ethers.parseEther("100");
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "No whitelist");
      
      const balance = await pncrToken.balanceOf(recipient1.address);
      expect(balance).to.equal(amount);
    });
  });
  
  describe("Operator Management", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("managed-agent", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "managed-agent");
    });
    
    it("Should add operator", async function () {
      await agentWallet.setOperator(walletId, operator.address, true);
      
      const canSpend = await agentWallet.canSpend(walletId, operator.address);
      expect(canSpend).to.be.true;
    });
    
    it("Should remove operator", async function () {
      await agentWallet.setOperator(walletId, operator.address, true);
      await agentWallet.setOperator(walletId, operator.address, false);
      
      const operators = await agentWallet.operators(walletId, operator.address);
      expect(operators).to.be.false;
    });
    
    it("Should list operators", async function () {
      await agentWallet.setOperator(walletId, operator.address, true);
      await agentWallet.setOperator(walletId, recipient1.address, true);
      
      const operatorList = await agentWallet.getOperators(walletId);
      expect(operatorList.length).to.equal(2);
    });
  });
  
  describe("Settings Updates", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("config-agent", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "config-agent");
    });
    
    it("Should update daily limit", async function () {
      const newLimit = ethers.parseEther("20000");
      await agentWallet.setDailyLimit(walletId, newLimit);
      
      const info = await agentWallet.getWalletInfo(walletId);
      expect(info.dailyLimit).to.equal(newLimit);
    });
    
    it("Should emit LimitUpdated event", async function () {
      const newLimit = ethers.parseEther("20000");
      
      await expect(agentWallet.setDailyLimit(walletId, newLimit))
        .to.emit(agentWallet, "LimitUpdated")
        .withArgs(walletId, DAILY_LIMIT, newLimit);
    });
    
    it("Should deactivate and reactivate wallet", async function () {
      await agentWallet.deactivateWallet(walletId);
      
      let info = await agentWallet.getWalletInfo(walletId);
      expect(info.active).to.be.false;
      
      await agentWallet.reactivateWallet(walletId);
      
      info = await agentWallet.getWalletInfo(walletId);
      expect(info.active).to.be.true;
    });
  });
  
  describe("Protocol Admin", function () {
    it("Should update protocol fee", async function () {
      await agentWallet.setProtocolFee(100); // 1%
      
      const fee = await agentWallet.protocolFee();
      expect(fee).to.equal(100);
    });
    
    it("Should not exceed max fee", async function () {
      await expect(
        agentWallet.setProtocolFee(600) // 6% > 5% max
      ).to.be.revertedWithCustomError(agentWallet, "InvalidFee");
    });
    
    it("Should only allow owner to update fee", async function () {
      await expect(
        agentWallet.connect(operator).setProtocolFee(100)
      ).to.be.revertedWithCustomError(agentWallet, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("Emergency Functions", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("emergency-agent", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "emergency-agent");
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
    });
    
    it("Should emergency withdraw all funds", async function () {
      const balanceBefore = await pncrToken.balanceOf(owner.address);
      await agentWallet.emergencyWithdraw(walletId);
      const balanceAfter = await pncrToken.balanceOf(owner.address);
      
      expect(balanceAfter - balanceBefore).to.equal(DEPOSIT_AMOUNT);
      
      const info = await agentWallet.getWalletInfo(walletId);
      expect(info.balance).to.equal(0);
      expect(info.active).to.be.false;
    });
    
    it("Should emit EmergencyWithdraw event", async function () {
      await expect(agentWallet.emergencyWithdraw(walletId))
        .to.emit(agentWallet, "EmergencyWithdraw")
        .withArgs(walletId, DEPOSIT_AMOUNT);
    });
  });
  
  describe("View Functions", function () {
    let walletId;
    
    beforeEach(async function () {
      await agentWallet.createWallet("view-agent", DAILY_LIMIT, false);
      walletId = await agentWallet.getWalletId(owner.address, "view-agent");
      await agentWallet.deposit(walletId, DEPOSIT_AMOUNT);
    });
    
    it("Should return remaining allowance", async function () {
      const remaining = await agentWallet.getRemainingAllowance(walletId);
      expect(remaining).to.equal(DAILY_LIMIT);
      
      // Spend some
      const amount = ethers.parseEther("3000");
      await agentWallet.agentTransfer(walletId, recipient1.address, amount, "Test");
      
      const remainingAfter = await agentWallet.getRemainingAllowance(walletId);
      expect(remainingAfter).to.equal(DAILY_LIMIT - amount);
    });
    
    it("Should track transaction count", async function () {
      await agentWallet.agentTransfer(walletId, recipient1.address, ethers.parseEther("100"), "TX 1");
      await agentWallet.agentTransfer(walletId, recipient1.address, ethers.parseEther("100"), "TX 2");
      await agentWallet.agentTransfer(walletId, recipient1.address, ethers.parseEther("100"), "TX 3");
      
      const info = await agentWallet.getWalletInfo(walletId);
      expect(info.transactionCount).to.equal(3);
    });
    
    it("Should track total spent", async function () {
      const amount1 = ethers.parseEther("500");
      const amount2 = ethers.parseEther("300");
      
      await agentWallet.agentTransfer(walletId, recipient1.address, amount1, "TX 1");
      await agentWallet.agentTransfer(walletId, recipient1.address, amount2, "TX 2");
      
      const info = await agentWallet.getWalletInfo(walletId);
      expect(info.totalSpent).to.equal(amount1 + amount2);
    });
  });
});
