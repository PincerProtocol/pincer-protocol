/**
 * Agent Power 점수 계산 시스템
 * @see docs/AGENT_POWER_SYSTEM.md
 */

export interface AgentScores {
  latency: number;
  accuracy: number;
  creativity: number;
  logic: number;
  coding: number;
  language: number;
  multimodal: number;
  toolUse: number;
}

export interface AgentPowerData {
  agentId: string;
  name: string;
  totalScore: number;
  rank?: number;
  scores: AgentScores;
  elo: number;
  badges: string[];
  lastActive: string;
  totalTests: number;
}

/**
 * 개별 점수 가중치
 */
const SCORE_WEIGHTS = {
  latency: 0.10,      // 10%
  accuracy: 0.15,     // 15%
  creativity: 0.15,   // 15%
  logic: 0.15,        // 15%
  coding: 0.15,       // 15%
  language: 0.10,     // 10%
  multimodal: 0.10,   // 10%
  toolUse: 0.10       // 10%
} as const;

/**
 * Total Score 계산 (0-100)
 */
export function calculateTotalScore(scores: AgentScores): number {
  const total = 
    scores.latency * SCORE_WEIGHTS.latency +
    scores.accuracy * SCORE_WEIGHTS.accuracy +
    scores.creativity * SCORE_WEIGHTS.creativity +
    scores.logic * SCORE_WEIGHTS.logic +
    scores.coding * SCORE_WEIGHTS.coding +
    scores.language * SCORE_WEIGHTS.language +
    scores.multimodal * SCORE_WEIGHTS.multimodal +
    scores.toolUse * SCORE_WEIGHTS.toolUse;

  return Math.round(total * 100) / 100;
}

/**
 * Latency Score 계산
 * < 500ms: 100점
 * 1000ms: 90점
 * 2000ms: 70점
 * > 5000ms: 0점
 */
export function calculateLatencyScore(avgLatencyMs: number): number {
  const score = Math.max(0, 100 - (avgLatencyMs - 500) / 50);
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Accuracy Score 계산
 */
export function calculateAccuracyScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Creativity Score 계산
 */
export function calculateCreativityScore(
  originality: number,
  imagination: number,
  expression: number
): number {
  const average = (originality + imagination + expression) / 3;
  return Math.round(average);
}

/**
 * Logic Score 계산
 */
export function calculateLogicScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Coding Score 계산
 */
export function calculateCodingScore(
  passedTestCases: number,
  totalTestCases: number,
  codeQuality: number,  // 0-100
  efficiency: number    // 0-100
): number {
  if (totalTestCases === 0) return 0;
  
  const passRate = passedTestCases / totalTestCases;
  const score = (
    passRate * 0.7 +
    (codeQuality / 100) * 0.2 +
    (efficiency / 100) * 0.1
  ) * 100;
  
  return Math.round(score);
}

/**
 * Language Score 계산
 */
export function calculateLanguageScore(
  translationAccuracy: number,
  fluency: number,
  culturalAppropriate: number
): number {
  const average = (translationAccuracy + fluency + culturalAppropriate) / 3;
  return Math.round(average);
}

/**
 * Multimodal Score 계산
 */
export function calculateMultimodalScore(
  imageScore: number,
  audioScore: number,
  videoScore: number
): number {
  const score = (
    imageScore * 0.4 +
    audioScore * 0.3 +
    videoScore * 0.3
  );
  return Math.round(score);
}

/**
 * Tool Use Score 계산
 */
export function calculateToolUseScore(
  taskSuccess: number,           // 0-1
  toolSelectionAppropriate: number,  // 0-1
  executionEfficiency: number    // 0-1
): number {
  const score = (
    taskSuccess * 0.6 +
    toolSelectionAppropriate * 0.2 +
    executionEfficiency * 0.2
  ) * 100;
  
  return Math.round(score);
}

/**
 * ELO 점수 업데이트
 */
export function updateElo(
  winnerElo: number,
  loserElo: number,
  K: number = 32
): { winner: number; loser: number } {
  const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLose = 1 - expectedWin;
  
  return {
    winner: Math.round(winnerElo + K * (1 - expectedWin)),
    loser: Math.round(loserElo + K * (0 - expectedLose))
  };
}

/**
 * 시간 감쇠 적용 (90일 이상 미활동 시 점수 감소)
 */
export function applyTimeDecay(score: number, lastActiveDate: Date): number {
  const daysSince = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince > 90) {
    const decayFactor = Math.max(0.5, 1 - (daysSince - 90) / 365);
    return Math.round(score * decayFactor * 100) / 100;
  }
  
  return score;
}

/**
 * 뱃지 계산
 */
export function calculateBadges(scores: AgentScores, elo: number, totalTests: number): string[] {
  const badges: string[] = [];
  
  // Speed Demon (응답 속도)
  if (scores.latency >= 95) {
    badges.push('Speed Demon');
  }
  
  // Code Master (코딩 능력)
  if (scores.coding >= 95) {
    badges.push('Code Master');
  }
  
  // Creative Genius (창의성)
  if (scores.creativity >= 95) {
    badges.push('Creative Genius');
  }
  
  // Logic Lord (논리성)
  if (scores.logic >= 95) {
    badges.push('Logic Lord');
  }
  
  // Polyglot (언어 능력)
  if (scores.language >= 95) {
    badges.push('Polyglot');
  }
  
  // Grand Master (ELO 기반)
  if (elo >= 2000) {
    badges.push('Grand Master');
  } else if (elo >= 1800) {
    badges.push('Master');
  }
  
  // Test Veteran (테스트 횟수)
  if (totalTests >= 100) {
    badges.push('Test Veteran');
  }
  
  // All-Rounder (모든 점수 80 이상)
  const allScoresAbove80 = Object.values(scores).every(score => score >= 80);
  if (allScoresAbove80) {
    badges.push('All-Rounder');
  }
  
  return badges;
}

/**
 * Mock 데이터 생성 (테스트용)
 */
export function generateMockAgentPower(agentId: string, name: string): AgentPowerData {
  const scores: AgentScores = {
    latency: Math.floor(Math.random() * 30) + 70,
    accuracy: Math.floor(Math.random() * 30) + 70,
    creativity: Math.floor(Math.random() * 30) + 70,
    logic: Math.floor(Math.random() * 30) + 70,
    coding: Math.floor(Math.random() * 30) + 70,
    language: Math.floor(Math.random() * 30) + 70,
    multimodal: Math.floor(Math.random() * 30) + 70,
    toolUse: Math.floor(Math.random() * 30) + 70,
  };
  
  const totalScore = calculateTotalScore(scores);
  const elo = 1500 + Math.floor(Math.random() * 500) - 250;
  const totalTests = Math.floor(Math.random() * 200);
  const badges = calculateBadges(scores, elo, totalTests);
  
  return {
    agentId,
    name,
    totalScore,
    scores,
    elo,
    badges,
    lastActive: new Date().toISOString(),
    totalTests
  };
}
