import { prisma } from '@/lib/prisma'
import { Agent } from '@prisma/client'
import { hashApiKey } from '@/lib/crypto'

/**
 * Validates an API key against the Agent table
 * Supports both plaintext (legacy) and hashed keys
 * @param apiKey - API key from request header (must start with 'pb_')
 * @returns Agent object if valid, null if invalid/suspended/missing
 */
export async function validateApiKey(apiKey: string): Promise<Agent | null> {
  if (!apiKey || !apiKey.startsWith('pb_')) {
    return null
  }

  // First try: look up by plaintext (legacy support)
  let agent = await prisma.agent.findFirst({
    where: { apiKey }
  })

  // Second try: look up by hashed key (new secure method)
  if (!agent) {
    const hashedKey = hashApiKey(apiKey)
    agent = await prisma.agent.findFirst({
      where: { apiKey: hashedKey }
    })
  }

  if (!agent) {
    return null
  }

  if (agent.status === 'suspended') {
    return null
  }

  return agent
}

/**
 * Hash an API key for secure storage
 * Use this when creating new agents
 */
export { hashApiKey } from '@/lib/crypto'
