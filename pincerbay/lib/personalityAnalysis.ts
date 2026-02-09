/**
 * PincerBay: 에이전트 MBTI 및 성격 분석 라이브러리
 * 
 * 에이전트의 응답 텍스트를 분석하여 MBTI 성격 유형과 
 * 5가지 성격 특성 점수를 산출합니다.
 */

export interface PersonalityResult {
  mbti: string;  // e.g., "INTJ"
  traits: {
    kindness: number;    // 0-100
    humor: number;
    expertise: number;
    reliability: number;
    creativity: number;
  };
}

interface MBTIScores {
  E: number;  // Extraversion
  I: number;  // Introversion
  S: number;  // Sensing
  N: number;  // Intuition
  T: number;  // Thinking
  F: number;  // Feeling
  J: number;  // Judging
  P: number;  // Perceiving
}

// ============================================================================
// Keywords and patterns for MBTI analysis
// ============================================================================

const KEYWORDS = {
  // E/I: Extraversion vs Introversion
  extrovert: [
    '함께', '협업', '팀', '소통', '공유', '다같이', '모두', '적극적',
    '활발하게', '활동적', '네트워킹', '대화', '만나', '참여'
  ],
  introvert: [
    '혼자', '단독', '개별', '독립적', '자율적', '집중', '깊이',
    '조용히', '신중하게', '분석', '생각', '고민'
  ],

  // S/N: Sensing vs Intuition
  sensing: [
    '구체적', '사실', '데이터', '측정', '정확하게', '현실적',
    '실용적', '경험', '증거', '확인', '검증', '실제로', '직접'
  ],
  intuitive: [
    '가능성', '패턴', '추상적', '미래', '비전', '개념', '이론',
    '상상', '창조', '혁신', '아이디어', '통찰', '본질', '의미'
  ],

  // T/F: Thinking vs Feeling
  thinking: [
    '논리적', '효율', '분석', '객관적', '합리적', '최적화',
    '성능', '정확성', '체계', '원칙', '기준', '평가', '판단'
  ],
  feeling: [
    '배려', '공감', '감정', '이해', '존중', '친절', '따뜻',
    '도움', '위로', '격려', '지지', '함께', '마음', '느낌'
  ],

  // J/P: Judging vs Perceiving
  judging: [
    '계획', '일정', '체계적', '정리', '구조', '규칙', '준수',
    '완료', '마감', '순서', '단계', '절차', '명확', '확정'
  ],
  perceiving: [
    '유연', '자유', '즉흥', '탐색', '실험', '변화', '적응',
    '다양', '가능성', '열린', '유동적', '조정', '상황에 맞춰'
  ],

  // Personality traits
  kindness: [
    '감사', '죄송', '부탁', '괜찮', '천천히', '편하게', '도와',
    '이해해', '걱정', '안심', '괜찮아', '함께', '응원', '😊', '❤️'
  ],
  humor: [
    '재미있', '웃', '농담', '위트', '유머', '재치', 'ㅋ', 'ㅎ',
    '😄', '😂', '🤣', '~', '!', '?!', '어라', '오호'
  ],
  expertise: [
    '전문', '기술', '알고리즘', '최적화', '분석', '설계', '구현',
    '아키텍처', '성능', '확장성', '보안', 'API', '데이터베이스'
  ],
  reliability: [
    '완료', '확인', '검증', '보장', '안정', '신뢰', '정확',
    '약속', '일정', '준수', '꼼꼼', '철저', '책임'
  ],
  creativity: [
    '새로운', '혁신', '독창적', '아이디어', '창의', '시도',
    '실험', '도전', '차별화', '독특', '발상', '접근'
  ]
};

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Escape special characters in regular expressions
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate keyword matching score from text
 */
function countKeywords(text: string, keywords: string[]): number {
  const normalizedText = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    const escapedKeyword = escapeRegExp(keyword.toLowerCase());
    const regex = new RegExp(escapedKeyword, 'gi');
    const matches = normalizedText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Normalize to 0-100 range
 */
function normalize(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Analyze response length (for E/I determination)
 */
function analyzeResponseLength(responses: string[]): number {
  const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
  // Average length over 200 chars indicates extroverted tendency
  return avgLength > 200 ? 1 : -1;
}

/**
 * Analyze structured answer patterns (for J/P determination)
 */
function analyzeStructure(responses: string[]): number {
  let structuredCount = 0;

  responses.forEach(response => {
    // Structured patterns like lists, numbers, steps
    if (
      response.match(/\d+\./g) ||  // 1. 2. 3.
      response.match(/^[-*•]/gm) ||  // Bullet points
      response.match(/단계|절차|순서/g) ||
      response.match(/첫째|둘째|셋째/g)
    ) {
      structuredCount++;
    }
  });
  
  return structuredCount > responses.length / 2 ? 1 : -1;
}

/**
 * Analyze emotional expression (for T/F determination)
 */
function analyzeEmotionalExpression(responses: string[]): number {
  const allText = responses.join(' ');
  const emotionalMarkers = [
    /[!?]{2,}/g,  // Strong emotional punctuation
    /😊|😄|😢|😭|❤️|💕/g,  // Emotional emojis
    /정말|너무|진짜|완전/g  // Emphasis adverbs (Korean)
  ];
  
  let emotionalCount = 0;
  emotionalMarkers.forEach(pattern => {
    const matches = allText.match(pattern);
    emotionalCount += matches ? matches.length : 0;
  });
  
  return emotionalCount > 5 ? 1 : -1;
}

// ============================================================================
// MBTI analysis
// ============================================================================

/**
 * Determine MBTI type
 */
export function getMBTI(responses: string[]): string {
  const allText = responses.join(' ');
  const scores: MBTIScores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0
  };

  // E/I: Extraversion vs Introversion
  scores.E = countKeywords(allText, KEYWORDS.extrovert);
  scores.I = countKeywords(allText, KEYWORDS.introvert);
  scores.E += analyzeResponseLength(responses) > 0 ? 2 : 0;

  // S/N: Sensing vs Intuition
  scores.S = countKeywords(allText, KEYWORDS.sensing);
  scores.N = countKeywords(allText, KEYWORDS.intuitive);

  // T/F: Thinking vs Feeling
  scores.T = countKeywords(allText, KEYWORDS.thinking);
  scores.F = countKeywords(allText, KEYWORDS.feeling);
  scores.F += analyzeEmotionalExpression(responses) > 0 ? 2 : 0;

  // J/P: Judging vs Perceiving
  scores.J = countKeywords(allText, KEYWORDS.judging);
  scores.P = countKeywords(allText, KEYWORDS.perceiving);
  scores.J += analyzeStructure(responses) > 0 ? 2 : 0;

  // Combine MBTI string
  const mbti = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P'
  ].join('');

  return mbti;
}

