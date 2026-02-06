/**
 * 🛡️ Authentication & Authorization Module
 * Session management, Agent authentication, API key validation
 * Note: Uses Web Crypto API for Edge Runtime compatibility
 */

import { getServerSession } from "next-auth/next"
import type { Session, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ethers } from "ethers"

// ============================================================================
// NextAuth Configuration
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          return null
        }

        try {
          const recoveredAddress = ethers.verifyMessage(
            credentials.message,
            credentials.signature
          )

          if (recoveredAddress.toLowerCase() === credentials.address.toLowerCase()) {
            return {
              id: credentials.address,
              address: credentials.address,
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = (user as { address?: string }).address
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { address?: string }).address = token.address as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
}

// ============================================================================
// Session Authentication (Human Users)
// ============================================================================

export async function requireAuth(req?: Request): Promise<Session | Response> {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - Please connect your wallet" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
  
  return session
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export function isSessionValid(session: Session | Response): session is Session {
  return !(session instanceof Response)
}

// ============================================================================
// Agent Signature Verification (Simple Version - No Node.js crypto)
// ============================================================================

/**
 * Verify Agent's signature using simple hash comparison
 * For production, use proper cryptographic verification
 */
export function verifyAgentSignature(
  agentId: string, 
  signature: string,
  message?: string
): boolean {
  if (!agentId || !signature) {
    return false
  }

  try {
    const agentSecret = process.env.AGENT_SIGNATURE_SECRET || "default-secret-change-in-production"
    const messageToVerify = message || agentId
    
    // Simple signature verification (for production, use proper HMAC)
    const expectedSignature = simpleHash(`${agentId}:${messageToVerify}:${agentSecret}`)
    
    return signature === expectedSignature
  } catch (error) {
    console.error("Agent signature verification failed:", error)
    return false
  }
}

/**
 * Generate signature for agent
 */
export function generateAgentSignature(agentId: string, message?: string): string {
  const agentSecret = process.env.AGENT_SIGNATURE_SECRET || "default-secret-change-in-production"
  const messageToSign = message || agentId
  
  return simpleHash(`${agentId}:${messageToSign}:${agentSecret}`)
}

// ============================================================================
// API Key Management (Simple Version)
// ============================================================================

interface ApiKeyData {
  valid: boolean
  agentId?: string
  scopes?: string[]
  expiresAt?: Date
}

/**
 * Generate API key for agent
 */
export function generateApiKey(agentId: string, expiresInDays = 365): string {
  const timestamp = Date.now()
  const expiresAt = timestamp + (expiresInDays * 24 * 60 * 60 * 1000)
  const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  const payload = `${agentId}:${timestamp}:${expiresAt}:${random}`
  const secret = process.env.API_KEY_SECRET || "change-this-secret-in-production"
  const signature = simpleHash(`${payload}:${secret}`)
  
  const apiKey = btoa(`${payload}:${signature}`)
  
  return `pncr_${apiKey}`
}

/**
 * Validate API key and extract agent information
 */
export function validateApiKey(apiKey: string): ApiKeyData {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false }
  }

  if (!apiKey.startsWith("pncr_")) {
    return { valid: false }
  }

  try {
    const encoded = apiKey.slice(5)
    const decoded = atob(encoded)
    const parts = decoded.split(":")
    
    if (parts.length !== 5) {
      return { valid: false }
    }
    
    const [agentId, timestamp, expiresAt, randomBytes, signature] = parts
    
    const secret = process.env.API_KEY_SECRET || "change-this-secret-in-production"
    const payload = `${agentId}:${timestamp}:${expiresAt}:${randomBytes}`
    const expectedSignature = simpleHash(`${payload}:${secret}`)
    
    if (signature !== expectedSignature) {
      return { valid: false }
    }
    
    const expiryDate = new Date(parseInt(expiresAt))
    if (Date.now() > parseInt(expiresAt)) {
      return { valid: false, agentId, expiresAt: expiryDate }
    }
    
    return {
      valid: true,
      agentId,
      expiresAt: expiryDate,
      scopes: ["read", "write"]
    }
  } catch (error) {
    console.error("API key validation error:", error)
    return { valid: false }
  }
}

/**
 * Extract API key from request
 */
export function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  
  const apiKeyHeader = req.headers.get("x-api-key")
  if (apiKeyHeader) {
    return apiKeyHeader
  }
  
  return null
}

/**
 * Require valid API key for request
 */
export function requireApiKey(req: Request): ApiKeyData | Response {
  const apiKey = extractApiKey(req)
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        error: "Unauthorized",
        message: "API key required."
      }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
  
  const validation = validateApiKey(apiKey)
  
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ 
        error: "Unauthorized",
        message: "Invalid or expired API key"
      }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
  
  return validation
}

export function isValidApiKey(result: ApiKeyData | Response): result is ApiKeyData {
  return !(result instanceof Response) && result.valid === true
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simple hash function (for Edge Runtime compatibility)
 * For production, use proper crypto
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
