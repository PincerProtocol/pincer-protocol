import { z } from "zod"

// Ethereum wallet address validation
export const WalletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  .transform(addr => addr.toLowerCase())

// Soul purchase validation
export const PurchaseSoulSchema = z.object({
  wallet: WalletAddressSchema,
  // Optional fields for future use
  amount: z.number().positive().optional(),
  referrer: WalletAddressSchema.optional()
})

// Soul creation validation
export const CreateSoulSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),
  price: z.number()
    .min(1, "Price must be at least 1")
    .max(1000000, "Price must be less than 1,000,000"),
  category: z.enum(["anime", "celebrity", "ai", "crypto", "other"]),
  tags: z.array(z.string().max(50)).max(10).optional(),
  imageUrl: z.string().url("Invalid image URL").optional()
})

// Airdrop claim validation
export const AirdropClaimSchema = z.object({
  wallet: WalletAddressSchema,
  code: z.string()
    .min(1, "Code is required")
    .max(100, "Invalid code")
    .trim()
})

// Generic ID validation
export const IdSchema = z.string()
  .min(1, "ID is required")
  .max(100, "Invalid ID")

// Validate and sanitize input
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Get first error message
  const firstError = result.error.issues[0]
  return { 
    success: false, 
    error: firstError?.message || "Validation failed" 
  }
}