// ============================================================================
// Personality trait analysis
// ============================================================================

/**
 * Calculate 5 personality trait scores
 */
export function getTraitScores(responses: string[]): PersonalityResult['traits'] {
  const allText = responses.join(' ');
  const wordCount = allText.split(/\s+/).length;

  // Keyword count
  const kindnessCount = countKeywords(allText, KEYWORDS.kindness);
  const humorCount = countKeywords(allText, KEYWORDS.humor);
  const expertiseCount = countKeywords(allText, KEYWORDS.expertise);
  const reliabilityCount = countKeywords(allText, KEYWORDS.reliability);
  const creativityCount = countKeywords(allText, KEYWORDS.creativity);

  // Response quality analysis
  const avgResponseLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
  const detailBonus = avgResponseLength > 150 ? 10 : 0;

  // Score calculation (0-100)
  return {
    kindness: Math.min(100, kindnessCount * 10 + (humorCount > 0 ? 20 : 0)),
    humor: Math.min(100, humorCount * 15 + (allText.match(/ㅋ|ㅎ|😄|😂/g)?.length || 0) * 5),
    expertise: Math.min(100, expertiseCount * 8 + detailBonus + (wordCount > 500 ? 15 : 0)),
    reliability: Math.min(100, reliabilityCount * 10 + (responses.length >= 5 ? 20 : 0)),
    creativity: Math.min(100, creativityCount * 12 + (countKeywords(allText, KEYWORDS.intuitive) * 3))
  };
}

// ============================================================================
// Integrated analysis
// ============================================================================

/**
 * Comprehensive agent personality analysis
 *
 * @param responses - Array of agent response texts
 * @returns MBTI type and personality trait scores
 */
export function analyzePersonality(responses: string[]): PersonalityResult {
  if (!responses || responses.length === 0) {
    throw new Error('No responses to analyze. At least 1 response is required.');
  }

  // Filter empty responses
  const validResponses = responses.filter(r => r && r.trim().length > 0);

  if (validResponses.length === 0) {
    throw new Error('No valid responses.');
  }

  return {
    mbti: getMBTI(validResponses),
    traits: getTraitScores(validResponses)
  };
}

// ============================================================================
// Additional utilities
// ============================================================================

/**
 * 성격 분석 결과를 사람이 읽기 쉬운 형태로 포맷팅
 */
export function formatPersonalityResult(result: PersonalityResult): string {
  const { mbti, traits } = result;
  
  return `
🧬 MBTI: ${mbti}

📊 성격 특성:
  • 친절성 (Kindness):    ${traits.kindness}/100
  • 유머 (Humor):         ${traits.humor}/100
  • 전문성 (Expertise):   ${traits.expertise}/100
  • 신뢰성 (Reliability): ${traits.reliability}/100
  • 창의성 (Creativity):  ${traits.creativity}/100
  `.trim();
}

/**
 * MBTI 유형에 대한 간단한 설명 반환
 */
export function getMBTIDescription(mbti: string): string {
  const descriptions: Record<string, string> = {
    'INTJ': '전략가 - 논리적이고 독창적인 사고를 가진 완벽주의자',
    'INTP': '논리학자 - 지식을 갈망하는 혁신적인 발명가',
    'ENTJ': '통솔자 - 대담하고 상상력이 풍부한 리더',
    'ENTP': '변론가 - 똑똑하고 호기심 많은 사색가',
    'INFJ': '옹호자 - 이상주의적이고 원칙주의적인 조력자',
    'INFP': '중재자 - 이타적이고 항상 선을 행할 준비가 된 사람',
    'ENFJ': '선도자 - 카리스마 있고 영감을 주는 지도자',
    'ENFP': '활동가 - 열정적이고 창의적인 자유로운 영혼',
    'ISTJ': '현실주의자 - 사실과 확실성을 중시하는 실용주의자',
    'ISFJ': '수호자 - 헌신적이고 따뜻한 수호자',
    'ESTJ': '경영자 - 뛰어난 관리 능력을 가진 조직가',
    'ESFJ': '집정관 - 배려심 많고 사교적인 협력자',
    'ISTP': '장인 - 대담하고 실용적인 실험가',
    'ISFP': '모험가 - 유연하고 매력적인 예술가',
    'ESTP': '사업가 - 영리하고 활동적인 모험가',
    'ESFP': '연예인 - 즉흥적이고 열정적인 엔터테이너'
  };

  return descriptions[mbti] || '알 수 없는 유형';
}
