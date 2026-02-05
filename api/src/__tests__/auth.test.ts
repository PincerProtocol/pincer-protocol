import request from 'supertest';
import express, { Express } from 'express';
import { apiKeyAuth, reloadApiKeys } from '../middleware/auth';

describe('API Key Authentication Middleware', () => {
  let app: Express;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Test routes
    app.get('/public', (_req, res) => {
      res.json({ message: 'Public endpoint' });
    });
    
    app.get('/protected', apiKeyAuth, (_req, res) => {
      res.json({ message: 'Protected endpoint' });
    });
  });

  describe('Protected Routes', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body).toEqual({ error: 'API key required' });
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/protected')
        .set('X-API-Key', 'invalid_key')
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid API key' });
    });

    it('should allow requests with valid API key', async () => {
      // Set valid keys in environment
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = 'test_key_1,test_key_2';
      reloadApiKeys();

      const response = await request(app)
        .get('/protected')
        .set('X-API-Key', 'test_key_1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Protected endpoint' });

      // Restore original keys
      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });

    it('should handle multiple valid keys', async () => {
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = 'key1,key2,key3';
      reloadApiKeys();

      // Test with each key
      for (const key of ['key1', 'key2', 'key3']) {
        const response = await request(app)
          .get('/protected')
          .set('X-API-Key', key)
          .expect(200);

        expect(response.body).toEqual({ message: 'Protected endpoint' });
      }

      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });

    it('should trim whitespace from keys', async () => {
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = ' key1 , key2 , key3 ';
      reloadApiKeys();

      const response = await request(app)
        .get('/protected')
        .set('X-API-Key', 'key1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Protected endpoint' });

      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });

    it('should ignore empty keys in configuration', async () => {
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = 'key1,,key2,,,key3';
      reloadApiKeys();

      // Empty string in header should be treated as missing key
      const response = await request(app)
        .get('/protected')
        .set('X-API-Key', '')
        .expect(401);

      expect(response.body).toEqual({ error: 'API key required' });

      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without API key', async () => {
      const response = await request(app)
        .get('/public')
        .expect(200);

      expect(response.body).toEqual({ message: 'Public endpoint' });
    });
  });

  describe('Header Validation', () => {
    it('should check X-API-Key header (lowercase)', async () => {
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = 'test_key';
      reloadApiKeys();

      const response = await request(app)
        .get('/protected')
        .set('x-api-key', 'test_key')
        .expect(200);

      expect(response.body).toEqual({ message: 'Protected endpoint' });

      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });

    it('should check X-API-Key header (mixed case)', async () => {
      const originalKeys = process.env.API_KEYS;
      process.env.API_KEYS = 'test_key';
      reloadApiKeys();

      const response = await request(app)
        .get('/protected')
        .set('X-Api-Key', 'test_key')
        .expect(200);

      expect(response.body).toEqual({ message: 'Protected endpoint' });

      process.env.API_KEYS = originalKeys;
      reloadApiKeys();
    });
  });
});
