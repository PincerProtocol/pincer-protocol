/**
 * 🛡️ Authentication & Authorization Module
 * Session management, Agent authentication, API key validation
 */

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { Session } from "next-auth"
import crypto from "crypto"

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
// Agent Signature Verification
// ============================================================================

/**
 * Verify Agent's cryptographic signature
 * @param agentId - Unique agent identifier
 * @param signature - Signature to verify
 * @param message - Optional message that was signed (defaults to agentId)
 * @returns true if signature is valid
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
    // Get agent's public key from environment or database
    const agentSecret = process.env.AGENT_SIGNATURE_SECRET || "default-secret-change-in-production"
    
    // Message to verify (default to agentId)
    const messageToVerify = message || agentId
    
    // Create expected signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", agentSecret)
      .update(`${agentId}:${messageToVerify}`)
      .digest("hex")
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error("Agent signature verification failed:", error)
    return false
  }
}

/**
 * Generate signature for agent (for testing or initial setup)
 */
export function generateAgentSignature(agentId: string, message?: string): string {
  const agentSecret = process.env.AGENT_SIGNATURE_SECRET || "default-secret-change-in-production"
  const messageToSign = message || agentId
  
  return crypto
    .createHmac("sha256", agentSecret)
    .update(`${agentId}:${messageToSign}`)
    .digest("hex")
}

// ============================================================================
// API Key Management
// ============================================================================

interface ApiKeyData {
  valid: boolean
  agentId?: string
  scopes?: string[]
  expiresAt?: Date
}

/**
 * Generate API key for agent
 * @param agentId - Unique agent identifier
 * @param expiresInDays - Optional expiration period (default: 365 days)
 * @returns Cryptographically secure API key
 */
export function generateApiKey(agentId: string, expiresInDays = 365): string {
  // Generate random bytes for API key
  const randomBytes = crypto.randomBytes(32).toString("hex")
  
  // Create timestamp
  const timestamp = Date.now()
  const expiresAt = timestamp + (expiresInDays * 24 * 60 * 60 * 1000)
  
  // Encode: agentId + timestamp + expiry + random
  const payload = `${agentId}:${timestamp}:${expiresAt}:${randomBytes}`
  
  // Sign the payload
  const secret = process.env.API_KEY_SECRET || "change-this-secret-in-production"
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
  
  // Combine and encode as base64
  const apiKey = Buffer.from(`${payload}:${signature}`).toString("base64")
  
  return `pncr_${apiKey}` // Prefix for easy identification
}

/**
 * Validate API key and extract agent information
 * @param apiKey - API key to validate
 * @returns Validation result with agent data if valid
 */
export function validateApiKey(apiKey: string): ApiKeyData {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false }
  }

  // Check prefix
  if (!apiKey.startsWith("pncr_")) {
    return { valid: false }
  }

  try {
    // Remove prefix and decode
    const encoded = apiKey.slice(5) // Remove "pncr_"
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")
    const parts = decoded.split(":")
    
    if (parts.length !== 5) {
      return { valid: false }
    }
    
    const [agentId, timestamp, expiresAt, randomBytes, signature] = parts
    
    // Verify signature
    const secret = process.env.API_KEY_SECRET || "change-this-secret-in-production"
    const payload = `${agentId}:${timestamp}:${expiresAt}:${randomBytes}`
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")
    
    if (signature !== expectedSignature) {
      return { valid: false }
    }
    
    // Check expiration
    const expiryDate = new Date(parseInt(expiresAt))
    if (Date.now() > parseInt(expiresAt)) {
      return { 
        valid: false, 
        agentId,
        expiresAt: expiryDate
      }
    }
    
    // API key is valid
    return {
      valid: true,
      agentId,
      expiresAt: expiryDate,
      scopes: ["read", "write"] // Could be extended with granular permissions
    }
  } catch (error) {
    console.error("API key validation error:", error)
    return { valid: false }
  }
}

/**
 * Extract and validate API key from request
 */
export function extractApiKey(req: Request): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  
  // Check X-API-Key header
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
        message: "API key required. Provide via Authorization header or X-API-Key header."
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

/**
 * Type guard for API key validation result
 */
export function isValidApiKey(result: ApiKeyData | Response): result is ApiKeyData {
  return !(result instanceof Response) && result.valid === true
}
