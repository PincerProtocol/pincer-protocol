/**
 * 🛡️ Authentication Tests
 */

import {
  generateApiKey,
  validateApiKey,
  verifyAgentSignature,
  generateAgentSignature
} from "../auth"

// Mock environment variables
process.env.API_KEY_SECRET = "test-secret-key-for-testing-min-32-chars"
process.env.AGENT_SIGNATURE_SECRET = "test-agent-secret-for-testing-min-32-chars"

describe("🛡️ Authentication", () => {
  
  describe("API Key Management", () => {
    it("should generate valid API key", () => {
      const agentId = "agent-test-123"
      const apiKey = generateApiKey(agentId)
      
      expect(apiKey).toMatch(/^pncr_/)
      expect(apiKey.length).toBeGreaterThan(50)
    })

    it("should validate correctly generated API key", () => {
      const agentId = "agent-test-456"
      const apiKey = generateApiKey(agentId)
      
      const validation = validateApiKey(apiKey)
      
      expect(validation.valid).toBe(true)
      expect(validation.agentId).toBe(agentId)
      expect(validation.scopes).toContain("read")
      expect(validation.scopes).toContain("write")
    })

    it("should reject invalid API key", () => {
      const invalidKeys = [
        "invalid-key",
        "pncr_invalid",
        "",
        "pncr_" + Buffer.from("tampered:data").toString("base64")
      ]
      
      invalidKeys.forEach(key => {
        const validation = validateApiKey(key)
        expect(validation.valid).toBe(false)
      })
    })

    it("should reject expired API key", () => {
      // Generate key that expires in -1 days (already expired)
      const agentId = "agent-expired"
      const apiKey = generateApiKey(agentId, -1)
      
      const validation = validateApiKey(apiKey)
      
      expect(validation.valid).toBe(false)
      expect(validation.agentId).toBe(agentId)
    })

    it("should accept non-expired API key", () => {
      const agentId = "agent-valid"
      const apiKey = generateApiKey(agentId, 365) // 365 days
      
      const validation = validateApiKey(apiKey)
      
      expect(validation.valid).toBe(true)
      expect(validation.expiresAt).toBeInstanceOf(Date)
      expect(validation.expiresAt!.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe("Agent Signature Verification", () => {
    it("should generate and verify signature", () => {
      const agentId = "agent-sig-test"
      const signature = generateAgentSignature(agentId)
      
      expect(signature).toBeTruthy()
      expect(signature.length).toBeGreaterThan(32)
      
      const isValid = verifyAgentSignature(agentId, signature)
      expect(isValid).toBe(true)
    })

    it("should reject invalid signature", () => {
      const agentId = "agent-sig-test"
      const invalidSig = "invalid-signature-12345"
      
      const isValid = verifyAgentSignature(agentId, invalidSig)
      expect(isValid).toBe(false)
    })

    it("should reject signature for different agent", () => {
      const agentId1 = "agent-1"
      const agentId2 = "agent-2"
      
      const signature = generateAgentSignature(agentId1)
      
      // Try to use agent-1's signature for agent-2
      const isValid = verifyAgentSignature(agentId2, signature)
      expect(isValid).toBe(false)
    })

    it("should support custom messages", () => {
      const agentId = "agent-custom"
      const message = "custom-challenge-string"
      
      const signature = generateAgentSignature(agentId, message)
      
      // Should work with same message
      expect(verifyAgentSignature(agentId, signature, message)).toBe(true)
      
      // Should fail with different message
      expect(verifyAgentSignature(agentId, signature, "different-message")).toBe(false)
    })
  })
})
