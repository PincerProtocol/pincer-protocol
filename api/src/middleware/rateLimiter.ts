import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

// API 전체에 대한 기본 rate limiter (분당 60회)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 60, // 분당 최대 60회 요청
  standardHeaders: true, // RateLimit-* 헤더 반환
  legacyHeaders: false, // X-RateLimit-* 헤더 비활성화
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '60 seconds',
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: 60,
    });
  },
  skip: (req) => {
    // 테스트 환경에서는 rate limiting 비활성화
    return process.env.NODE_ENV === 'test';
  },
});

// 민감한 작업(트랜잭션 생성 등)에 대한 엄격한 limiter (분당 10회)
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many transaction requests, please slow down.',
    retryAfter: '60 seconds',
  },
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the transaction rate limit. Please try again later.',
      retryAfter: 60,
    });
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});
