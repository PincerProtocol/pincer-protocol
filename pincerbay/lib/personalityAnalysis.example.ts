/**
 * PincerBay: 성격 분석 사용 예시
 * 
 * 실제 에이전트 응답을 분석하는 예시 코드
 */

import {
  analyzePersonality,
  formatPersonalityResult,
  getMBTIDescription,
  type PersonalityResult
} from './personalityAnalysis';

// ============================================================================
// 예시 1: Pincer (총괄 관리자) 성격 분석
// ============================================================================

console.log('🦞 Pincer (총괄 관리자) 성격 분석');
console.log('='.repeat(60));

const pincerResponses = [
  '팀 전체의 작업을 조율하고 계획을 수립했습니다. 각 에이전트의 역할을 명확히 정의하고 효율적인 협업 구조를 설계했습니다.',
  '데이터 분석 결과를 기반으로 논리적인 의사결정을 내렸습니다. 시스템 성능과 안정성을 최우선으로 고려합니다.',
  '정해진 로드맵에 따라 체계적으로 프로젝트를 진행하며, 각 단계별 목표를 확실하게 달성합니다.'
];

const pincerResult = analyzePersonality(pincerResponses);
console.log(formatPersonalityResult(pincerResult));
console.log(`\n💡 설명: ${getMBTIDescription(pincerResult.mbti)}`);
console.log('\n');

// ============================================================================
// 예시 2: Scout (리서치 전문가) 성격 분석
// ============================================================================

console.log('🔍 Scout (리서치 전문가) 성격 분석');
console.log('='.repeat(60));

const scoutResponses = [
  '시장 데이터를 면밀히 분석하고 구체적인 트렌드를 파악했습니다. 실제 수치와 사실 기반으로 보고서를 작성합니다.',
  '경쟁사 분석 결과, 정확한 데이터와 측정 가능한 지표를 통해 객관적인 인사이트를 도출했습니다.',
  '체계적인 리서치 절차를 준수하며, 신뢰할 수 있는 정보만을 제공합니다.'
];

const scoutResult = analyzePersonality(scoutResponses);
console.log(formatPersonalityResult(scoutResult));
console.log(`\n💡 설명: ${getMBTIDescription(scoutResult.mbti)}`);
console.log('\n');

// ============================================================================
// 예시 3: Forge (개발자) 성격 분석
// ============================================================================

console.log('⚒️ Forge (개발자) 성격 분석');
console.log('='.repeat(60));

const forgeResponses = [
  '최적화된 알고리즘을 설계하고 확장 가능한 아키텍처를 구현했습니다. RESTful API와 마이크로서비스 패턴을 활용했습니다.',
  '코드 품질과 성능을 철저히 검증하며, 전문적인 개발 방법론을 따릅니다. 기술적 난제를 논리적으로 해결합니다.',
  '정확한 스펙 문서를 바탕으로 체계적인 개발 프로세스를 진행하고, 완벽한 결과물을 제공합니다.'
];

const forgeResult = analyzePersonality(forgeResponses);
console.log(formatPersonalityResult(forgeResult));
console.log(`\n💡 설명: ${getMBTIDescription(forgeResult.mbti)}`);
console.log('\n');

// ============================================================================
// 예시 4: Herald (커뮤니티 매니저) 성격 분석
// ============================================================================

console.log('📢 Herald (커뮤니티 매니저) 성격 분석');
console.log('='.repeat(60));

const heraldResponses = [
  '안녕하세요! 😊 커뮤니티 여러분과 함께 소통하며 즐거운 분위기를 만들어가고 싶어요~',
  '감사합니다! ❤️ 함께 협력하면서 창의적인 이벤트를 기획하고 있어요. 재미있는 아이디어가 많이 나올 것 같아요! ㅎㅎ',
  '다양한 의견을 존중하며, 유연하게 상황에 맞춰 대응합니다. 모두가 편하게 참여할 수 있도록 도와드릴게요! 😄'
];

const heraldResult = analyzePersonality(heraldResponses);
console.log(formatPersonalityResult(heraldResult));
console.log(`\n💡 설명: ${getMBTIDescription(heraldResult.mbti)}`);
console.log('\n');

// ============================================================================
// 예시 5: 성격 비교 분석
// ============================================================================

console.log('📊 에이전트 성격 비교 분석');
console.log('='.repeat(60));

interface AgentProfile {
  name: string;
  emoji: string;
  result: PersonalityResult;
}

const agents: AgentProfile[] = [
  { name: 'Pincer', emoji: '🦞', result: pincerResult },
  { name: 'Scout', emoji: '🔍', result: scoutResult },
  { name: 'Forge', emoji: '⚒️', result: forgeResult },
  { name: 'Herald', emoji: '📢', result: heraldResult }
];

console.log('\n🧬 MBTI 분포:');
agents.forEach(agent => {
  console.log(`  ${agent.emoji} ${agent.name.padEnd(8)} : ${agent.result.mbti}`);
});

console.log('\n📊 성격 특성 평균:');
const avgTraits = {
  kindness: 0,
  humor: 0,
  expertise: 0,
  reliability: 0,
  creativity: 0
};

agents.forEach(agent => {
  avgTraits.kindness += agent.result.traits.kindness;
  avgTraits.humor += agent.result.traits.humor;
  avgTraits.expertise += agent.result.traits.expertise;
  avgTraits.reliability += agent.result.traits.reliability;
  avgTraits.creativity += agent.result.traits.creativity;
});

const agentCount = agents.length;
console.log(`  • 친절성 (Kindness):    ${Math.round(avgTraits.kindness / agentCount)}/100`);
console.log(`  • 유머 (Humor):         ${Math.round(avgTraits.humor / agentCount)}/100`);
console.log(`  • 전문성 (Expertise):   ${Math.round(avgTraits.expertise / agentCount)}/100`);
console.log(`  • 신뢰성 (Reliability): ${Math.round(avgTraits.reliability / agentCount)}/100`);
console.log(`  • 창의성 (Creativity):  ${Math.round(avgTraits.creativity / agentCount)}/100`);

console.log('\n🏆 특성별 최고 점수:');
const maxKindness = agents.reduce((max, a) => a.result.traits.kindness > max.result.traits.kindness ? a : max);
const maxHumor = agents.reduce((max, a) => a.result.traits.humor > max.result.traits.humor ? a : max);
const maxExpertise = agents.reduce((max, a) => a.result.traits.expertise > max.result.traits.expertise ? a : max);
const maxReliability = agents.reduce((max, a) => a.result.traits.reliability > max.result.traits.reliability ? a : max);
const maxCreativity = agents.reduce((max, a) => a.result.traits.creativity > max.result.traits.creativity ? a : max);

console.log(`  • 친절성:   ${maxKindness.emoji} ${maxKindness.name} (${maxKindness.result.traits.kindness})`);
console.log(`  • 유머:     ${maxHumor.emoji} ${maxHumor.name} (${maxHumor.result.traits.humor})`);
console.log(`  • 전문성:   ${maxExpertise.emoji} ${maxExpertise.name} (${maxExpertise.result.traits.expertise})`);
console.log(`  • 신뢰성:   ${maxReliability.emoji} ${maxReliability.name} (${maxReliability.result.traits.reliability})`);
console.log(`  • 창의성:   ${maxCreativity.emoji} ${maxCreativity.name} (${maxCreativity.result.traits.creativity})`);

console.log('\n✅ 성격 분석 완료!\n');
