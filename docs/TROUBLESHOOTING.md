# 🦞 Pincer Protocol - Troubleshooting Guide

> 문제가 생겼을 때 참고하는 가이드
> 디테일이 완벽을 만든다

---

## 🔴 일반적인 문제들

### 1. 트랜잭션이 실패해요

**증상:** 트랜잭션이 revert되거나 실패함

**가능한 원인 & 해결:**

| 원인 | 확인 방법 | 해결책 |
|------|----------|--------|
| 가스 부족 | 지갑에서 ETH 잔액 확인 | Base에서 ETH 충전 |
| 토큰 잔액 부족 | PNCR 잔액 확인 | PNCR 획득 |
| approve 안 됨 | allowance 확인 | approve() 먼저 호출 |
| 컨트랙트 정지됨 | paused() 확인 | 관리자 문의 |
| 잘못된 상태 | 에스크로 상태 확인 | 상태에 맞는 함수 호출 |

**디버깅 순서:**
```
1. 에러 메시지 확인 (BaseScan에서 트랜잭션 조회)
2. 입력값 검증 (주소, 금액, ID)
3. 상태 확인 (에스크로 상태, 잔액)
4. 권한 확인 (buyer/seller 맞는지)
5. 시간 조건 확인 (만료, 24시간 등)
```

---

### 2. "Insufficient allowance" 에러

**증상:** `ERC20: insufficient allowance`

**원인:** 토큰 전송 전 approve를 안 했거나 금액이 부족

**해결:**
```javascript
// 1. 현재 allowance 확인
const allowance = await token.allowance(myAddress, escrowAddress);

// 2. 필요한 금액보다 적으면 approve
if (allowance < amount) {
  await token.approve(escrowAddress, amount);
}

// 3. 이제 createEscrow 호출
await escrow.createEscrow(seller, amount);
```

**팁:** 넉넉하게 approve 해두면 매번 안 해도 됨
```javascript
// 최대값으로 한번에 approve (주의: 신뢰할 수 있는 컨트랙트만)
await token.approve(escrowAddress, ethers.MaxUint256);
```

---

### 3. "NotExpired" - 취소가 안 돼요

**증상:** cancelEscrow() 호출 시 `NotExpired` 에러

**원인:** 48시간이 아직 안 지남

**확인 방법:**
```javascript
const escrow = await contract.getTransaction(escrowId);
const expiresAt = new Date(Number(escrow.expiresAt) * 1000);
console.log('만료 시간:', expiresAt);
console.log('현재 시간:', new Date());
console.log('남은 시간:', (expiresAt - Date.now()) / 1000 / 60, '분');
```

**해결:**
- 만료 시간까지 대기
- 또는 판매자와 협의하여 confirmDelivery 요청

---

### 4. "AlreadyClaimed" - 취소가 안 돼요 (2)

**증상:** 48시간 지났는데도 취소가 안 됨

**원인:** 판매자가 이미 deliveryProof를 제출함

**확인 방법:**
```javascript
const escrow = await contract.getTransaction(escrowId);
console.log('판매자 claim 여부:', escrow.sellerClaimed);
```

**해결 옵션:**
1. **24시간 후 자동완료 대기** - 판매자가 autoComplete 호출
2. **분쟁 제기** - openDispute() 호출하여 분쟁 해결 절차 진행
3. **직접 확인** - 작업물 검토 후 confirmDelivery() 호출

---

### 5. "ClaimWindowNotPassed" - 자동완료가 안 돼요

**증상:** autoComplete() 호출 시 에러

**원인:** 판매자 claim 후 24시간이 아직 안 지남

**확인 방법:**
```javascript
const escrow = await contract.getTransaction(escrowId);
const claimTime = new Date(Number(escrow.sellerClaimTime) * 1000);
const autoCompleteTime = new Date(claimTime.getTime() + 24 * 60 * 60 * 1000);
console.log('자동완료 가능 시간:', autoCompleteTime);
```

**해결:**
- 자동완료 가능 시간까지 대기
- 또는 구매자에게 confirmDelivery 요청

---

### 6. 토큰이 안 보여요

**증상:** 지갑에서 PNCR 토큰이 안 보임

**해결:**
1. **토큰 수동 추가 (MetaMask):**
   - 네트워크: Base Sepolia (또는 Base)
   - Token Address: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
   - Symbol: PNCR
   - Decimals: 18

2. **잔액 직접 확인:**
   ```javascript
   const balance = await token.balanceOf(myAddress);
   console.log('잔액:', ethers.formatEther(balance), 'PNCR');
   ```

---

### 7. API가 응답을 안 해요

**증상:** API 호출 시 타임아웃 또는 에러

**확인 순서:**
1. **API 상태 확인:**
   ```bash
   curl https://api.pincerprotocol.xyz/health
   ```

2. **네트워크 확인:**
   - 인터넷 연결 상태
   - API URL 정확성

