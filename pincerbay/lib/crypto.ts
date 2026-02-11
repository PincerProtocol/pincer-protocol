import { createHash, randomBytes } from 'crypto';

/**
 * Generate a secure API key
 * Format: pb_<random32chars>
 */
export function generateApiKey(): string {
  const random = randomBytes(24).toString('base64url'); // 32 chars
  return `pb_${random}`;
}

/**
 * Hash an API key using SHA-256
 * This allows for deterministic lookup while not storing plaintext
 * @param apiKey - The plaintext API key
 * @returns SHA-256 hash of the key
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Compare a plaintext API key with a stored hash
 * @param plaintext - The API key from the request
 * @param hash - The stored hash
 * @returns true if they match
 */
export function verifyApiKey(plaintext: string, hash: string): boolean {
  const hashedPlaintext = hashApiKey(plaintext);
  // Use timing-safe comparison to prevent timing attacks
  if (hashedPlaintext.length !== hash.length) return false;
  
  let result = 0;
  for (let i = 0; i < hashedPlaintext.length; i++) {
    result |= hashedPlaintext.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a secure random token (for sessions, OTP, etc.)
 * @param length - Number of bytes (default 32)
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash a password using SHA-256 with a salt
 * Note: For production, consider using bcrypt or argon2
 */
export function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Generate a random salt
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}
