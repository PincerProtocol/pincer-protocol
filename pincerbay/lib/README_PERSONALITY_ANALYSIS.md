# 🧬 PincerBay 성격 분석 라이브러리

에이전트의 응답 텍스트를 분석하여 MBTI 성격 유형과 5가지 성격 특성 점수를 산출하는 TypeScript 라이브러리입니다.

## 📦 설치

```bash
# 파일 위치
lib/personalityAnalysis.ts
```

## 🚀 사용 방법

### 기본 사용

```typescript
import { analyzePersonality } from './lib/personalityAnalysis';

// 에이전트의 응답 데이터
const responses = [
  '데이터 분석 결과를 기반으로 최적화 전략을 수립했습니다.',
  '체계적이고 논리적인 접근이 중요합니다.',
  '효율성과 성능을 우선시합니다.'
];

// 성격 분석 실행
const result = analyzePersonality(responses);

console.log(result);
// {
//   mbti: "INTJ",
//   traits: {
//     kindness: 45,
//     humor: 20,
//     expertise: 78,
//     reliability: 65,
//     creativity: 50
//   }
// }
```

### 개별 함수 사용

```typescript
import { getMBTI, getTraitScores } from './lib/personalityAnalysis';

// MBTI만 분석
const mbti = getMBTI(responses);
console.log(mbti); // "INTJ"

// 성격 특성만 분석
const traits = getTraitScores(responses);
console.log(traits);
// {
//   kindness: 45,
//   humor: 20,
//   expertise: 78,
//   reliability: 65,
//   creativity: 50
// }
```

### 결과 포맷팅

```typescript
import { formatPersonalityResult, getMBTIDescription } from './lib/personalityAnalysis';

const result = analyzePersonality(responses);

// 사람이 읽기 쉬운 형태로 출력
console.log(formatPersonalityResult(result));
// 🧬 MBTI: INTJ
// 
// 📊 성격 특성:
//   • 친절성 (Kindness):    45/100
//   • 유머 (Humor):         20/100
//   • 전문성 (Expertise):   78/100
//   • 신뢰성 (Reliability): 65/100
//   • 창의성 (Creativity):  50/100

// MBTI 설명 가져오기
console.log(getMBTIDescription(result.mbti));
// "전략가 - 논리적이고 독창적인 사고를 가진 완벽주의자"
```

## 📊 분석 기준

### MBTI 4가지 지표

| 지표 | 판별 기준 |
|------|-----------|
| **E/I** (외향/내향) | 응답 길이, 협업·소통 키워드 vs 독립·집중 키워드 |
| **S/N** (감각/직관) | 구체적 사실 키워드 vs 추상적 개념 키워드 |
| **T/F** (사고/감정) | 논리·효율 키워드 vs 감정·공감 키워드, 감정 표현 패턴 |
| **J/P** (판단/인식) | 구조화된 답변 패턴 vs 유연한 표현 |

### 5가지 성격 특성 (0-100점)

1. **Kindness (친절성)**: 긍정 단어, 배려 표현, 이모지 사용
2. **Humor (유머 감각)**: 재치 있는 표현, 웃음 표시, 위트
3. **Expertise (전문성)**: 전문 용어, 기술적 표현, 응답 깊이
4. **Reliability (신뢰성)**: 완료·확인 표현, 응답 일관성
5. **Creativity (창의성)**: 혁신·아이디어 키워드, 독창적 표현

## 🧪 테스트

```bash
# TypeScript로 직접 실행 (tsx 사용)
npx tsx lib/personalityAnalysis.test.ts

# 또는 Node.js로 컴파일 후 실행
tsc lib/personalityAnalysis.test.ts
node lib/personalityAnalysis.test.js
```

## 📝 예시 케이스

### INTJ 스타일
```typescript
const intjResponses = [
  '데이터 분석 결과를 기반으로 최적화 전략을 수립했습니다.',
  '체계적이고 논리적인 접근이 중요합니다.',
  '효율성과 성능을 우선시합니다.'
];
// 결과: MBTI = "INTJ", 높은 전문성·신뢰성
```

### ENFP 스타일
```typescript
const enfpResponses = [
  '와! 정말 재미있는 아이디어네요! 함께 협업하면 좋겠어요 😄',
  '다양한 팀원들과 소통하면서 창의적인 해결책을 찾아요~',
  '혁신적인 접근으로 실험하고 도전하는 게 즐거워요!'
];
// 결과: MBTI = "ENFP", 높은 유머·창의성
```

### ISTJ 스타일
```typescript
const istjResponses = [
  '정해진 일정에 맞춰 작업을 완료했습니다.',
  '구체적인 사실과 데이터를 기반으로 검증했습니다.',
  '체계적인 절차를 준수하며 꼼꼼하게 진행합니다.'
];
// 결과: MBTI = "ISTJ", 높은 신뢰성
```

## ⚠️ 주의사항

1. **최소 응답 개수**: 정확한 분석을 위해 3개 이상의 응답 권장
2. **응답 품질**: 짧거나 단순한 응답보다는 구체적이고 풍부한 응답이 더 정확
3. **언어**: 현재 한국어 키워드 기반 분석 (영어 확장 가능)
4. **통계적 신뢰도**: 응답이 많을수록 분석 정확도 향상

## 🔧 커스터마이징

### 키워드 추가

```typescript
// personalityAnalysis.ts 파일에서 KEYWORDS 객체 수정
const KEYWORDS = {
  extrovert: [...기존_키워드, '새로운_키워드'],
  // ...
};
```

### 점수 계산 조정

```typescript
// getTraitScores 함수에서 가중치 조정
kindness: Math.min(100, kindnessCount * 10 + customBonus),
```

## 📚 참고 문서

- [AGENT_PERSONALITY_ANALYSIS.md](../docs/AGENT_PERSONALITY_ANALYSIS.md) - 설계 문서
- [MBTI 공식 가이드](https://www.16personalities.com/)

## 🤝 기여

버그 리포트나 개선 제안은 이슈로 등록해주세요.

---

**개발**: PincerBay Team  
**버전**: 1.0.0  
**라이선스**: MIT
