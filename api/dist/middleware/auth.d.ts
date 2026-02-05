import { Request, Response, NextFunction } from 'express';
/**
 * Reload API keys from environment (useful for testing or runtime updates)
 */
export declare const reloadApiKeys: () => void;
/**
 * API Key Authentication Middleware
 *
 * Checks for X-API-Key header and validates against configured keys.
 * Returns 401 if key is missing or invalid.
 */
export declare const apiKeyAuth: (req: Request, res: Response, next: NextFunction) => void;
export default apiKeyAuth;
//# sourceMappingURL=auth.d.ts.map