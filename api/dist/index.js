"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const auth_1 = require("./middleware/auth");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
const routes_1 = __importDefault(require("./routes"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const agents_1 = __importDefault(require("./routes/agents"));
const rewards_1 = __importDefault(require("./routes/rewards"));
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});
// Public routes (no authentication)
app.use('/', routes_1.default);
// Protected routes (API key authentication + rate limiting)
app.use('/wallet', rateLimiter_1.apiLimiter, auth_1.apiKeyAuth, wallet_1.default);
app.use('/tasks', rateLimiter_1.apiLimiter, auth_1.apiKeyAuth, tasks_1.default);
app.use('/agents', rateLimiter_1.apiLimiter, auth_1.apiKeyAuth, agents_1.default);
app.use('/rewards', rateLimiter_1.apiLimiter, auth_1.apiKeyAuth, rewards_1.default);
// 404 handler
app.use((req, res) => {
    logger_1.default.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err, req, res, _next) => {
    logger_1.default.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({ error: 'Internal Server Error' });
});
// Start server (skip in test environment)
let server = null;
exports.server = server;
if (process.env.NODE_ENV !== 'test') {
    exports.server = server = app.listen(config_1.config.port, () => {
        logger_1.default.info(`🦞 Pincer API running on port ${config_1.config.port}`);
        logger_1.default.info(`   Token: ${config_1.config.pncrTokenAddress}`);
        logger_1.default.info(`   Escrow: ${config_1.config.escrowAddress}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map