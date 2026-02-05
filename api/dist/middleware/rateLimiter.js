"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strictLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("../utils/logger"));
// API 전체에 대한 기본 rate limiter (분당 60회)
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1분
    max: 60, // 분당 최대 60회 요청
    standardHeaders: true, // RateLimit-* 헤더 반환
    legacyHeaders: false, // X-RateLimit-* 헤더 비활성화
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '60 seconds',
    },
    handler: (req, res) => {
        logger_1.default.warn(`Rate limit exceeded for IP: ${req.ip}`);
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
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many transaction requests, please slow down.',
        retryAfter: '60 seconds',
    },
    handler: (req, res) => {
        logger_1.default.warn(`Strict rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the transaction rate limit. Please try again later.',
            retryAfter: 60,
        });
    },
    skip: (req) => process.env.NODE_ENV === 'test',
});
//# sourceMappingURL=rateLimiter.js.map