const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PNCRToken", function () {
  let token;
  let owner;
  let teamWallet;
  let ecosystemWallet;
  let liquidityWallet;
  let communityWallet;
  let user1;

  const MAX_SUPPLY = ethers.parseEther("175000000000"); // 1750억 PNCR (GPT-3 파라미터 수)
  const TEAM_AMOUNT = ethers.parseEther("26250000000");     // 262.5억 (15%)
  const ECOSYSTEM_AMOUNT = ethers.parseEther("43750000000"); // 437.5억 (25%)
  const LIQUIDITY_AMOUNT = ethers.parseEther("35000000000"); // 350억 (20%)
  const COMMUNITY_AMOUNT = ethers.parseEther("70000000000"); // 700억 (40%)

  beforeEach(async function () {
    [owner, teamWallet, ecosystemWallet, liquidityWallet, communityWallet, user1] = 
      await ethers.getSigners();

    const PNCRToken = await ethers.getContractFactory("PNCRToken");
    token = await PNCRToken.deploy(
      teamWallet.address,
      ecosystemWallet.address,
      liquidityWallet.address,
      communityWallet.address
    );
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("Pincer");
      expect(await token.symbol()).to.equal("PNCR");
    });

    it("Should have 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("Should have correct MAX_SUPPLY", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("Should have total supply equal to MAX_SUPPLY", async function () {
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should store wallet addresses correctly", async function () {
      expect(await token.teamWallet()).to.equal(teamWallet.address);
      expect(await token.ecosystemWallet()).to.equal(ecosystemWallet.address);
      expect(await token.liquidityWallet()).to.equal(liquidityWallet.address);
      expect(await token.communityWallet()).to.equal(communityWallet.address);
    });
  });

  describe("Initial Distribution", function () {
    it("Should distribute 15% to team wallet", async function () {
      expect(await token.balanceOf(teamWallet.address)).to.equal(TEAM_AMOUNT);
    });

    it("Should distribute 25% to ecosystem wallet", async function () {
      expect(await token.balanceOf(ecosystemWallet.address)).to.equal(ECOSYSTEM_AMOUNT);
    });

    it("Should distribute 20% to liquidity wallet", async function () {
      expect(await token.balanceOf(liquidityWallet.address)).to.equal(LIQUIDITY_AMOUNT);
    });

    it("Should distribute 40% to community wallet", async function () {
      expect(await token.balanceOf(communityWallet.address)).to.equal(COMMUNITY_AMOUNT);
    });

    it("Should distribute exactly 100%", async function () {
      const total = TEAM_AMOUNT + ECOSYSTEM_AMOUNT + LIQUIDITY_AMOUNT + COMMUNITY_AMOUNT;
      expect(total).to.equal(MAX_SUPPLY);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("1000");
      await token.connect(teamWallet).transfer(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        token.connect(user1).transfer(teamWallet.address, amount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Burn", function () {
    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("1000000"); // 100만 PNCR
      const initialBalance = await token.balanceOf(teamWallet.address);
      
      await token.connect(teamWallet).burn(burnAmount);
      
      expect(await token.balanceOf(teamWallet.address)).to.equal(initialBalance - burnAmount);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY - burnAmount);
    });

    it("Should allow burnFrom with approval", async function () {
      const burnAmount = ethers.parseEther("1000");
      
      await token.connect(teamWallet).approve(user1.address, burnAmount);
      await token.connect(user1).burnFrom(teamWallet.address, burnAmount);
      
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY - burnAmount);
    });

    it("Should fail to burn more than balance", async function () {
      const burnAmount = ethers.parseEther("30000000000"); // 300억 (팀 잔액 262.5억 초과)
      
      await expect(
        token.connect(teamWallet).burn(burnAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("No Minting", function () {
    it("Should not have a mint function", async function () {
      // mint 함수가 없으므로 호출 시도하면 에러
      expect(token.mint).to.be.undefined;
    });
  });

  describe("Ownership", function () {
    it("Should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should allow owner to transfer ownership", async function () {
      await token.transferOwnership(user1.address);
      expect(await token.owner()).to.equal(user1.address);
    });

    it("Should allow owner to renounce ownership", async function () {
      await token.renounceOwnership();
      expect(await token.owner()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Zero Address Check", function () {
    it("Should revert if team wallet is zero address", async function () {
      const PNCRToken = await ethers.getContractFactory("PNCRToken");
      await expect(
        PNCRToken.deploy(
          ethers.ZeroAddress,
          ecosystemWallet.address,
          liquidityWallet.address,
          communityWallet.address
        )
      ).to.be.revertedWith("Team wallet is zero address");
    });

    it("Should revert if ecosystem wallet is zero address", async function () {
      const PNCRToken = await ethers.getContractFactory("PNCRToken");
      await expect(
        PNCRToken.deploy(
          teamWallet.address,
          ethers.ZeroAddress,
          liquidityWallet.address,
          communityWallet.address
        )
      ).to.be.revertedWith("Ecosystem wallet is zero address");
    });
  });
});
