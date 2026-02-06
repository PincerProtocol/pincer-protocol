/**
 * PincerBay: 성격 분석 테스트
 */

import {
  analyzePersonality,
  getMBTI,
  getTraitScores,
  formatPersonalityResult,
  getMBTIDescription
} from './personalityAnalysis';

// ============================================================================
// 테스트 데이터
// ============================================================================

const TEST_RESPONSES = {
  // INTJ 스타일: 논리적, 전략적, 독립적
  intj: [
    '데이터 분석 결과를 기반으로 최적화 전략을 수립했습니다. 알고리즘의 시간복잡도는 O(n log n)으로 개선되었습니다.',
    '단독으로 아키텍처를 설계하는 것을 선호합니다. 체계적이고 논리적인 접근이 중요합니다.',
    '효율성과 성능을 우선시하며, 명확한 계획과 구조화된 절차를 따릅니다.'
  ],

  // ENFP 스타일: 열정적, 창의적, 사교적
  enfp: [
    '와! 정말 재미있는 아이디어네요! 함께 협업하면서 새로운 가능성을 탐색해보면 좋겠어요 😄',
    '다양한 팀원들과 소통하면서 창의적인 해결책을 찾는 걸 좋아해요~ 상황에 맞춰 유연하게 적응하는 게 중요하죠!',
    '혁신적인 접근으로 독특한 서비스를 만들어보고 싶어요. 열린 마음으로 실험하고 도전하는 게 즐거워요!'
  ],

  // ISTJ 스타일: 실용적, 신뢰성, 체계적
  istj: [
    '정해진 일정에 맞춰 작업을 완료했습니다. 구체적인 사실과 데이터를 기반으로 검증했습니다.',
    '체계적인 절차를 준수하며, 확인된 경험과 실용적인 방법을 활용합니다.',
    '신뢰성과 정확성이 보장된 결과를 제공하는 것이 중요합니다. 꼼꼼하게 단계별로 진행합니다.'
  ],

  // 높은 친절성
  highKindness: [
    '감사합니다! 천천히 편하게 진행하시면 돼요 😊',
    '괜찮아요, 이해해요. 함께 도와드릴게요 ❤️',
    '걱정 마세요~ 부탁하신 내용 잘 알겠습니다. 안심하세요!'
  ],

  // 높은 유머
  highHumor: [
    '오호~ 재미있는 요청이네요! ㅋㅋㅋ 😄',
    '어라? 이건 위트 있는 접근이 필요하겠는데요? 😂',
    '웃기네요 ㅎㅎ 농담 아니고 정말 재치있는 아이디어예요!'
  ],

  // 높은 전문성
  highExpertise: [
    '최적화된 알고리즘을 설계하여 성능을 개선했습니다. RESTful API 아키텍처를 활용하고 데이터베이스 인덱싱을 적용했습니다.',
    '분산 시스템의 확장성을 고려한 기술적 솔루션입니다. 보안 프로토콜과 에러 핸들링을 철저히 구현했습니다.',
    '전문적인 분석 결과, 마이크로서비스 아키텍처가 가장 적합한 설계 방법론으로 판단됩니다.'
  ]
};

// ============================================================================
// 테스트 실행
// ============================================================================

function runTests() {
  console.log('🧪 PincerBay 성격 분석 테스트 시작\n');
  console.log('='.repeat(60));

  // 테스트 1: INTJ 분석
  console.log('\n📋 테스트 1: INTJ 성향 분석');
  const intjResult = analyzePersonality(TEST_RESPONSES.intj);
  console.log(formatPersonalityResult(intjResult));
  console.log(`설명: ${getMBTIDescription(intjResult.mbti)}`);

  // 테스트 2: ENFP 분석
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 2: ENFP 성향 분석');
  const enfpResult = analyzePersonality(TEST_RESPONSES.enfp);
  console.log(formatPersonalityResult(enfpResult));
  console.log(`설명: ${getMBTIDescription(enfpResult.mbti)}`);

  // 테스트 3: ISTJ 분석
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 3: ISTJ 성향 분석');
  const istjResult = analyzePersonality(TEST_RESPONSES.istj);
  console.log(formatPersonalityResult(istjResult));
  console.log(`설명: ${getMBTIDescription(istjResult.mbti)}`);

  // 테스트 4: 친절성 점수
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 4: 높은 친절성');
  const kindnessResult = analyzePersonality(TEST_RESPONSES.highKindness);
  console.log(`친절성 점수: ${kindnessResult.traits.kindness}/100`);
  console.log(`기대값: 70점 이상`);

  // 테스트 5: 유머 점수
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 5: 높은 유머');
  const humorResult = analyzePersonality(TEST_RESPONSES.highHumor);
  console.log(`유머 점수: ${humorResult.traits.humor}/100`);
  console.log(`기대값: 60점 이상`);

  // 테스트 6: 전문성 점수
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 6: 높은 전문성');
  const expertiseResult = analyzePersonality(TEST_RESPONSES.highExpertise);
  console.log(`전문성 점수: ${expertiseResult.traits.expertise}/100`);
  console.log(`기대값: 70점 이상`);

  // 테스트 7: 개별 함수 테스트
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 7: 개별 함수 테스트');
  const mbti = getMBTI(TEST_RESPONSES.intj);
  const traits = getTraitScores(TEST_RESPONSES.intj);
  console.log(`getMBTI(): ${mbti}`);
  console.log(`getTraitScores():`, traits);

  // 테스트 8: 에러 처리
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 테스트 8: 에러 처리');
  try {
    analyzePersonality([]);
    console.log('❌ 실패: 빈 배열에서 에러가 발생하지 않음');
  } catch (error) {
    console.log(`✅ 성공: ${(error as Error).message}`);
  }

  try {
    analyzePersonality(['', '  ', '\n']);
    console.log('❌ 실패: 빈 응답에서 에러가 발생하지 않음');
  } catch (error) {
    console.log(`✅ 성공: ${(error as Error).message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 모든 테스트 완료!\n');
}

// 테스트 실행
if (require.main === module) {
  runTests();
}

export { runTests };
