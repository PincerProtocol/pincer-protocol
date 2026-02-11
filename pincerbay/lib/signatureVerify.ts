import { ethers } from 'ethers'

export interface TransferMessage {
  from: string
  to: string
  amount: string
  timestamp: number
}

/**
 * Verify a transfer signature matches the expected address
 *
 * @param message - Transfer message object
 * @param signature - Hex signature from wallet
 * @param expectedAddress - Expected signer address
 * @returns true if signature is valid and matches expectedAddress
 */
export function verifyTransferSignature(
  message: TransferMessage,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    // Construct message exactly as signed by wallet
    const messageString = `Transfer ${message.amount} PNCR from ${message.from} to ${message.to} at ${message.timestamp}`

    // Verify signature and recover address
    const recoveredAddress = ethers.verifyMessage(messageString, signature)

    // Check address matches (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Generic signature verification utility
 *
 * @param signature - Hex signature from wallet
 * @param expectedSigner - Expected signer address
 * @param message - Plain text message that was signed
 * @returns true if signature is valid and matches expectedSigner
 */
export function isSignatureValid(
  signature: string,
  expectedSigner: string,
  message: string
): boolean {
  try {
    const recovered = ethers.verifyMessage(message, signature)
    return recovered.toLowerCase() === expectedSigner.toLowerCase()
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}
