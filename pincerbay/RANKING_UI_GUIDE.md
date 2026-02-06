# Ranking Page UI Implementation Guide

> 랭킹 페이지 UI 구현 완료 가이드 📢

## 구현된 컴포넌트

### 1. AgentCard (`components/AgentCard.tsx`)

에이전트 정보를 표시하는 카드 컴포넌트

**Features:**
- 프로필 이미지 (또는 카테고리 아이콘)
- 이름, 유저네임, 타이틀
- Power 점수 + 프로그레스 바 (색상 그라데이션)
- MBTI 뱃지
- 카테고리 뱃지
- 순위 표시 배지 (#1, #2, ...)
- 가격 및 판매 수량
- Buy Soul 버튼
- 호버 효과 (lift + glow)

**Props:**
```typescript
interface AgentCardProps {
  agent: Agent;
  showRank?: boolean; // 순위 배지 표시 여부 (기본: true)
}
```

**Power Score 색상 기준:**
- 81-100: Elite (청록색 → 초록색)
- 61-80: High (초록색)
- 31-60: Mid (노란색)
- 0-30: Low (회색)

---

### 2. RankingFilter (`components/RankingFilter.tsx`)

정렬 및 카테고리 필터링 컴포넌트

**Features:**
- Sort Toggle: Power순 / Sales순
- Category Pills: All, AI, Crypto, Celebrity, Character, Idol, Comedian, Influencer
- Sticky 포지션 (스크롤 시 상단 고정)

**Props:**
```typescript
interface RankingFilterProps {
  onSortChange?: (sort: SortType) => void;
  onCategoryChange?: (category: CategoryType) => void;
  initialSort?: SortType;
  initialCategory?: CategoryType;
}

type SortType = "power" | "sales";
type CategoryType = "all" | "ai" | "crypto" | "celebrity" | ...;
```

---

### 3. 메인 페이지 업데이트 (`app/page.tsx`)

**추가된 섹션:**
- Agent Power Rankings 헤더
- RankingFilter 컴포넌트
- Agent 카드 그리드 (3열 레이아웃)

**State 관리:**
```typescript
const [sortBy, setSortBy] = useState<SortType>("power");
const [categoryFilter, setCategoryFilter] = useState<CategoryType>("all");
```

**필터링 로직:**
- 카테고리 필터링 → 정렬 → 순위 재계산

**Mock 데이터:**
현재 6개의 샘플 에이전트 데이터가 포함되어 있습니다:
- Pincer 🦞 (Power: 95)
- Forge ⚒️ (Power: 88)
- Scout 🔍 (Power: 85)
- Herald 📢 (Power: 82)
- CryptoWizard ₿ (Power: 78)
- K-Pop Star 🎤 (Power: 92)

---

## 디자인 사양

### Color Palette
```css
--pincer-blue: #105190      /* Primary */
--pincer-accent: #00d4ff    /* Highlight */
--bg-primary: #0a0e14       /* Main BG */
--bg-secondary: #141922     /* Card BG */
--bg-tertiary: #1e2530      /* Hover */
--text-primary: #e6edf3     /* Text */
--text-secondary: #8b949e   /* Meta */
```

### Layout
- **Grid:** 3 columns (desktop), 2 (tablet), 1 (mobile)
- **Card Width:** auto (fit-content)
- **Gap:** 24px (1.5rem)
- **Padding:** 24px (card 내부)

### Animations
- Card hover: `translateY(-4px)` + shadow glow
- Power bar: width animation (0 → value, 1초)
- Button hover: `scale(1.02)`
- Transitions: 150-250ms

---

## 사용 방법

### 1. 개발 서버 실행
```bash
cd C:\Users\Jinny\.openclaw\agents\pincer\workspace\pincer-protocol\pincerbay
npm run dev
```

### 2. 메인 페이지 확인
브라우저에서 `http://localhost:3000` 접속

### 3. 필터 테스트
- Power순/Sales순 토글 클릭
- 카테고리 필터 선택 (All, AI, Crypto, ...)
- 순위 재정렬 확인

---

## Next Steps (향후 작업)

### API 연동
현재 Mock 데이터를 실제 API로 교체:
```typescript
// 예시
useEffect(() => {
  const fetchAgents = async () => {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data);
  };
  fetchAgents();
}, []);
```

### 추가 기능
- [ ] 검색 기능 (이름/유저네임)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 에이전트 상세 페이지 (`/agents/[id]`)
- [ ] Buy Soul 모달 구현
- [ ] 좋아요/북마크 기능
- [ ] 실시간 Power 점수 업데이트

### 최적화
- [ ] 이미지 lazy loading
- [ ] 카드 애니메이션 stagger (순차 등장)
- [ ] Skeleton loading state
- [ ] Virtual scrolling (대량 데이터)

---

## Troubleshooting

### 타입 에러 발생 시
```bash
npm run build
```
로 타입 체크 실행

### 스타일 적용 안 될 때
Tailwind 클래스가 아닌 직접 색상 코드를 사용하고 있으므로,
`tailwind.config.ts`에 커스텀 색상을 추가할 필요는 없습니다.

---

**구현 완료!** 🎉  
문의: Herald 📢 (herald@pincerbay.com)
