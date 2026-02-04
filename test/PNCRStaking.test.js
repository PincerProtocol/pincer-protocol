const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PNCRStaking", function () {
  let pncrToken;
  let staking;
  let owner;
  let staker1;
  let staker2;

  const INITIAL_SUPPLY = ethers.parseEther("1000000000"); // 1B tokens
  const BRONZE_MIN = ethers.parseEther("1000");
  const SILVER_MIN = ethers.parseEther("10000");
  const GOLD_MIN = ethers.parseEther("100000");
  const PLATINUM_MIN = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, staker1, staker2] = await ethers.getSigners();

    // Deploy PNCR Token (requires 4 wallet addresses)
    const PNCRToken = await ethers.getContractFactory("PNCRToken");
    pncrToken = await PNCRToken.deploy(
      owner.address,  // team
      owner.address,  // ecosystem
      owner.address,  // liquidity
      owner.address   // community
    );
    await pncrToken.waitForDeployment();

    // Deploy Staking
    const PNCRStaking = await ethers.getContractFactory("PNCRStaking");
    staking = await PNCRStaking.deploy(await pncrToken.getAddress());
    await staking.waitForDeployment();

    // Transfer tokens to stakers
    await pncrToken.transfer(staker1.address, ethers.parseEther("2000000"));
    await pncrToken.transfer(staker2.address, ethers.parseEther("500000"));

    // Fund reward pool
    await pncrToken.approve(await staking.getAddress(), ethers.parseEther("10000000"));
    await staking.fundRewardPool(ethers.parseEther("10000000"));
  });

  describe("Deployment", function () {
    it("Should set correct token address", async function () {
      expect(await staking.pncrToken()).to.equal(await pncrToken.getAddress());
    });

    it("Should have funded reward pool", async function () {
      expect(await staking.rewardPool()).to.equal(ethers.parseEther("10000000"));
    });
  });

  describe("Staking", function () {
    it("Should reject stake below minimum", async function () {
      const amount = ethers.parseEther("500");
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await expect(staking.connect(staker1).stake(amount))
        .to.be.revertedWith("Below minimum stake");
    });

    it("Should stake Bronze tier correctly", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await expect(staking.connect(staker1).stake(amount))
        .to.emit(staking, "Staked");

      const info = await staking.getStakeInfo(staker1.address);
      expect(info.amount).to.equal(amount);
      expect(info.tier).to.equal(1); // Bronze = 1
    });

    it("Should stake Silver tier correctly", async function () {
      const amount = SILVER_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await staking.connect(staker1).stake(amount);

      const info = await staking.getStakeInfo(staker1.address);
      expect(info.tier).to.equal(2); // Silver = 2
    });

    it("Should stake Gold tier correctly", async function () {
      const amount = GOLD_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await staking.connect(staker1).stake(amount);

      const info = await staking.getStakeInfo(staker1.address);
      expect(info.tier).to.equal(3); // Gold = 3
    });

    it("Should stake Platinum tier correctly", async function () {
      const amount = PLATINUM_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await staking.connect(staker1).stake(amount);

      const info = await staking.getStakeInfo(staker1.address);
      expect(info.tier).to.equal(4); // Platinum = 4
    });

    it("Should upgrade tier when adding more stake", async function () {
      // Start with Bronze
      await pncrToken.connect(staker1).approve(await staking.getAddress(), SILVER_MIN);
      await staking.connect(staker1).stake(BRONZE_MIN);
      
      let info = await staking.getStakeInfo(staker1.address);
      expect(info.tier).to.equal(1); // Bronze

      // Add to reach Silver
      await staking.connect(staker1).stake(SILVER_MIN - BRONZE_MIN);
      
      info = await staking.getStakeInfo(staker1.address);
      expect(info.tier).to.equal(2); // Silver
    });

    it("Should update total staked", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      
      await staking.connect(staker1).stake(amount);
      
      expect(await staking.totalStaked()).to.equal(amount);
    });
  });

  describe("Rewards", function () {
    it("Should accumulate rewards over time", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const pending = await staking.pendingRewards(staker1.address);
      expect(pending).to.be.gt(0);
    });

    it("Should claim rewards correctly", async function () {
      const amount = SILVER_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const pendingBefore = await staking.pendingRewards(staker1.address);
      const balanceBefore = await pncrToken.balanceOf(staker1.address);

      await staking.connect(staker1).claimRewards();

      const balanceAfter = await pncrToken.balanceOf(staker1.address);
      expect(balanceAfter - balanceBefore).to.be.closeTo(pendingBefore, ethers.parseEther("1"));
    });

    it("Should have higher rewards for higher tiers", async function () {
      // Staker1 stakes Bronze
      await pncrToken.connect(staker1).approve(await staking.getAddress(), BRONZE_MIN);
      await staking.connect(staker1).stake(BRONZE_MIN);

      // Staker2 stakes Gold (same time)
      await pncrToken.connect(staker2).approve(await staking.getAddress(), GOLD_MIN);
      await staking.connect(staker2).stake(GOLD_MIN);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const bronzeRewards = await staking.pendingRewards(staker1.address);
      const goldRewards = await staking.pendingRewards(staker2.address);

      // Gold should earn more (higher APY and more staked)
      expect(goldRewards).to.be.gt(bronzeRewards);
    });
  });

  describe("Unstaking", function () {
    it("Should reject unstake before lock period", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      await expect(staking.connect(staker1).unstake())
        .to.be.revertedWith("Still locked");
    });

    it("Should allow unstake after lock period (Bronze = 7 days)", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      // Fast forward 7 days + 1 second
      await time.increase(7 * 24 * 60 * 60 + 1);

      const balanceBefore = await pncrToken.balanceOf(staker1.address);
      await staking.connect(staker1).unstake();
      const balanceAfter = await pncrToken.balanceOf(staker1.address);

      // Should receive principal + rewards
      expect(balanceAfter).to.be.gt(balanceBefore);
      expect(balanceAfter - balanceBefore).to.be.gte(amount);
    });

    it("Should reset stake info after unstake", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      await time.increase(7 * 24 * 60 * 60 + 1);
      await staking.connect(staker1).unstake();

      const info = await staking.getStakeInfo(staker1.address);
      expect(info.amount).to.equal(0);
      expect(info.tier).to.equal(0); // None
    });

    it("Should update total staked after unstake", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      expect(await staking.totalStaked()).to.equal(amount);

      await time.increase(7 * 24 * 60 * 60 + 1);
      await staking.connect(staker1).unstake();

      expect(await staking.totalStaked()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct tier for amount", async function () {
      expect(await staking.getTierForAmount(ethers.parseEther("500"))).to.equal(0);
      expect(await staking.getTierForAmount(BRONZE_MIN)).to.equal(1);
      expect(await staking.getTierForAmount(SILVER_MIN)).to.equal(2);
      expect(await staking.getTierForAmount(GOLD_MIN)).to.equal(3);
      expect(await staking.getTierForAmount(PLATINUM_MIN)).to.equal(4);
    });

    it("Should return correct APY for tier", async function () {
      expect(await staking.getAPY(0)).to.equal(0);
      expect(await staking.getAPY(1)).to.equal(1000);  // 10%
      expect(await staking.getAPY(2)).to.equal(2000);  // 20%
      expect(await staking.getAPY(3)).to.equal(3500);  // 35%
      expect(await staking.getAPY(4)).to.equal(5000);  // 50%
    });

    it("Should correctly report canUnstake", async function () {
      const amount = BRONZE_MIN;
      await pncrToken.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      expect(await staking.canUnstake(staker1.address)).to.be.false;

      await time.increase(7 * 24 * 60 * 60 + 1);

      expect(await staking.canUnstake(staker1.address)).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const amount = ethers.parseEther("1000");
      await pncrToken.transfer(await staking.getAddress(), amount);

      const balanceBefore = await pncrToken.balanceOf(owner.address);
      await staking.emergencyWithdraw(await pncrToken.getAddress(), amount);
      const balanceAfter = await pncrToken.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should reject emergency withdraw from non-owner", async function () {
      await expect(
        staking.connect(staker1).emergencyWithdraw(await pncrToken.getAddress(), 1000)
      ).to.be.reverted;
    });
  });
});
