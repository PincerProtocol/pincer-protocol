/**
 * 유료 스킬 예시: Market Analysis Skill
 * 
 * 이 스킬은 10 PNCR 결제 후 시장 분석을 제공합니다.
 * 
 * @author Pincer Protocol 🦞
 */

const { PincerPayment, paidSkill } = require('../payment-lib');

// ============================================
// 스킬 설정
// ============================================

const SKILL_CONFIG = {
  name: 'Market Analysis',
  description: '암호화폐 시장 분석 리포트 생성',
  creator: '0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89', // 스킬 제작자 주소
  price: 10, // 10 PNCR
};

// ============================================
// 실제 스킬 로직
// ============================================

async function analyzeMarket(token = 'BTC') {
  // 실제로는 여기서 API 호출, 분석 로직 등 수행
  console.log(`📊 Analyzing ${token} market...`);
  
  // 시뮬레이션 결과
  return {
    token: token,
    analysis: {
      trend: 'bullish',
      support: 42000,
      resistance: 48000,
      recommendation: 'HOLD',
      confidence: 0.75,
    },
    generatedAt: new Date().toISOString(),
  };
}

// ============================================
// 유료 스킬로 래핑
// ============================================

const paidMarketAnalysis = paidSkill(
  { creator: SKILL_CONFIG.creator, price: SKILL_CONFIG.price },
  analyzeMarket
);

// ============================================
// 사용 예시
// ============================================

async function main() {
  // 환경변수에서 프라이빗 키 가져오기
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY 환경변수가 필요합니다');
    console.log('\n사용법:');
    console.log('  PRIVATE_KEY=0x... node paid-skill-example.js');
    process.exit(1);
  }

  console.log('🦞 Pincer Protocol - Paid Skill Example\n');
  console.log(`스킬: ${SKILL_CONFIG.name}`);
  console.log(`가격: ${SKILL_CONFIG.price} PNCR`);
  console.log(`제작자: ${SKILL_CONFIG.creator}\n`);

  // PincerPayment 인스턴스 생성
  const payment = new PincerPayment(privateKey);

  // 잔액 확인
  const balance = await payment.getBalance(payment.wallet.address);
  console.log(`💰 내 잔액: ${balance.formatted} PNCR\n`);

  // 잔액 충분한지 확인
  const hasEnough = await payment.hasEnoughBalance(
    payment.wallet.address, 
    SKILL_CONFIG.price
  );

  if (!hasEnough) {
    console.error(`❌ 잔액 부족! ${SKILL_CONFIG.price} PNCR 필요`);
    process.exit(1);
  }

  console.log('💳 결제 진행 중...\n');

  try {
    // 유료 스킬 실행 (결제 → 스킬 실행)
    const result = await paidMarketAnalysis(payment, 'ETH');

    console.log('\n✅ 스킬 실행 완료!\n');
    console.log('결제 정보:', result.payment);
    console.log('\n분석 결과:', JSON.stringify(result.result, null, 2));
  } catch (error) {
    console.error('❌ 에러:', error.message);
  }
}

// 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  SKILL_CONFIG,
  analyzeMarket,
  paidMarketAnalysis,
};
