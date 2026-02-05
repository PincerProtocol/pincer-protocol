"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
describe('API Key Authentication Middleware', () => {
    let app;
    beforeEach(() => {
        // Create a fresh Express app for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        // Test routes
        app.get('/public', (_req, res) => {
            res.json({ message: 'Public endpoint' });
        });
        app.get('/protected', auth_1.apiKeyAuth, (_req, res) => {
            res.json({ message: 'Protected endpoint' });
        });
    });
    describe('Protected Routes', () => {
        it('should reject requests without API key', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .expect(401);
            expect(response.body).toEqual({ error: 'API key required' });
        });
        it('should reject requests with invalid API key', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('X-API-Key', 'invalid_key')
                .expect(401);
            expect(response.body).toEqual({ error: 'Invalid API key' });
        });
        it('should allow requests with valid API key', async () => {
            // Set valid keys in environment
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = 'test_key_1,test_key_2';
            (0, auth_1.reloadApiKeys)();
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('X-API-Key', 'test_key_1')
                .expect(200);
            expect(response.body).toEqual({ message: 'Protected endpoint' });
            // Restore original keys
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
        it('should handle multiple valid keys', async () => {
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = 'key1,key2,key3';
            (0, auth_1.reloadApiKeys)();
            // Test with each key
            for (const key of ['key1', 'key2', 'key3']) {
                const response = await (0, supertest_1.default)(app)
                    .get('/protected')
                    .set('X-API-Key', key)
                    .expect(200);
                expect(response.body).toEqual({ message: 'Protected endpoint' });
            }
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
        it('should trim whitespace from keys', async () => {
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = ' key1 , key2 , key3 ';
            (0, auth_1.reloadApiKeys)();
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('X-API-Key', 'key1')
                .expect(200);
            expect(response.body).toEqual({ message: 'Protected endpoint' });
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
        it('should ignore empty keys in configuration', async () => {
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = 'key1,,key2,,,key3';
            (0, auth_1.reloadApiKeys)();
            // Empty string in header should be treated as missing key
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('X-API-Key', '')
                .expect(401);
            expect(response.body).toEqual({ error: 'API key required' });
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
    });
    describe('Public Routes', () => {
        it('should allow access to public routes without API key', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/public')
                .expect(200);
            expect(response.body).toEqual({ message: 'Public endpoint' });
        });
    });
    describe('Header Validation', () => {
        it('should check X-API-Key header (lowercase)', async () => {
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = 'test_key';
            (0, auth_1.reloadApiKeys)();
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('x-api-key', 'test_key')
                .expect(200);
            expect(response.body).toEqual({ message: 'Protected endpoint' });
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
        it('should check X-API-Key header (mixed case)', async () => {
            const originalKeys = process.env.API_KEYS;
            process.env.API_KEYS = 'test_key';
            (0, auth_1.reloadApiKeys)();
            const response = await (0, supertest_1.default)(app)
                .get('/protected')
                .set('X-Api-Key', 'test_key')
                .expect(200);
            expect(response.body).toEqual({ message: 'Protected endpoint' });
            process.env.API_KEYS = originalKeys;
            (0, auth_1.reloadApiKeys)();
        });
    });
});
//# sourceMappingURL=auth.test.js.map