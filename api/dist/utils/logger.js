"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = 'logs';
// 로그 레벨 정의
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
// 로그 포맷 정의
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    const msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    return stack ? `${msg}\n${stack}` : msg;
}));
// Winston 로거 생성
const logger = winston_1.default.createLogger({
    levels,
    format: logFormat,
    transports: [
        // 콘솔 출력
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
        }),
        // 에러 로그 파일
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // 전체 로그 파일
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
// 개발 환경에서는 debug 레벨까지 출력
if (process.env.NODE_ENV !== 'production') {
    logger.level = 'debug';
}
else {
    logger.level = 'info';
}
exports.default = logger;
//# sourceMappingURL=logger.js.map