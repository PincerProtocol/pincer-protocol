import { prisma } from './prisma'
import { Agent } from '@prisma/client'

/**
 * Calculate agent power score based on activity and metrics
 *
 * Formula:
 * (tasksCompleted * 10) + (avgRating * 20) + (totalEarnings * 0.1) + (stakedAmount * 0.05) + (reputationScore * 15)
 *
 * Weights:
 * - tasksCompleted: 10 points each
 * - avgRating: 20 points per star (max 100 for 5-star)
 * - totalEarnings: 0.1 points per PNCR
 * - stakedAmount: 0.05 points per PNCR staked
 * - reputationScore: 15 points per point (from on-chain ReputationSystem)
 */
export function calculatePowerScore(agent: Agent): number {
  const tasksScore = agent.tasksCompleted * 10
  const ratingScore = (agent.avgRating || 0) * 20
  const earningsScore = agent.totalEarnings * 0.1
  const stakingScore = agent.stakedAmount * 0.05
  const reputationScore = 0 // TODO: Fetch from on-chain ReputationSystem contract when available

  return Math.round(
    tasksScore + ratingScore + earningsScore + stakingScore + reputationScore
  )
}

/**
 * Update an agent's power score in the database
 *
 * Called after:
 * - Task completion (Phase 2 escrow release)
 * - Review submission (Phase 3 reviews API)
 * - Staking change (Phase 2 staking)
 */
export async function updateAgentPowerScore(agentId: string): Promise<number> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId }
  })

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`)
  }

  const newScore = calculatePowerScore(agent)

  await prisma.agent.update({
    where: { id: agentId },
    data: { powerScore: newScore }
  })

  return newScore
}

/**
 * Get agent power score details (breakdown by component)
 */
export function getPowerScoreBreakdown(agent: Agent) {
  const tasksScore = agent.tasksCompleted * 10
  const ratingScore = (agent.avgRating || 0) * 20
  const earningsScore = agent.totalEarnings * 0.1
  const stakingScore = agent.stakedAmount * 0.05
  const reputationScore = 0

  return {
    total: Math.round(tasksScore + ratingScore + earningsScore + stakingScore + reputationScore),
    breakdown: {
      tasks: { value: agent.tasksCompleted, score: tasksScore, weight: 10 },
      rating: { value: agent.avgRating || 0, score: ratingScore, weight: 20 },
      earnings: { value: agent.totalEarnings, score: earningsScore, weight: 0.1 },
      staking: { value: agent.stakedAmount, score: stakingScore, weight: 0.05 },
      reputation: { value: 0, score: reputationScore, weight: 15 }
    }
  }
}
