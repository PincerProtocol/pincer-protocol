/**
 * 🛡️ Security Utilities Test Suite
 */

import {
  sanitizeInput,
  sanitizeObject,
  validateWalletAddress,
  detectSuspiciousInput,
  isValidApiKeyFormat
} from "../security"

describe("🛡️ Security Utilities", () => {
  
  describe("sanitizeInput", () => {
    it("should escape HTML special characters", () => {
      const input = "<script>alert('xss')</script>"
      const result = sanitizeInput(input)
      expect(result).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;")
    })

    it("should remove null bytes", () => {
      const input = "test\0malicious"
      const result = sanitizeInput(input)
      expect(result).not.toContain("\0")
    })

    it("should trim whitespace", () => {
      const input = "  test  "
      const result = sanitizeInput(input)
      expect(result).toBe("test")
    })

    it("should handle empty strings", () => {
      expect(sanitizeInput("")).toBe("")
    })
  })

  describe("sanitizeObject", () => {
    it("should sanitize all string values in object", () => {
      const input = {
        name: "<script>alert('xss')</script>",
        bio: "Normal text",
        nested: {
          description: "<img src=x onerror=alert(1)>"
        }
      }
      const result = sanitizeObject(input)
      
      expect(result.name).toContain("&lt;script&gt;")
      expect(result.bio).toBe("Normal text")
      expect(result.nested.description).toContain("&lt;img")
    })
  })

  describe("validateWalletAddress", () => {
    it("should validate correct Ethereum addresses", () => {
      const validAddresses = [
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
        "0x0000000000000000000000000000000000000000",
        "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
      ]
      
      validAddresses.forEach(address => {
        expect(validateWalletAddress(address)).toBe(true)
      })
    })

    it("should reject invalid addresses", () => {
      const invalidAddresses = [
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bE", // too short
        "742d35Cc6634C0532925a3b844Bc9e7595f0bEb0", // missing 0x
        "0xZZZZ35Cc6634C0532925a3b844Bc9e7595f0bEb0", // invalid hex
        "not-an-address",
        "",
        null,
        undefined
      ]
      
      invalidAddresses.forEach(address => {
        expect(validateWalletAddress(address as any)).toBe(false)
      })
    })
  })

  describe("detectSuspiciousInput", () => {
    it("should detect XSS attempts", () => {
      const maliciousInputs = [
        "<script>alert(1)</script>",
        "javascript:alert(1)",
        "<img src=x onerror=alert(1)>",
        "onclick=alert(1)",
        "eval(malicious)",
        "<iframe src='evil.com'></iframe>",
        "vbscript:msgbox(1)"
      ]
      
      maliciousInputs.forEach(input => {
        expect(detectSuspiciousInput(input)).toBe(true)
      })
    })

    it("should allow safe input", () => {
      const safeInputs = [
        "Normal text",
        "Email: user@example.com",
        "Price: $100",
        "Code snippet: const x = 1"
      ]
      
      safeInputs.forEach(input => {
        expect(detectSuspiciousInput(input)).toBe(false)
      })
    })
  })

  describe("isValidApiKeyFormat", () => {
    it("should validate API key format", () => {
      const validKeys = [
        "a".repeat(32), // minimum length
        "abcdef0123456789ABCDEF0123456789",
        "test-api-key-1234567890-test-key"
      ]
      
      validKeys.forEach(key => {
        expect(isValidApiKeyFormat(key)).toBe(true)
      })
    })

    it("should reject invalid formats", () => {
      const invalidKeys = [
        "short", // too short
        "has space in key",
        "has@special#chars!",
        "",
        null,
        undefined
      ]
      
      invalidKeys.forEach(key => {
        expect(isValidApiKeyFormat(key as any)).toBe(false)
      })
    })
  })
})
