import winston from "winston"
import path from "path"

const logDir = "logs"

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: { service: "pincerbay" },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(logDir, "error.log"), 
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Security events
    new winston.transports.File({ 
      filename: path.join(logDir, "security.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
})

// Add console transport for non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }))
}

// Security event logger
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>
) {
  logger.warn("Security Event", {
    event,
    ...details,
    timestamp: new Date().toISOString()
  })
}

// API request logger
export function logApiRequest(
  method: string,
  path: string,
  ip: string,
  userAgent?: string | null,
  userId?: string
) {
  logger.info("API Request", {
    method,
    path,
    ip,
    userAgent,
    userId,
    timestamp: new Date().toISOString()
  })
}

// Error logger
export function logError(
  error: Error | unknown,
  context?: Record<string, any>
) {
  if (error instanceof Error) {
    logger.error(error.message, {
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    })
  } else {
    logger.error("Unknown error", {
      error: String(error),
      ...context,
      timestamp: new Date().toISOString()
    })
  }
}
