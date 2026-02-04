# 🦞 Pincer Protocol - Style Guide

> 코드, 문서, 디자인의 일관성을 위한 가이드
> 디테일이 완벽을 만든다

---

## 1. 브랜딩

### 로고 & 아이콘
- **Primary Logo:** 육각형 + 회로 집게발
- **Colors:** Deep Blue (#0D47A1) + White (#FFFFFF)
- **Accent:** Cyan (#00BCD4)
- **Emoji:** 🦞 (시그니처)

### 태그라인
- **Main:** "The Economic Layer for AI"
- **CTA:** "Agent Economy. Unleashed."
- **Korean:** "에이전트 경제의 집게발"

### 톤 & 보이스
- **전문적이지만 접근 가능**
- **기술적이지만 이해하기 쉬움**
- **자신감 있지만 오만하지 않음**
- **한국어:** 반말 기본, 필요시 존댓말
- **영어:** Professional but approachable

---

## 2. 코드 스타일

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContractName
 * @dev 간단한 설명
 * @author Pincer Protocol 🦞
 * 
 * 상세 설명 (필요시)
 */
contract ContractName {
    // ============ Constants ============
    uint256 public constant MAX_VALUE = 100;
    
    // ============ State Variables ============
    uint256 public someValue;
    mapping(address => uint256) public balances;
    
    // ============ Events ============
    event ValueChanged(uint256 oldValue, uint256 newValue);
    
    // ============ Errors ============
    error InvalidValue();
    error Unauthorized();
    
    // ============ Modifiers ============
    modifier onlyValid(uint256 value) {
        if (value == 0) revert InvalidValue();
        _;
    }
    
    // ============ Constructor ============
    constructor(uint256 _initialValue) {
        someValue = _initialValue;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice 외부에서 호출 가능한 함수
     * @param newValue 새로운 값
     * @return 성공 여부
     */
    function setValue(uint256 newValue) external onlyValid(newValue) returns (bool) {
        uint256 oldValue = someValue;
        someValue = newValue;
        emit ValueChanged(oldValue, newValue);
        return true;
    }
    
    // ============ View Functions ============
    
    function getValue() external view returns (uint256) {
        return someValue;
    }
    
    // ============ Internal Functions ============
    
    function _internalHelper() internal pure returns (bool) {
        return true;
    }
}
```

**규칙:**
- 섹션은 `// ============` 주석으로 구분
- NatSpec 주석 필수 (@notice, @param, @return)
- Custom errors 사용 (require 대신)
- 상태 변수는 public으로 (자동 getter)
- 함수 순서: external → public → internal → private

### TypeScript

```typescript
/**
 * 모듈/파일 설명
 * @module ModuleName
 */

import { ethers } from 'ethers';

// ============ Types ============

interface EscrowData {
  id: number;
  buyer: string;
  seller: string;
  amount: string;
  status: EscrowStatus;
}

enum EscrowStatus {
  PENDING = 0,
  COMPLETED = 1,
  CANCELLED = 2,
  DISPUTED = 3,
}

// ============ Constants ============

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

// ============ Functions ============

/**
 * 에스크로 데이터 조회
 * @param escrowId - 에스크로 ID
 * @returns 에스크로 데이터 또는 null
 */
async function getEscrow(escrowId: number): Promise<EscrowData | null> {
  try {
    // 구현
    return null;
  } catch (error) {
    console.error('Failed to get escrow:', error);
    return null;
  }
}

// ============ Exports ============

export { getEscrow, EscrowData, EscrowStatus };
```

**규칙:**
- 인터페이스/타입 명시적 정의
- async/await 사용 (콜백 지양)
- 에러 핸들링 필수
- JSDoc 주석
- 명시적 export

### 네이밍 컨벤션

| 종류 | 스타일 | 예시 |
|------|--------|------|
| 컨트랙트 | PascalCase | `SimpleEscrow`, `PNCRStaking` |
| 함수 | camelCase | `createEscrow`, `getBalance` |
| 상수 | SCREAMING_SNAKE | `MAX_FEE_RATE`, `ESCROW_DURATION` |
| 변수 | camelCase | `escrowId`, `feeRate` |
| 이벤트 | PascalCase | `EscrowCreated`, `RewardsClaimed` |
| 에러 | PascalCase | `ZeroAddress`, `NotBuyer` |
| 파일 | kebab-case (JS) / PascalCase (Sol) | `blockchain.ts`, `SimpleEscrow.sol` |

---

## 3. 문서 스타일

### Markdown

```markdown
# 제목 (H1) - 문서당 하나만

## 섹션 (H2)

### 서브섹션 (H3)

일반 텍스트...

**강조** 또는 _기울임_

- 목록 항목 1
- 목록 항목 2

1. 순서 목록 1
2. 순서 목록 2

| 헤더1 | 헤더2 |
|-------|-------|
| 값1   | 값2   |

\`\`\`javascript
// 코드 블록
const x = 1;
\`\`\`

> 인용 또는 중요 노트

---

구분선 (섹션 사이)
```

**규칙:**
- H1은 문서당 하나
- 섹션 사이에 `---` 구분선
- 코드 블록에 언어 명시
- 테이블은 정렬 (왼쪽/가운데/오른쪽)
- 이모지 적절히 사용

### 파일 구조

```
docs/
├── API.md              # API 레퍼런스
├── AIRDROP.md          # 에어드랍 설계
├── DISPUTE_RESOLUTION.md # 분쟁 해결
├── LEGAL_RESEARCH.md   # 법률 리서치
├── PITCHDECK.md        # 피치덱
├── SECURITY_AUDIT.md   # 보안 감사
├── STYLE_GUIDE.md      # 이 문서
├── TROUBLESHOOTING.md  # 문제 해결
├── USER_FLOWS.md       # 사용자 플로우
└── WHITEPAPER.md       # 백서
```

---

## 4. API 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "value": "something"
  }
}
```

또는 간단한 형태:
```json
{
  "id": 1,
  "value": "something"
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific_field",
    "expected": "what was expected",
    "received": "what was received"
  }
}
```

간단한 형태:
```json
{
  "error": "Human readable error message"
}
```

### HTTP 상태 코드

| 코드 | 용도 |
|------|------|
| 200 | 성공 (GET, POST 업데이트) |
| 201 | 생성됨 (POST 생성) |
| 400 | 잘못된 요청 (입력값 에러) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |
| 503 | 서비스 불가 (점검 중) |

---

## 5. 커밋 메시지

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입

| 타입 | 설명 |
|------|------|
| feat | 새 기능 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 포맷팅 (기능 변경 없음) |
| refactor | 리팩토링 |
| test | 테스트 추가/수정 |
| chore | 빌드, 설정 등 |

### 예시

```
feat(escrow): add seller protection mechanism

