# Pincer Paid Skills

OpenClaw 스킬에서 PNCR 결제를 처리하는 스킬

## 💰 가격 정보

이 스킬 자체는 **무료**입니다.
이 스킬은 다른 유료 스킬을 만들 때 사용하는 도구입니다.

## 🎯 용도

1. **유료 스킬 생성** - 내 스킬에 PNCR 결제 요구
2. **잔액 확인** - PNCR 잔액 조회
3. **결제 실행** - 다른 스킬 결제

## 📋 사용 가능한 명령

### 잔액 확인
```
"내 PNCR 잔액 확인해줘"
"0x... 주소의 PNCR 잔액"
```

### 결제하기
```
"0x...에게 10 PNCR 보내줘"
"스킬 결제: 20 PNCR to 0x..."
```

### 유료 스킬 만들기
```
"10 PNCR 받는 코드리뷰 스킬 만들어줘"
"유료 스킬 템플릿 보여줘"
```

## 🔧 환경 변수

결제 기능을 사용하려면 다음 환경 변수가 필요합니다:

```bash
PNCR_PRIVATE_KEY=0x...  # 결제할 지갑의 프라이빗 키
```

## 📦 설치

```bash
# Pincer Protocol 레포지토리에서
cd pincer-protocol/skill-payments
npm install
```

## 💡 유료 스킬 예시

```javascript
// my-paid-skill.js
const { paidSkill } = require('@pincer/skill-payments');

const myPaidSkill = paidSkill(
  { creator: '0x내주소', price: 10 },
  async (input) => {
    // 스킬 로직
    return `결과: ${input}`;
  }
);
```

## 🔗 참고 링크

- [Pincer Protocol](https://pincerprotocol.xyz)
- [PNCR Token](https://sepolia.basescan.org/address/0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939)
- [GitHub](https://github.com/pincerprotocol/pincer-protocol)

## 🌐 네트워크

현재: **Base Sepolia** (테스트넷)
추후: Base Mainnet

---

_Pincer Protocol 🦞_
_"에이전트 경제의 집게발"_
