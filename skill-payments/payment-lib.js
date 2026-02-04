/**
 * Pincer Protocol - Skill Payment Library
 * OpenClaw 스킬에서 PNCR 결제를 처리하는 라이브러리
 * 
 * @author Pincer Protocol 🦞
 */

const { ethers } = require('ethers');

// Base Sepolia 설정 (메인넷 전환 시 변경)
const CONFIG = {
  rpcUrl: 'https://sepolia.base.org',
  chainId: 84532,
  
  // v2.0 컨트랙트 주소 (175B Supply)
  contracts: {
    pncrToken: '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
    escrow: '0xE33FCd5AB5E739a0E051E543607374c6B58bCe35',
  }
};

// 간단한 ERC20 ABI
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

/**
 * PincerPayment 클래스
 * 스킬 결제를 위한 메인 클래스
 */
class PincerPayment {
  constructor(privateKey, config = CONFIG) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.token = new ethers.Contract(
        config.contracts.pncrToken,
        ERC20_ABI,
        this.wallet
      );
    } else {
      this.token = new ethers.Contract(
        config.contracts.pncrToken,
        ERC20_ABI,
        this.provider
      );
    }
  }

  /**
   * PNCR 잔액 조회
   * @param {string} address - 지갑 주소
   * @returns {Promise<{balance: string, formatted: string}>}
   */
  async getBalance(address) {
    const balance = await this.token.balanceOf(address);
    const decimals = await this.token.decimals();
    return {
      balance: balance.toString(),
      formatted: ethers.formatUnits(balance, decimals),
    };
  }

  /**
   * 잔액이 충분한지 확인
   * @param {string} address - 지갑 주소
   * @param {string|number} amount - 필요한 PNCR 양
   * @returns {Promise<boolean>}
   */
  async hasEnoughBalance(address, amount) {
    const balance = await this.token.balanceOf(address);
    const required = ethers.parseEther(amount.toString());
    return balance >= required;
  }

  /**
   * PNCR 전송 (직접 결제)
   * @param {string} to - 받는 주소 (스킬 제작자)
   * @param {string|number} amount - PNCR 양
   * @returns {Promise<{success: boolean, txHash?: string, error?: string}>}
   */
  async pay(to, amount) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not configured. Provide privateKey.');
      }

      const amountWei = ethers.parseEther(amount.toString());
      
      // 잔액 확인
      const balance = await this.token.balanceOf(this.wallet.address);
      if (balance < amountWei) {
        return {
          success: false,
          error: `Insufficient balance. Required: ${amount} PNCR, Available: ${ethers.formatEther(balance)} PNCR`
        };
      }

      // 전송
      const tx = await this.token.transfer(to, amountWei);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
        to: to,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 스킬 결제 실행 (결제 후 콜백 실행)
   * @param {Object} options
   * @param {string} options.skillCreator - 스킬 제작자 주소
   * @param {number} options.price - 스킬 가격 (PNCR)
   * @param {Function} options.onSuccess - 결제 성공 시 실행할 함수
   * @param {Function} options.onFailure - 결제 실패 시 실행할 함수
   */
  async payForSkill({ skillCreator, price, onSuccess, onFailure }) {
    console.log(`🦞 Pincer Payment: ${price} PNCR to ${skillCreator}`);
    
    const result = await this.pay(skillCreator, price);
    
    if (result.success) {
      console.log(`✅ Payment successful! TX: ${result.txHash}`);
      if (onSuccess) {
        return await onSuccess(result);
      }
      return result;
    } else {
      console.log(`❌ Payment failed: ${result.error}`);
      if (onFailure) {
        return await onFailure(result);
      }
      throw new Error(result.error);
    }
  }
}

/**
 * 스킬에 결제 요구사항 추가하는 데코레이터/래퍼
 * @param {Object} options
 * @param {string} options.creator - 스킬 제작자 주소
 * @param {number} options.price - 가격 (PNCR)
 * @param {Function} skillFunction - 실제 스킬 함수
 */
function paidSkill({ creator, price }, skillFunction) {
  return async function(payment, ...args) {
    if (!payment || !(payment instanceof PincerPayment)) {
      throw new Error('PincerPayment instance required as first argument');
    }

    // 결제 실행
    const paymentResult = await payment.pay(creator, price);
    
    if (!paymentResult.success) {
      return {
        success: false,
        error: `Payment required: ${price} PNCR. ${paymentResult.error}`,
      };
    }

    // 결제 성공 → 스킬 실행
    console.log(`💰 Paid ${price} PNCR. Executing skill...`);
    const result = await skillFunction(...args);
    
    return {
      success: true,
      payment: paymentResult,
      result: result,
    };
  };
}

/**
 * 간편 결제 검증 미들웨어
 * Express/API 라우트에서 사용
 */
function requirePayment(creatorAddress, price) {
  return async (req, res, next) => {
    const { txHash } = req.body;
    
    if (!txHash) {
      return res.status(402).json({
        error: 'Payment required',
        price: price,
        currency: 'PNCR',
        recipient: creatorAddress,
        message: `Please pay ${price} PNCR to ${creatorAddress} and include txHash in request`,
      });
    }

    // TODO: 실제 트랜잭션 검증 로직
    // - txHash가 유효한지
    // - 금액이 맞는지
    // - 받는 주소가 맞는지
    
    next();
  };
}

// CLI 사용을 위한 간편 함수
async function quickPay(privateKey, to, amount) {
  const payment = new PincerPayment(privateKey);
  return await payment.pay(to, amount);
}

async function checkBalance(address) {
  const payment = new PincerPayment(null);
  return await payment.getBalance(address);
}

module.exports = {
  PincerPayment,
  paidSkill,
  requirePayment,
  quickPay,
  checkBalance,
  CONFIG,
};
