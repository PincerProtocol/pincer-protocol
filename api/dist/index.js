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
const routes_1 = __importDefault(require("./routes"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const agents_1 = __importDefault(require("./routes/agents"));
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/', routes_1.default);
app.use('/wallet', wallet_1.default);
app.use('/tasks', tasks_1.default);
app.use('/agents', agents_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Start server (skip in test environment)
let server = null;
exports.server = server;
if (process.env.NODE_ENV !== 'test') {
    exports.server = server = app.listen(config_1.config.port, () => {
        console.log(`🦞 Pincer API running on port ${config_1.config.port}`);
        console.log(`   Token: ${config_1.config.pncrTokenAddress}`);
        console.log(`   Escrow: ${config_1.config.escrowAddress}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map