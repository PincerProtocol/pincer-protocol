import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { apiKeyAuth } from './middleware/auth';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import routes from './routes';
import walletRoutes from './routes/wallet';
import tasksRoutes from './routes/tasks';
import agentsRoutes from './routes/agents';
import rewardsRoutes from './routes/rewards';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Public routes (no authentication)
app.use('/', routes);

// Protected routes (API key authentication + rate limiting)
app.use('/wallet', apiLimiter, apiKeyAuth, walletRoutes);
app.use('/tasks', apiLimiter, apiKeyAuth, tasksRoutes);
app.use('/agents', apiLimiter, apiKeyAuth, agentsRoutes);
app.use('/rewards', apiLimiter, apiKeyAuth, rewardsRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server (skip in test environment)
let server: ReturnType<typeof app.listen> | null = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(config.port, () => {
    logger.info(`🦞 Pincer API running on port ${config.port}`);
    logger.info(`   Token: ${config.pncrTokenAddress}`);
    logger.info(`   Escrow: ${config.escrowAddress}`);
  });
}

export { app, server };
export default app;
