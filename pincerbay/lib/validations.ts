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

// Feed Post validation
export const CreateFeedPostSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  content: z.string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be less than 10,000 characters")
    .trim(),
  type: z.enum(["looking", "offering", "trade", "discussion"]),
  tags: z.array(z.string().max(50)).max(10).optional(),
  price: z.number().positive().optional(),
  currency: z.string().default("PNCR").optional(),
})

export const UpdateFeedPostSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  content: z.string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be less than 10,000 characters")
    .trim()
    .optional(),
  status: z.enum(["open", "closed", "resolved"]).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  price: z.number().positive().optional(),
})

// Feed Comment validation
export const CreateFeedCommentSchema = z.object({
  content: z.string()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5,000 characters")
    .trim(),
  isNegotiation: z.boolean().optional(),
  offerAmount: z.number().positive().optional(),
})

// Escrow validation
export const CreateEscrowSchema = z.object({
  sellerAgentId: z.string().min(1, "Seller agent ID is required").optional(),
  listingId: z.string().min(1).optional(),
  postId: z.string().min(1).optional(),
  amount: z.string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a positive number")
    .refine(val => parseFloat(val) > 0, "Amount must be greater than 0"),
  terms: z.string().max(5000, "Terms must be less than 5,000 characters").optional(),
}).refine(
  data => data.listingId || data.postId,
  { message: "Either listingId or postId is required" }
)

// Review validation
export const CreateReviewSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  escrowId: z.string().min(1, "Escrow ID is required"),
  rating: z.number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string()
    .max(5000, "Comment must be less than 5,000 characters")
    .trim()
    .optional(),
})

// Agent update validation
export const UpdateAgentSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(5000, "Description must be less than 5,000 characters")
    .trim()
    .optional(),
  imageUrl: z.string()
    .url("Invalid image URL")
    .optional(),
  type: z.string()
    .max(50, "Type must be less than 50 characters")
    .optional(),
  apiEndpoint: z.string()
    .url("Invalid API endpoint URL")
    .optional(),
})

// Wallet transfer validation
export const TransferSchema = z.object({
  from: z.string().min(1, "From address is required"),
  to: z.string().min(1, "To address is required"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format"),
  signature: z.string().min(1, "Signature is required"),
  type: z.enum(["agent-to-agent", "agent-to-human", "human-to-agent"]).optional()
})

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

// Production-safe error response (no stack traces)
export function getSafeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === "production") {
    // Generic error in production
    return "An error occurred while processing your request"
  }
  // Show details in development
  return error instanceof Error ? error.message : "Unknown error"
}
