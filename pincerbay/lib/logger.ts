// Simple logger for Vercel serverless environment
// File-based logging not available on Vercel

const isDev = process.env.NODE_ENV !== "production"

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (isDev || process.env.LOG_LEVEL === 'debug') {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '')
    }
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '')
  },
  
  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, error.message, error.stack)
    } else {
      console.error(`[ERROR] ${message}`, error)
    }
  },
  
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '')
    }
  }
}

// Security event logger
export function logSecurityEvent(
  event: string, 
  details: Record<string, unknown>
) {
  console.warn(`[SECURITY] ${event}`, JSON.stringify({
    ...details,
    timestamp: new Date().toISOString()
  }))
}

// API request logger
export function logApiRequest(
  method: string,
  path: string,
  ip: string,
  userAgent?: string | null,
  userId?: string
) {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log(`[API] ${method} ${path}`, JSON.stringify({
      ip,
      userAgent,
      userId,
      timestamp: new Date().toISOString()
    }))
  }
}

// Error logger
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  if (error instanceof Error) {
    console.error(`[ERROR] ${error.message}`, error.stack, context)
  } else {
    console.error(`[ERROR] Unknown error`, error, context)
  }
}
