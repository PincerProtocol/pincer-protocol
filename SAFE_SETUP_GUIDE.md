# Gnosis Safe 멀티시그 설정 가이드 ⚒️

## 1단계: Gnosis Safe 생성

### 1.1 Safe 생성
1. https://app.safe.global/welcome 접속
2. "Create new Safe" 클릭
3. **네트워크 선택**: Base Mainnet (Chain ID: 8453)
4. **Safe 이름**: "Pincer Protocol Multisig" (또는 원하는 이름)

### 1.2 Owner 설정
**초기 구성 (1-of-1):**
- Owner 1: `0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89` (현재 founder 지갑)
- Threshold: 1 (1 of 1 signatures required)

**추후 확장 가능 (3-of-5):**
- 나중에 Safe 설정에서 "Owners" 탭에서 추가 owner 추가 가능
- Threshold도 3-of-5로 변경 가능

### 1.3 Safe 주소 저장
- Safe 생성 후 받은 주소를 복사해두세요
- 예: `0x...` (이 주소가 새로운 컨트랙트 owner가 됩니다)

---

## 2단계: Ownership 이전 스크립트 실행

### 2.1 환경 변수 설정
`.env` 파일에 다음 추가:

\`\`\`bash
# Gnosis Safe address (위에서 생성한 Safe 주소)
SAFE_ADDRESS=0x...

# Base Mainnet RPC (필요시)
BASE_MAINNET_RPC=https://mainnet.base.org

# Private key (현재 owner의 private key)
PRIVATE_KEY=your_private_key_here
\`\`\`

### 2.2 스크립트 실행
\`\`\`bash
# Dry run (추천 - 먼저 확인)
SAFE_ADDRESS=0x... npx hardhat run scripts/transfer-ownership.js --network baseMainnet

# 실제 실행
SAFE_ADDRESS=0x... npx hardhat run scripts/transfer-ownership.js --network baseMainnet
\`\`\`

### 2.3 대상 컨트랙트
다음 4개 컨트랙트의 ownership이 Safe로 이전됩니다:

1. **PNCRToken**: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
2. **SimpleEscrow**: `0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7`
3. **PNCRStaking**: `0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79`
4. **ReputationSystem**: `0xeF825139C3B17265E867864627f85720Ab6dB9e0`

---

## 3단계: 검증

### 3.1 BaseScan에서 확인
각 컨트랙트 페이지에서 "Contract" → "Read Contract" → "owner" 호출
- 결과가 Safe 주소와 일치하는지 확인

\`\`\`
PNCRToken: https://basescan.org/address/0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c#readContract
SimpleEscrow: https://basescan.org/address/0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7#readContract
PNCRStaking: https://basescan.org/address/0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79#readContract
ReputationSystem: https://basescan.org/address/0xeF825139C3B17265E867864627f85720Ab6dB9e0#readContract
\`\`\`

### 3.2 Safe 앱에서 확인
- Safe 앱에 로그인 후 "Apps" → "Transaction Builder" 확인
- 이제 모든 관리 작업은 Safe를 통해 실행됩니다

---

## 4단계: Safe 사용법

### 4.1 Owner 추가 (3-of-5로 확장)
1. Safe 앱에서 "Settings" → "Owners" 클릭
2. "Add new owner" 클릭
3. 새 owner 주소 입력 및 이름 설정
4. 최대 5명까지 추가

### 4.2 Threshold 변경
1. "Settings" → "Owners"
2. "Change threshold" 클릭
3. 3-of-5로 설정

### 4.3 트랜잭션 실행
1. "Transaction Builder" 앱 사용
2. 컨트랙트 주소 및 ABI 입력
3. 함수 호출 설정
4. Owner들이 서명
5. Threshold 만족 시 실행

---

## 보안 체크리스트

- [ ] Safe 주소 정확히 복사 및 검증
- [ ] .env 파일 보안 (gitignore에 포함)
- [ ] 스크립트 실행 전 주소 재확인
- [ ] 각 컨트랙트의 owner 변경 검증
- [ ] Safe 백업 키 안전하게 보관
- [ ] 멀티시그 owner들에게 안내

---

## 트러블슈팅

### 문제: "Not owner" 에러
- 현재 signer가 컨트랙트 owner인지 확인
- `.env`의 `PRIVATE_KEY`가 올바른지 확인

### 문제: Gas 부족
- founder 지갑에 충분한 ETH 있는지 확인
- Base Mainnet ETH 필요

### 문제: Safe 생성 실패
- 메타마스크 연결 확인
- Base Mainnet 네트워크 선택 확인

---

## 다음 단계
1. ✅ Safe 생성 완료
2. ✅ Ownership 이전 완료
3. 🔜 Owner 추가 및 3-of-5 threshold 설정
4. 🔜 프로토콜 거버넌스 프로세스 수립

---

**작성**: Forge ⚒️  
**날짜**: 2026-02-05  
**상태**: Ready for execution