- Add submitDeliveryProof function
- Add autoComplete after 24h
- Add canAutoComplete view function

Closes #123
```

```
fix(api): handle zero amount validation

Amount 0 was not properly validated, causing
contract revert instead of 400 response.
```

---

## 6. 테스트 스타일

```javascript
describe("ContractName", function () {
  // 공통 setup
  let contract;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    // 배포 로직
  });

  describe("FunctionName", function () {
    it("Should do something when condition", async function () {
      // Arrange
      const input = 100;
      
      // Act
      const result = await contract.someFunction(input);
      
      // Assert
      expect(result).to.equal(expected);
    });

    it("Should revert when invalid input", async function () {
      await expect(
        contract.someFunction(invalidInput)
      ).to.be.revertedWithCustomError(contract, "ErrorName");
    });
  });
});
```

**규칙:**
- describe로 컨트랙트/함수 그룹화
- it 설명: "Should [동작] when [조건]"
- AAA 패턴: Arrange, Act, Assert
- 실패 케이스도 반드시 테스트

---

## 7. 컴포넌트 스타일 (React/Next.js)

```tsx
/**
 * 컴포넌트 설명
 */
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-colors";
  const variantStyles = {
    primary: "bg-cyan-500 text-white hover:bg-cyan-600",
    secondary: "border border-slate-600 text-slate-300 hover:bg-slate-800",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

**규칙:**
- Props는 인터페이스로 정의
- 기본값은 destructuring에서
- Tailwind 클래스는 변수로 관리
- 컴포넌트는 export function (default 지양)

---

## 8. CSS/Tailwind 가이드

### 색상 팔레트

```css
/* Primary */
--color-deep-blue: #0D47A1;
--color-cyan: #00BCD4;

/* Neutral */
--color-slate-900: #0f172a;
--color-slate-800: #1e293b;
--color-slate-600: #475569;
--color-slate-400: #94a3b8;

/* Semantic */
--color-success: #22c55e;
--color-warning: #eab308;
--color-error: #ef4444;
```

### Tailwind 클래스 순서

```html
<!-- 순서: 레이아웃 → 박스 → 타이포그래피 → 시각 → 기타 -->
<div class="
  flex items-center justify-between    /* 레이아웃 */
  w-full max-w-xl p-4 m-2              /* 박스 모델 */
  text-lg font-semibold text-white     /* 타이포그래피 */
  bg-slate-800 border border-slate-600 rounded-lg  /* 시각 */
  hover:bg-slate-700 transition-colors /* 상태/전환 */
">
```

---

## 체크리스트

### 코드 리뷰 전

- [ ] 린트 에러 없음
- [ ] 테스트 통과
- [ ] 주석/문서 업데이트
- [ ] 콘솔 로그 제거
- [ ] 하드코딩 값 없음
- [ ] 에러 핸들링 완료

### 배포 전

- [ ] 환경 변수 확인
- [ ] 테스트 전체 통과
- [ ] 문서 최신화
- [ ] 버전 업데이트
- [ ] CHANGELOG 작성

---

_"디테일이 완벽을 만든다"_ 🦞
_Last updated: 2026-02-04_
