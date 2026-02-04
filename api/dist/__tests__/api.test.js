"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
// Mock the blockchain service
jest.mock('../services/blockchain', () => ({
    blockchainService: {
        getContractInfo: jest.fn().mockResolvedValue({
            feeRate: 200,
            escrowDuration: 172800,
            transactionCount: 5,
        }),
        getTokenInfo: jest.fn().mockResolvedValue({
            symbol: 'PNCR',
            decimals: 18,
        }),
        getBalance: jest.fn().mockResolvedValue({
            balance: '1000000000000000000000',
            formatted: '1000.0',
        }),
        getEscrow: jest.fn().mockImplementation((id) => {
            if (id === 1) {
                return Promise.resolve({
                    id: 1,
                    buyer: '0x1234567890123456789012345678901234567890',
                    seller: '0x0987654321098765432109876543210987654321',
                    amount: '50.0',
                    fee: '1.0',
                    status: 'PENDING',
                    createdAt: new Date('2026-02-04T00:00:00Z'),
                    expiresAt: new Date('2026-02-06T00:00:00Z'),
                });
            }
            return Promise.resolve(null);
        }),
        createEscrow: jest.fn().mockResolvedValue({
            success: true,
            txHash: '0xabcdef1234567890',
            escrowId: 6,
        }),
        confirmEscrow: jest.fn().mockResolvedValue({
            success: true,
            txHash: '0xconfirm1234567890',
        }),
        cancelEscrow: jest.fn().mockResolvedValue({
            success: true,
            txHash: '0xcancel1234567890',
        }),
        getAgentHistory: jest.fn().mockResolvedValue([
            {
                id: 1,
                buyer: '0x1234567890123456789012345678901234567890',
                seller: '0x0987654321098765432109876543210987654321',
                amount: '50.0',
                fee: '1.0',
                status: 'COMPLETED',
                createdAt: new Date('2026-02-03T00:00:00Z'),
                expiresAt: new Date('2026-02-05T00:00:00Z'),
            },
        ]),
    },
}));
afterAll(() => {
    if (index_1.server)
        index_1.server.close();
});
describe('Pincer API', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.contracts.token.symbol).toBe('PNCR');
            expect(res.body.contracts.escrow.feeRate).toBe(200);
        });
    });
    describe('GET /balance/:address', () => {
        it('should return balance for valid address', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/balance/0x1234567890123456789012345678901234567890');
            expect(res.status).toBe(200);
            expect(res.body.balance).toBe('1000.0');
        });
        it('should return 400 for invalid address', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/balance/invalid');
            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid address');
        });
    });
    describe('POST /escrow', () => {
        it('should create escrow with valid data', async () => {
            const res = await (0, supertest_1.default)(index_1.app)
                .post('/escrow')
                .send({
                receiver: '0x0987654321098765432109876543210987654321',
                amount: '50',
                memo: 'Test payment',
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.escrowId).toBe(6);
        });
        it('should return 400 for missing fields', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/escrow').send({});
            expect(res.status).toBe(400);
        });
        it('should return 400 for invalid receiver', async () => {
            const res = await (0, supertest_1.default)(index_1.app)
                .post('/escrow')
                .send({ receiver: 'invalid', amount: '50' });
            expect(res.status).toBe(400);
        });
    });
    describe('GET /escrow/:txId', () => {
        it('should return escrow details', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/escrow/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.status).toBe('PENDING');
        });
        it('should return 404 for non-existent escrow', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/escrow/999');
            expect(res.status).toBe(404);
        });
        it('should return 400 for invalid ID', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/escrow/abc');
            expect(res.status).toBe(400);
        });
    });
    describe('POST /escrow/:txId/confirm', () => {
        it('should confirm escrow', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/escrow/1/confirm');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
    describe('POST /escrow/:txId/cancel', () => {
        it('should cancel escrow', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/escrow/1/cancel');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
    describe('GET /agents/:address/history', () => {
        it('should return agent history', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/agents/0x1234567890123456789012345678901234567890/history');
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1);
            expect(res.body.transactions).toHaveLength(1);
        });
        it('should return 400 for invalid address', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/agents/invalid/history');
            expect(res.status).toBe(400);
        });
    });
    describe('404 handler', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/unknown');
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=api.test.js.map