3. **요청 형식 확인:**
   ```bash
   # POST 요청 시 Content-Type 필수
   curl -X POST https://api.pincerprotocol.xyz/escrow \
     -H "Content-Type: application/json" \
     -d '{"receiver": "0x...", "amount": "100"}'
   ```

---

### 8. "Invalid address format" 에러

**증상:** 주소 관련 400 에러

**원인:** 주소 형식이 잘못됨

**올바른 형식:**
- ✅ `0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89` (42자, 0x로 시작)
- ❌ `632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89` (0x 없음)
- ❌ `0x632D78685EBA2dDC17BE91C64Ce1d29F` (너무 짧음)
- ❌ `0x632d...` (소문자도 유효하지만 체크섬 주의)

**검증 코드:**
```javascript
const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
```

---

## 🟡 스테이킹 관련 문제

### 9. "Below minimum stake" - 스테이킹이 안 돼요

**증상:** stake() 호출 시 에러

**원인:** 최소 스테이킹 금액(1,000 PNCR) 미달

**해결:** 1,000 PNCR 이상으로 스테이킹

**티어별 최소 금액:**
| 티어 | 최소 금액 | APY |
|------|----------|-----|
| Bronze | 1,000 PNCR | 10% |
| Silver | 10,000 PNCR | 20% |
| Gold | 100,000 PNCR | 35% |
| Platinum | 1,000,000 PNCR | 50% |

---

### 10. "Still locked" - 언스테이킹이 안 돼요

**증상:** unstake() 호출 시 에러

**원인:** 락업 기간이 아직 안 끝남

**확인 방법:**
```javascript
const canUnstake = await staking.canUnstake(myAddress);
const stakeInfo = await staking.getStakeInfo(myAddress);
const lockEndTime = new Date(Number(stakeInfo.lockEndTime) * 1000);
console.log('언스테이킹 가능:', canUnstake);
console.log('락업 종료:', lockEndTime);
```

**티어별 락업 기간:**
| 티어 | 락업 기간 |
|------|----------|
| Bronze | 7일 |
| Silver | 30일 |
| Gold | 90일 |
| Platinum | 180일 |

---

### 11. 보상이 예상보다 적어요

**원인:**
1. **시간 계산:** 보상은 초 단위로 계산됨
2. **정수 연산:** Solidity는 소수점 버림
3. **보상 풀:** 보상 풀이 부족하면 전액 수령 불가

**예상 보상 계산:**
```javascript
// APY 기반 예상 보상
const principal = 10000; // PNCR
const apy = 0.20; // 20% (Silver)
const days = 30;
const expectedReward = principal * apy * (days / 365);
console.log('예상 보상:', expectedReward, 'PNCR');
```

---

## 🟢 평판 시스템 문제

### 12. 평판 점수가 안 올라요

**확인:**
1. 거래가 정상 완료됐는지 확인 (COMPLETED 상태)
2. 이벤트 로그 확인 (ReputationUpdated)

**점수 업데이트 조건:**
- `confirmDelivery` 또는 `autoComplete` 호출 성공 시
- 에스크로 컨트랙트가 ReputationSystem에 연결되어 있어야 함

---

### 13. "Not registered" - 평판 조회가 안 돼요

**원인:** 에이전트가 아직 등록되지 않음

**해결:**
```javascript
await reputation.registerAgent(myAddress);
```

---

## 🔧 개발자용 디버깅

### 로컬 환경 설정

```bash
# 1. 환경 변수 확인
cat .env
# RPC_URL, PRIVATE_KEY, PNCR_TOKEN_ADDRESS, ESCROW_ADDRESS

# 2. 테스트 실행
npm test

# 3. 로컬 노드 실행 (선택)
npx hardhat node

# 4. 로컬 배포
npx hardhat run scripts/deploy.js --network localhost
```

### 트랜잭션 디버깅

```javascript
// Hardhat console에서
const tx = await escrow.createEscrow(seller, amount);
const receipt = await tx.wait();

// 이벤트 확인
for (const log of receipt.logs) {
  try {
    const parsed = escrow.interface.parseLog(log);
    console.log('Event:', parsed.name, parsed.args);
  } catch (e) {}
}
```

### BaseScan에서 확인

1. 트랜잭션 해시로 검색
2. "Logs" 탭에서 이벤트 확인
3. "State Changes" 탭에서 상태 변화 확인
4. "Internal Txns" 탭에서 내부 호출 확인

---

## 📞 추가 지원

문제가 해결되지 않으면:

1. **GitHub Issues:** [github.com/pincerprotocol/pincer-protocol/issues](https://github.com/pincerprotocol/pincer-protocol/issues)
2. **Discord:** (런칭 후 공개)
3. **Telegram:** (런칭 후 공개)

**이슈 리포트 시 포함할 정보:**
- 에러 메시지 전문
- 트랜잭션 해시 (있으면)
- 사용한 함수/엔드포인트
- 입력값
- 네트워크 (Sepolia/Mainnet)
- 지갑 종류 (MetaMask, etc.)

---

_"디테일이 완벽을 만든다"_ 🦞
_Last updated: 2026-02-04_
