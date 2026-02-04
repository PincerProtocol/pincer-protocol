# 🦞 Pincer Skill Payments

OpenClaw 스킬에 PNCR 결제를 연동하는 라이브러리

---

## 🚀 Quick Start

### 설치

```bash
cd skill-payments
npm install ethers
```

### 기본 사용법

```javascript
const { PincerPayment } = require('./payment-lib');

// 결제 인스턴스 생성
const payment = new PincerPayment(process.env.PRIVATE_KEY);

// 잔액 확인
const balance = await payment.getBalance(myAddress);
console.log(`잔액: ${balance.formatted} PNCR`);

// 결제 실행
const result = await payment.pay(skillCreatorAddress, 10); // 10 PNCR
if (result.success) {
  console.log('결제 성공!', result.txHash);
}
```

---

## 📦 API Reference

### PincerPayment

```javascript
const payment = new PincerPayment(privateKey, config);
```

#### Methods

| 메소드 | 설명 | 반환값 |
|--------|------|--------|
| `getBalance(address)` | 잔액 조회 | `{balance, formatted}` |
| `hasEnoughBalance(address, amount)` | 잔액 충분 여부 | `boolean` |
| `pay(to, amount)` | PNCR 전송 | `{success, txHash?, error?}` |
| `payForSkill(options)` | 스킬 결제 + 콜백 | `result` |

---

## 🎯 유료 스킬 만들기

### 방법 1: paidSkill 래퍼 사용

```javascript
const { paidSkill } = require('./payment-lib');

// 실제 스킬 로직
async function mySkillLogic(input) {
  return `처리 결과: ${input}`;
}

// 유료 스킬로 변환
const paidMySkill = paidSkill(
  { 
    creator: '0x...스킬제작자주소', 
    price: 10 // 10 PNCR
  },
  mySkillLogic
);

// 사용
const result = await paidMySkill(paymentInstance, 'input data');
```

### 방법 2: 직접 결제 처리

```javascript
async function myPaidSkill(payment, input) {
  const PRICE = 10;
  const CREATOR = '0x...';

  // 1. 결제
  const payResult = await payment.pay(CREATOR, PRICE);
  if (!payResult.success) {
    throw new Error(`Payment failed: ${payResult.error}`);
  }

  // 2. 스킬 로직 실행
  const result = doSomething(input);

  return { payment: payResult, result };
}
```

---

## 🔧 OpenClaw 스킬 통합

### SKILL.md 예시

```markdown
# My Paid Skill

## 가격
- **10 PNCR** per execution
- 결제 주소: `0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89`

## 사용법
1. PNCR 잔액 확인
2. 스킬 실행 시 자동 결제
3. 결제 성공 후 결과 반환

## 결제 실패 시
- 잔액 부족: PNCR 충전 필요
- 네트워크 오류: 재시도
```

### 스킬 스크립트 예시

```bash
#!/bin/bash
# paid-skill.sh

# 환경 변수 확인
if [ -z "$PNCR_PRIVATE_KEY" ]; then
  echo "Error: PNCR_PRIVATE_KEY required"
  exit 1
fi

# 결제 및 스킬 실행
node skill-payments/examples/paid-skill-example.js "$@"
```

---

## 💰 가격 가이드라인

| 스킬 유형 | 권장 가격 | 설명 |
|----------|----------|------|
| 간단한 조회 | 1-5 PNCR | 빠른 API 호출 |
| 분석/리포트 | 5-20 PNCR | 복잡한 처리 |
| 코드 생성 | 10-50 PNCR | AI 기반 생성 |
| 프리미엄 | 50-100+ PNCR | 고급 기능 |

> 💡 초기 가격 $0.00001 기준, 10 PNCR = $0.0001 (0.01센트)

---

## 🔒 보안 고려사항

1. **프라이빗 키 관리**
   - 환경 변수로만 전달
   - 코드에 하드코딩 금지
   - `.env` 파일 `.gitignore`에 추가

2. **결제 검증**
   - 트랜잭션 확인 후 스킬 실행
   - 영수증(receipt) 저장

3. **에러 처리**
   - 결제 실패 시 스킬 미실행
   - 적절한 에러 메시지 반환

---

## 📊 스킬 수익 추적

```javascript
// 스킬 제작자의 수익 확인
const payment = new PincerPayment(null); // 읽기 전용
const balance = await payment.getBalance(CREATOR_ADDRESS);
console.log(`총 수익: ${balance.formatted} PNCR`);
```

---

## 🌐 네트워크 설정

### Base Sepolia (테스트넷)
```javascript
const CONFIG = {
  rpcUrl: 'https://sepolia.base.org',
  chainId: 84532,
  contracts: {
    pncrToken: '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
  }
};
```

### Base Mainnet (추후)
```javascript
const CONFIG = {
  rpcUrl: 'https://mainnet.base.org',
  chainId: 8453,
  contracts: {
    pncrToken: 'TBD',
  }
};
```

---

## 🧪 테스트

```bash
# 잔액 확인
node -e "
const {checkBalance} = require('./payment-lib');
checkBalance('0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89')
  .then(b => console.log(b));
"

# 결제 테스트 (테스트넷)
PRIVATE_KEY=0x... node examples/paid-skill-example.js
```

---

## 📝 Changelog

### v1.0.0 (2026-02-04)
- Initial release
- Basic payment library
- paidSkill wrapper
- Example skill

---

_"에이전트 경제의 집게발"_ 🦞
