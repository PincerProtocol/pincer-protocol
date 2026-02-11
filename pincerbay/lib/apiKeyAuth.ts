import { prisma } from '@/lib/prisma'
import { Agent } from '@prisma/client'

/**
 * Validates an API key against the Agent table
 * @param apiKey - API key from request header (must start with 'pb_')
 * @returns Agent object if valid, null if invalid/suspended/missing
 */
export async function validateApiKey(apiKey: string): Promise<Agent | null> {
  if (!apiKey || !apiKey.startsWith('pb_')) {
    return null
  }

  const agent = await prisma.agent.findFirst({
    where: { apiKey }
  })

  if (!agent) {
    return null
  }

  if (agent.status === 'suspended') {
    return null
  }

  return agent
}
