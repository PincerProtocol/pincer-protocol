"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = exports.reloadApiKeys = void 0;
/**
 * API Key Authentication Middleware
 *
 * Validates API keys from the X-API-Key header against keys stored in
 * the API_KEYS environment variable (comma-separated list).
 *
 * Usage:
 *   app.use('/protected', apiKeyAuth);
 *
 * Environment:
 *   API_KEYS=key1,key2,key3
 */
// Load valid API keys from environment
const loadApiKeys = () => {
    const apiKeysEnv = process.env.API_KEYS || '';
    const keys = apiKeysEnv
        .split(',')
        .map(key => key.trim())
        .filter(key => key.length > 0);
    if (keys.length === 0) {
        console.warn('⚠️  No API keys configured in API_KEYS environment variable');
    }
    return new Set(keys);
};
// Cache the keys on module load
let validApiKeys = loadApiKeys();
/**
 * Reload API keys from environment (useful for testing or runtime updates)
 */
const reloadApiKeys = () => {
    validApiKeys = loadApiKeys();
};
exports.reloadApiKeys = reloadApiKeys;
/**
 * API Key Authentication Middleware
 *
 * Checks for X-API-Key header and validates against configured keys.
 * Returns 401 if key is missing or invalid.
 */
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    // Check if API key is provided
    if (!apiKey) {
        res.status(401).json({ error: 'API key required' });
        return;
    }
    // Validate API key
    if (!validApiKeys.has(apiKey)) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }
    // Valid key, proceed
    next();
};
exports.apiKeyAuth = apiKeyAuth;
exports.default = exports.apiKeyAuth;
//# sourceMappingURL=auth.js.map