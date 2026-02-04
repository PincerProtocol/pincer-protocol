const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SimpleEscrow", function () {
  let token;
  let escrow;
  let owner;
  let feeRecipient;
  let buyer;
  let seller;
  let other;

  const TOTAL_SUPPLY = ethers.parseEther("1000000000");
  const ESCROW_DURATION = 48 * 60 * 60; // 48 hours in seconds
  const FEE_RATE = 200n; // 2% = 200 basis points

  beforeEach(async function () {
    [owner, feeRecipient, buyer, seller, other] = await ethers.getSigners();

    // Deploy PNCRToken
    const PNCRToken = await ethers.getContractFactory("PNCRToken");
    token = await PNCRToken.deploy(
      owner.address,  // team
      owner.address,  // ecosystem
      owner.address,  // liquidity
      buyer.address   // community (buyer gets tokens)
    );
    await token.waitForDeployment();

    // Deploy SimpleEscrow
    const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
    escrow = await SimpleEscrow.deploy(
      await token.getAddress(),
      feeRecipient.address
    );
    await escrow.waitForDeployment();

    // Approve escrow to spend buyer's tokens
    const buyerBalance = await token.balanceOf(buyer.address);
    await token.connect(buyer).approve(await escrow.getAddress(), buyerBalance);
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await escrow.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct fee recipient", async function () {
      expect(await escrow.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct fee rate (2%)", async function () {
      expect(await escrow.feeRate()).to.equal(200);
    });

    it("Should set the correct owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should revert if token address is zero", async function () {
      const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
      await expect(
        SimpleEscrow.deploy(ethers.ZeroAddress, feeRecipient.address)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("Should revert if fee recipient is zero", async function () {
      const SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");
      await expect(
        SimpleEscrow.deploy(await token.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });
  });

  describe("createEscrow", function () {
    const amount = ethers.parseEther("100");

    it("Should create escrow successfully", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);

      const txn = await escrow.getTransaction(1);
      expect(txn.id).to.equal(1);
      expect(txn.buyer).to.equal(buyer.address);
      expect(txn.seller).to.equal(seller.address);
      expect(txn.amount).to.equal(amount);
      expect(txn.status).to.equal(0); // PENDING
    });

    it("Should calculate fee correctly (2%)", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);

      const txn = await escrow.getTransaction(1);
      const expectedFee = (amount * FEE_RATE) / 10000n;
      expect(txn.fee).to.equal(expectedFee);
    });

    it("Should transfer tokens to escrow", async function () {
      const escrowAddress = await escrow.getAddress();
      const balanceBefore = await token.balanceOf(escrowAddress);

      await escrow.connect(buyer).createEscrow(seller.address, amount);

      const balanceAfter = await token.balanceOf(escrowAddress);
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should set correct expiry time (48 hours)", async function () {
      const tx = await escrow.connect(buyer).createEscrow(seller.address, amount);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const txn = await escrow.getTransaction(1);
      expect(txn.expiresAt).to.equal(block.timestamp + ESCROW_DURATION);
    });

    it("Should emit EscrowCreated event", async function () {
      const expectedFee = (amount * FEE_RATE) / 10000n;
      
      await expect(escrow.connect(buyer).createEscrow(seller.address, amount))
        .to.emit(escrow, "EscrowCreated");
      
      // Verify event args separately to avoid timestamp race
      const txn = await escrow.getTransaction(1);
      expect(txn.buyer).to.equal(buyer.address);
      expect(txn.seller).to.equal(seller.address);
      expect(txn.amount).to.equal(amount);
      expect(txn.fee).to.equal(expectedFee);
    });

    it("Should increment transaction count", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
      expect(await escrow.transactionCount()).to.equal(1);

      await escrow.connect(buyer).createEscrow(seller.address, amount);
      expect(await escrow.transactionCount()).to.equal(2);
    });

    it("Should revert if seller is zero address", async function () {
      await expect(
        escrow.connect(buyer).createEscrow(ethers.ZeroAddress, amount)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        escrow.connect(buyer).createEscrow(seller.address, 0)
      ).to.be.revertedWithCustomError(escrow, "ZeroAmount");
    });

    it("Should revert if buyer and seller are the same", async function () {
      await expect(
        escrow.connect(buyer).createEscrow(buyer.address, amount)
      ).to.be.revertedWithCustomError(escrow, "SameBuyerAndSeller");
    });
  });

  describe("confirmDelivery", function () {
    const amount = ethers.parseEther("100");

    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
    });

    it("Should complete escrow successfully", async function () {
      await escrow.connect(buyer).confirmDelivery(1);

      const txn = await escrow.getTransaction(1);
      expect(txn.status).to.equal(1); // COMPLETED
    });

    it("Should transfer correct amount to seller (minus fee)", async function () {
      const sellerBalanceBefore = await token.balanceOf(seller.address);
      const expectedFee = (amount * FEE_RATE) / 10000n;
      const expectedSellerAmount = amount - expectedFee;

      await escrow.connect(buyer).confirmDelivery(1);

      const sellerBalanceAfter = await token.balanceOf(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedSellerAmount);
    });

    it("Should transfer fee to feeRecipient", async function () {
      const feeBalanceBefore = await token.balanceOf(feeRecipient.address);
      const expectedFee = (amount * FEE_RATE) / 10000n;

      await escrow.connect(buyer).confirmDelivery(1);

      const feeBalanceAfter = await token.balanceOf(feeRecipient.address);
      expect(feeBalanceAfter - feeBalanceBefore).to.equal(expectedFee);
    });

    it("Should emit EscrowCompleted event", async function () {
      const expectedFee = (amount * FEE_RATE) / 10000n;
      const expectedSellerAmount = amount - expectedFee;

      await expect(escrow.connect(buyer).confirmDelivery(1))
        .to.emit(escrow, "EscrowCompleted")
        .withArgs(1, expectedSellerAmount, expectedFee);
    });

    it("Should revert if not buyer", async function () {
      await expect(
        escrow.connect(seller).confirmDelivery(1)
      ).to.be.revertedWithCustomError(escrow, "NotBuyer");
    });

    it("Should revert if transaction doesn't exist", async function () {
      await expect(
        escrow.connect(buyer).confirmDelivery(999)
      ).to.be.revertedWithCustomError(escrow, "InvalidTransaction");
    });

    it("Should revert if already completed", async function () {
      await escrow.connect(buyer).confirmDelivery(1);

      await expect(
        escrow.connect(buyer).confirmDelivery(1)
      ).to.be.revertedWithCustomError(escrow, "NotPending");
    });
  });

  describe("cancelEscrow", function () {
    const amount = ethers.parseEther("100");

    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
    });

    it("Should cancel and refund after expiry", async function () {
      // Fast forward 48 hours
      await time.increase(ESCROW_DURATION + 1);

      const buyerBalanceBefore = await token.balanceOf(buyer.address);
      await escrow.connect(buyer).cancelEscrow(1);
      const buyerBalanceAfter = await token.balanceOf(buyer.address);

      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(amount);

      const txn = await escrow.getTransaction(1);
      expect(txn.status).to.equal(2); // CANCELLED
    });

    it("Should emit EscrowCancelled event", async function () {
      await time.increase(ESCROW_DURATION + 1);

      await expect(escrow.connect(buyer).cancelEscrow(1))
        .to.emit(escrow, "EscrowCancelled")
        .withArgs(1);
    });

    it("Should revert if not expired", async function () {
      await expect(
        escrow.connect(buyer).cancelEscrow(1)
      ).to.be.revertedWithCustomError(escrow, "NotExpired");
    });

    it("Should revert if not buyer", async function () {
      await time.increase(ESCROW_DURATION + 1);

      await expect(
        escrow.connect(seller).cancelEscrow(1)
      ).to.be.revertedWithCustomError(escrow, "NotBuyer");
    });

    it("Should revert if already completed", async function () {
      await escrow.connect(buyer).confirmDelivery(1);
      await time.increase(ESCROW_DURATION + 1);

      await expect(
        escrow.connect(buyer).cancelEscrow(1)
      ).to.be.revertedWithCustomError(escrow, "NotPending");
    });
  });

  describe("Admin Functions", function () {
    describe("setFeeRecipient", function () {
      it("Should update fee recipient", async function () {
        await escrow.setFeeRecipient(other.address);
        expect(await escrow.feeRecipient()).to.equal(other.address);
      });

      it("Should emit FeeRecipientUpdated event", async function () {
        await expect(escrow.setFeeRecipient(other.address))
          .to.emit(escrow, "FeeRecipientUpdated")
          .withArgs(feeRecipient.address, other.address);
      });

      it("Should revert if not owner", async function () {
        await expect(
          escrow.connect(buyer).setFeeRecipient(other.address)
        ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
      });

      it("Should revert if zero address", async function () {
        await expect(
          escrow.setFeeRecipient(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
      });
    });

    describe("setFeeRate", function () {
      it("Should update fee rate", async function () {
        await escrow.setFeeRate(100); // 1%
        expect(await escrow.feeRate()).to.equal(100);
      });

      it("Should emit FeeRateUpdated event", async function () {
        await expect(escrow.setFeeRate(100))
          .to.emit(escrow, "FeeRateUpdated")
          .withArgs(200, 100);
      });

      it("Should revert if rate exceeds max (5%)", async function () {
        await expect(
          escrow.setFeeRate(501)
        ).to.be.revertedWithCustomError(escrow, "FeeRateTooHigh");
      });

      it("Should revert if not owner", async function () {
        await expect(
          escrow.connect(buyer).setFeeRate(100)
        ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
      });

      it("Should allow zero fee rate", async function () {
        await escrow.setFeeRate(0);
        expect(await escrow.feeRate()).to.equal(0);
      });
    });
  });

  describe("View Functions", function () {
    it("Should return correct escrow balance", async function () {
      const amount = ethers.parseEther("100");
      await escrow.connect(buyer).createEscrow(seller.address, amount);

      expect(await escrow.getEscrowBalance()).to.equal(amount);
    });

    it("Should return empty transaction for non-existent ID", async function () {
      const txn = await escrow.getTransaction(999);
      expect(txn.id).to.equal(0);
    });
  });

  describe("Integration: Full Flow", function () {
    it("Should handle complete transaction flow", async function () {
      const amount = ethers.parseEther("50");
      const expectedFee = (amount * FEE_RATE) / 10000n;
      const expectedSellerAmount = amount - expectedFee;

      // Initial balances
      const buyerInitial = await token.balanceOf(buyer.address);
      const sellerInitial = await token.balanceOf(seller.address);
      const feeRecipientInitial = await token.balanceOf(feeRecipient.address);

      // Create escrow
      await escrow.connect(buyer).createEscrow(seller.address, amount);

      // Verify buyer lost tokens
      expect(await token.balanceOf(buyer.address)).to.equal(buyerInitial - amount);

      // Confirm delivery
      await escrow.connect(buyer).confirmDelivery(1);

      // Verify final balances
      expect(await token.balanceOf(seller.address)).to.equal(sellerInitial + expectedSellerAmount);
      expect(await token.balanceOf(feeRecipient.address)).to.equal(feeRecipientInitial + expectedFee);

      // Verify escrow is empty
      expect(await escrow.getEscrowBalance()).to.equal(0);
    });

    it("Should handle multiple concurrent escrows", async function () {
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("50");

      // Create two escrows
      await escrow.connect(buyer).createEscrow(seller.address, amount1);
      await escrow.connect(buyer).createEscrow(other.address, amount2);

      expect(await escrow.transactionCount()).to.equal(2);
      expect(await escrow.getEscrowBalance()).to.equal(amount1 + amount2);

      // Complete first, cancel second
      await escrow.connect(buyer).confirmDelivery(1);
      
      await time.increase(ESCROW_DURATION + 1);
      await escrow.connect(buyer).cancelEscrow(2);

      expect(await escrow.getEscrowBalance()).to.equal(0);
    });
  });

  describe("Minimum Amount", function () {
    it("Should revert if below minimum amount", async function () {
      const smallAmount = ethers.parseEther("0.5"); // Below 1 PNCR minimum
      
      await expect(
        escrow.connect(buyer).createEscrow(seller.address, smallAmount)
      ).to.be.revertedWithCustomError(escrow, "BelowMinAmount");
    });

    it("Should allow owner to change minimum amount", async function () {
      await escrow.setMinAmount(ethers.parseEther("10"));
      expect(await escrow.minAmount()).to.equal(ethers.parseEther("10"));
    });

    it("Should emit MinAmountUpdated event", async function () {
      const oldAmount = await escrow.minAmount();
      const newAmount = ethers.parseEther("5");
      
      await expect(escrow.setMinAmount(newAmount))
        .to.emit(escrow, "MinAmountUpdated")
        .withArgs(oldAmount, newAmount);
    });
  });

  describe("Seller Protection", function () {
    const amount = ethers.parseEther("100");
    const SELLER_CLAIM_WINDOW = 24 * 60 * 60; // 24 hours

    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
    });

    describe("submitDeliveryProof", function () {
      it("Should allow seller to submit delivery proof", async function () {
        await expect(escrow.connect(seller).submitDeliveryProof(1))
          .to.emit(escrow, "DeliveryProofSubmitted")
          .withArgs(1, seller.address);

        const txn = await escrow.getTransaction(1);
        expect(txn.sellerClaimed).to.be.true;
        expect(txn.sellerClaimTime).to.be.gt(0);
      });

      it("Should revert if not seller", async function () {
        await expect(
          escrow.connect(buyer).submitDeliveryProof(1)
        ).to.be.revertedWithCustomError(escrow, "NotSeller");
      });

      it("Should revert if already claimed", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        
        await expect(
          escrow.connect(seller).submitDeliveryProof(1)
        ).to.be.revertedWithCustomError(escrow, "AlreadyClaimed");
      });

      it("Should revert if not pending", async function () {
        await escrow.connect(buyer).confirmDelivery(1);
        
        await expect(
          escrow.connect(seller).submitDeliveryProof(1)
        ).to.be.revertedWithCustomError(escrow, "NotPending");
      });
    });

    describe("autoComplete", function () {
      it("Should auto-complete after 24h from seller claim", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        
        // Fast forward 24 hours + 1 second
        await time.increase(SELLER_CLAIM_WINDOW + 1);

        const sellerBalanceBefore = await token.balanceOf(seller.address);
        await escrow.autoComplete(1);
        const sellerBalanceAfter = await token.balanceOf(seller.address);

        const txn = await escrow.getTransaction(1);
        expect(txn.status).to.equal(1); // COMPLETED
        expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
      });

      it("Should revert if seller hasn't claimed", async function () {
        await time.increase(SELLER_CLAIM_WINDOW + 1);
        
        await expect(
          escrow.autoComplete(1)
        ).to.be.revertedWithCustomError(escrow, "InvalidTransaction");
      });

      it("Should revert if 24h hasn't passed", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        
        // Only 12 hours passed
        await time.increase(12 * 60 * 60);
        
        await expect(
          escrow.autoComplete(1)
        ).to.be.revertedWithCustomError(escrow, "ClaimWindowNotPassed");
      });

      it("Should allow anyone to call autoComplete", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        await time.increase(SELLER_CLAIM_WINDOW + 1);
        
        // Other user can trigger autoComplete
        await expect(escrow.connect(other).autoComplete(1))
          .to.emit(escrow, "EscrowCompleted");
      });
    });

    describe("cancelEscrow with seller claim", function () {
      it("Should revert cancel if seller has claimed", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        await time.increase(ESCROW_DURATION + 1);
        
        await expect(
          escrow.connect(buyer).cancelEscrow(1)
        ).to.be.revertedWithCustomError(escrow, "AlreadyClaimed");
      });
    });
  });

  describe("Dispute", function () {
    const amount = ethers.parseEther("100");

    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
    });

    it("Should allow buyer to open dispute", async function () {
      await expect(escrow.connect(buyer).openDispute(1))
        .to.emit(escrow, "DisputeOpened")
        .withArgs(1, buyer.address);

      const txn = await escrow.getTransaction(1);
      expect(txn.status).to.equal(3); // DISPUTED
    });

    it("Should allow seller to open dispute", async function () {
      await expect(escrow.connect(seller).openDispute(1))
        .to.emit(escrow, "DisputeOpened")
        .withArgs(1, seller.address);
    });

    it("Should revert if not participant", async function () {
      await expect(
        escrow.connect(other).openDispute(1)
      ).to.be.revertedWithCustomError(escrow, "NotParticipant");
    });

    it("Should revert if not pending", async function () {
      await escrow.connect(buyer).confirmDelivery(1);
      
      await expect(
        escrow.connect(buyer).openDispute(1)
      ).to.be.revertedWithCustomError(escrow, "NotPending");
    });
  });

  describe("Pausable", function () {
    const amount = ethers.parseEther("100");

    it("Should allow owner to pause", async function () {
      await escrow.pause();
      expect(await escrow.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await escrow.pause();
      await escrow.unpause();
      expect(await escrow.paused()).to.be.false;
    });

    it("Should revert createEscrow when paused", async function () {
      await escrow.pause();
      
      await expect(
        escrow.connect(buyer).createEscrow(seller.address, amount)
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });

    it("Should revert confirmDelivery when paused", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
      await escrow.pause();
      
      await expect(
        escrow.connect(buyer).confirmDelivery(1)
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });

    it("Should work after unpause", async function () {
      await escrow.pause();
      await escrow.unpause();
      
      await expect(
        escrow.connect(buyer).createEscrow(seller.address, amount)
      ).to.emit(escrow, "EscrowCreated");
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(
        escrow.connect(buyer).pause()
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions - Extended", function () {
    const amount = ethers.parseEther("100");
    const SELLER_CLAIM_WINDOW = 24 * 60 * 60;

    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
    });

    describe("canAutoComplete", function () {
      it("Should return false if seller hasn't claimed", async function () {
        expect(await escrow.canAutoComplete(1)).to.be.false;
      });

      it("Should return false if 24h hasn't passed", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        expect(await escrow.canAutoComplete(1)).to.be.false;
      });

      it("Should return true after 24h from seller claim", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        await time.increase(SELLER_CLAIM_WINDOW + 1);
        expect(await escrow.canAutoComplete(1)).to.be.true;
      });

      it("Should return false if not pending", async function () {
        await escrow.connect(buyer).confirmDelivery(1);
        expect(await escrow.canAutoComplete(1)).to.be.false;
      });
    });

    describe("canCancel", function () {
      it("Should return false before expiry", async function () {
        expect(await escrow.canCancel(1)).to.be.false;
      });

      it("Should return true after expiry (no seller claim)", async function () {
        await time.increase(ESCROW_DURATION + 1);
        expect(await escrow.canCancel(1)).to.be.true;
      });

      it("Should return false if seller has claimed", async function () {
        await escrow.connect(seller).submitDeliveryProof(1);
        await time.increase(ESCROW_DURATION + 1);
        expect(await escrow.canCancel(1)).to.be.false;
      });

      it("Should return false if not pending", async function () {
        await escrow.connect(buyer).confirmDelivery(1);
        await time.increase(ESCROW_DURATION + 1);
        expect(await escrow.canCancel(1)).to.be.false;
      });
    });
  });

  describe("Emergency Withdraw", function () {
    const amount = ethers.parseEther("100");

    it("Should allow owner to emergency withdraw disputed escrow", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
      await escrow.connect(buyer).openDispute(1);

      const balanceBefore = await token.balanceOf(buyer.address);
      await escrow.emergencyWithdraw(1, buyer.address);
      const balanceAfter = await token.balanceOf(buyer.address);

      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should revert if not disputed", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);

      await expect(
        escrow.emergencyWithdraw(1, buyer.address)
      ).to.be.reverted;
    });

    it("Should revert if not owner", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, amount);
      await escrow.connect(buyer).openDispute(1);

      await expect(
        escrow.connect(buyer).emergencyWithdraw(1, buyer.address)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });
});
