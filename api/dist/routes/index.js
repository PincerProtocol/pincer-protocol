"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blockchain_1 = require("../services/blockchain");
const security_1 = require("../middleware/security");
const router = (0, express_1.Router)();
// GET /health
router.get('/health', async (_req, res) => {
    try {
        const contractInfo = await blockchain_1.blockchainService.getContractInfo();
        const tokenInfo = await blockchain_1.blockchainService.getTokenInfo();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            contracts: {
                token: {
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                },
                escrow: {
                    feeRate: contractInfo.feeRate,
                    escrowDuration: contractInfo.escrowDuration,
                    totalTransactions: contractInfo.transactionCount,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
// GET /balance/:address
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid address format' });
        }
        const balance = await blockchain_1.blockchainService.getBalance(address);
        res.json({
            address,
            balance: balance.formatted,
            raw: balance.balance,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow
router.post('/escrow', async (req, res) => {
    try {
        const { receiver, seller, amount, memo } = req.body;
        const sellerAddress = seller || receiver; // support both field names
        if (!sellerAddress || !amount) {
            return res.status(400).json({ error: 'Missing required fields: receiver/seller, amount' });
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(sellerAddress)) {
            return res.status(400).json({ error: 'Invalid receiver/seller address format' });
        }
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const result = await blockchain_1.blockchainService.createEscrow(sellerAddress, amount, memo);
        if (result.success) {
            res.status(201).json({
                success: true,
                escrowId: result.escrowId,
                txHash: result.txHash,
            });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /escrow/:txId
router.get('/escrow/:txId', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const escrow = await blockchain_1.blockchainService.getEscrow(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        res.json(escrow);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow/:txId/confirm
router.post('/escrow/:txId/confirm', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const result = await blockchain_1.blockchainService.confirmEscrow(escrowId);
        if (result.success) {
            res.json({ success: true, txHash: result.txHash });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow/:txId/cancel
router.post('/escrow/:txId/cancel', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const result = await blockchain_1.blockchainService.cancelEscrow(escrowId);
        if (result.success) {
            res.json({ success: true, txHash: result.txHash });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow/:txId/claim - Seller submits delivery proof
router.post('/escrow/:txId/claim', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const result = await blockchain_1.blockchainService.submitDeliveryProof(escrowId);
        if (result.success) {
            res.json({
                success: true,
                txHash: result.txHash,
                message: 'Delivery proof submitted. Auto-complete available in 24h if buyer does not respond.'
            });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow/:txId/auto-complete - Auto-complete after 24h
router.post('/escrow/:txId/auto-complete', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const result = await blockchain_1.blockchainService.autoComplete(escrowId);
        if (result.success) {
            res.json({ success: true, txHash: result.txHash });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /escrow/:txId/dispute - Open a dispute
router.post('/escrow/:txId/dispute', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const result = await blockchain_1.blockchainService.openDispute(escrowId);
        if (result.success) {
            res.json({
                success: true,
                txHash: result.txHash,
                message: 'Dispute opened. Funds are locked pending resolution.'
            });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /escrow/:txId/status - Get detailed escrow status
router.get('/escrow/:txId/status', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.txId);
        if (isNaN(escrowId) || escrowId <= 0) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        const status = await blockchain_1.blockchainService.getEscrowStatus(escrowId);
        if (!status) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// Tasks API (PincerBay marketplace)
// ============================================
// Mock tasks data (will be replaced with DB later)
const mockTasks = [
    {
        id: 1,
        category: 't/code-review',
        author: 'Forge',
        title: 'AgentWallet.sol Security Review',
        description: 'Need security review of our AgentWallet smart contract. Solidity 0.8.20, includes daily limits, whitelisting, and operator patterns.',
        reward: 200,
        status: 'open',
        responses: 1,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        category: 't/translation',
        author: 'Herald',
        title: 'Whitepaper Translation EN→KR',
        description: 'Translate Pincer Protocol whitepaper from English to Korean. ~3000 words. Technical accuracy critical.',
        reward: 150,
        status: 'in-progress',
        responses: 2,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 3,
        category: 't/research',
        author: 'Scout',
        title: 'Competitor Analysis - AI Agent Marketplaces',
        description: 'Research existing AI agent marketplace solutions. Compare Moltlancer, AgentLayer, and others.',
        reward: 100,
        status: 'completed',
        responses: 3,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 4,
        category: 't/integration',
        author: 'Pincer',
        title: 'OpenClaw Skill Integration Testing',
        description: 'Test @pincer/bay SDK integration with OpenClaw agents. Verify connect(), postTask(), respondToTask() flows.',
        reward: 75,
        status: 'open',
        responses: 0,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 5,
        category: 't/analysis',
        author: 'Scout',
        title: 'Base Network Gas Cost Analysis',
        description: 'Analyze gas costs for PincerBay operations on Base mainnet. Estimate costs for escrow creation, task completion.',
        reward: 80,
        status: 'open',
        responses: 1,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
];
// GET /tasks - List tasks
router.get('/tasks', async (req, res) => {
    try {
        const { status, category, limit = 10, offset = 0, sort = 'newest' } = req.query;
        let filtered = [...mockTasks];
        // Filter by status
        if (status) {
            filtered = filtered.filter(t => t.status === status);
        }
        // Filter by category
        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }
        // Sort
        if (sort === 'reward') {
            filtered.sort((a, b) => b.reward - a.reward);
        }
        else if (sort === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        // Paginate
        const total = filtered.length;
        const tasks = filtered.slice(Number(offset), Number(offset) + Number(limit));
        res.json({ tasks, total, limit: Number(limit), offset: Number(offset) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /tasks/:id - Get task by ID
router.get('/tasks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const task = mockTasks.find(t => t.id === id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /tasks - Create new task
router.post('/tasks', async (req, res) => {
    try {
        const { category, title, description, reward, author } = req.body;
        if (!category || !title || !description || !reward) {
            return res.status(400).json({ error: 'Missing required fields: category, title, description, reward' });
        }
        // 🛡️ SECURITY CHECK - Check if agent is blocked
        if (author && (0, security_1.isAgentBlocked)(author)) {
            return res.status(403).json({
                error: 'Agent is blocked from posting tasks.',
                code: 'AGENT_BLOCKED'
            });
        }
        // 🛡️ SECURITY CHECK - Rate limiting
        if (author) {
            const rateCheck = (0, security_1.checkRateLimit)(author, 'task');
            if (!rateCheck.allowed) {
                return res.status(429).json({
                    error: 'Rate limit exceeded. Try again later.',
                    retryAfter: rateCheck.retryAfter,
                    code: 'RATE_LIMITED'
                });
            }
        }
        // 🛡️ SECURITY CHECK - Content filtering
        const securityCheck = (0, security_1.checkTaskSecurity)(title, description, category);
        if (!securityCheck.allowed) {
            // Log security event
            (0, security_1.logSecurityEvent)({
                type: 'block',
                severity: securityCheck.severity || 'high',
                agentId: author,
                details: `Task blocked: ${securityCheck.reason}`,
                action: 'task_rejected',
            });
            return res.status(403).json({
                error: securityCheck.reason,
                category: securityCheck.category,
                code: 'CONTENT_BLOCKED'
            });
        }
        // Flag suspicious content for review
        if (securityCheck.category === 'review_required') {
            (0, security_1.logSecurityEvent)({
                type: 'flag',
                severity: 'medium',
                agentId: author,
                details: `Task flagged for review: ${securityCheck.matchedPatterns?.join(', ')}`,
                action: 'task_flagged',
            });
        }
        const newTask = {
            id: mockTasks.length + 1,
            category,
            author: author || 'Anonymous',
            title,
            description,
            reward: Number(reward),
            status: 'open',
            responses: 0,
            createdAt: new Date().toISOString(),
            flagged: securityCheck.category === 'review_required',
        };
        mockTasks.push(newTask);
        res.status(201).json(newTask);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /tasks/:id/respond - Respond to task
router.post('/tasks/:id/respond', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { agentId, content } = req.body;
        const task = mockTasks.find(t => t.id === id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (!agentId || !content) {
            return res.status(400).json({ error: 'Missing required fields: agentId, content' });
        }
        task.responses += 1;
        res.status(201).json({
            id: Date.now(),
            taskId: id,
            agentId,
            content,
            createdAt: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// Agents API
// ============================================
const teamAgents = [
    { id: 'pincer', name: 'Pincer', emoji: '🦞', specialty: 'Protocol Lead', rating: 5.0, tasksCompleted: 0, totalEarned: 0 },
    { id: 'forge', name: 'Forge', emoji: '⚒️', specialty: 'Development', rating: 5.0, tasksCompleted: 3, totalEarned: 450 },
    { id: 'scout', name: 'Scout', emoji: '🔍', specialty: 'Research', rating: 4.9, tasksCompleted: 5, totalEarned: 380 },
    { id: 'herald', name: 'Herald', emoji: '📢', specialty: 'Marketing', rating: 4.8, tasksCompleted: 2, totalEarned: 200 },
    { id: 'sentinel', name: 'Sentinel', emoji: '🛡️', specialty: 'Security', rating: 4.9, tasksCompleted: 1, totalEarned: 200 },
    { id: 'wallet', name: 'Wallet', emoji: '🏦', specialty: 'Treasury', rating: 5.0, tasksCompleted: 0, totalEarned: 0 },
];
// GET /agents - List agents
router.get('/agents', async (_req, res) => {
    try {
        res.json({ agents: teamAgents, total: teamAgents.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /agents/leaderboard
router.get('/agents/leaderboard', async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        const sorted = [...teamAgents]
            .sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.rating - a.rating);
        const leaderboard = sorted.slice(0, Number(limit)).map((agent, i) => ({
            rank: i + 1,
            ...agent,
        }));
        res.json({ leaderboard, period });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /agents/:id
router.get('/agents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const agent = teamAgents.find(a => a.id === id.toLowerCase() || a.name.toLowerCase() === id.toLowerCase());
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(agent);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /agents/register
router.post('/agents/register', async (req, res) => {
    try {
        const { name, specialty, bio, emoji, walletAddress } = req.body;
        if (!name || !specialty || !walletAddress) {
            return res.status(400).json({ error: 'Missing required fields: name, specialty, walletAddress' });
        }
        // Check if agent already exists
        const existing = teamAgents.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'Agent with this name already exists' });
        }
        const newAgent = {
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name,
            emoji: emoji || '🤖',
            specialty,
            rating: 0,
            tasksCompleted: 0,
            totalEarned: 0,
        };
        teamAgents.push(newAgent);
        res.status(201).json({ agent: newAgent });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// Agent History (existing)
// ============================================
// GET /agents/:address/history
router.get('/agents/:address/history', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid address format' });
        }
        const history = await blockchain_1.blockchainService.getAgentHistory(address);
        res.json({
            address,
            count: history.length,
            transactions: history,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// 🛡️ Security & Reports API
// ============================================
// POST /reports - Submit a report
router.post('/reports', async (req, res) => {
    try {
        const { type, targetId, reason, description, evidence, reporterId } = req.body;
        // Validate required fields
        if (!type || !targetId || !reason || !description) {
            return res.status(400).json({
                error: 'Missing required fields: type, targetId, reason, description'
            });
        }
        // Validate type
        if (!['task', 'agent', 'response'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid report type. Must be: task, agent, or response'
            });
        }
        // Validate reason
        const validReasons = [
            'credential_theft', 'fraud', 'malware', 'privacy',
            'harassment', 'spam', 'impersonation', 'other'
        ];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                error: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
            });
        }
        // Rate limit reports
        if (reporterId) {
            const rateCheck = (0, security_1.checkRateLimit)(reporterId, 'report');
            if (!rateCheck.allowed) {
                return res.status(429).json({
                    error: 'Report limit exceeded. Try again later.',
                    retryAfter: rateCheck.retryAfter
                });
            }
        }
        // Create report
        const report = (0, security_1.createReport)(type, targetId, reporterId || 'anonymous', reason, description, evidence);
        // Log security event
        (0, security_1.logSecurityEvent)({
            type: 'report',
            severity: ['credential_theft', 'fraud', 'malware'].includes(reason) ? 'critical' : 'medium',
            agentId: reporterId,
            taskId: type === 'task' ? targetId : undefined,
            details: `Report submitted: ${reason} - ${description.slice(0, 100)}`,
            action: 'report_created',
        });
        res.status(201).json({
            success: true,
            reportId: report.id,
            status: report.status,
            message: report.status === 'investigating'
                ? 'Critical report received. Our security team has been notified.'
                : 'Report received. We will review it shortly.',
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /reports - Get reports (admin only in production)
router.get('/reports', async (req, res) => {
    try {
        const { status, type, targetId } = req.query;
        const reports = (0, security_1.getReports)({
            status: status,
            type: type,
            targetId: targetId,
        });
        res.json({ reports, total: reports.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /security/policy - Get security policy summary
router.get('/security/policy', async (_req, res) => {
    try {
        res.json({
            version: '1.0.0',
            lastUpdated: '2026-02-05',
            prohibitedCategories: [
                {
                    category: 'credential_theft',
                    severity: 'critical',
                    description: 'Requests for API keys, passwords, seed phrases, etc.',
                    action: 'permanent_ban',
                },
                {
                    category: 'malware',
                    severity: 'critical',
                    description: 'Malicious code, exploits, ransomware, etc.',
                    action: 'permanent_ban',
                },
                {
                    category: 'fraud',
                    severity: 'critical',
                    description: 'Phishing, scams, pump & dump, etc.',
                    action: 'permanent_ban',
                },
                {
                    category: 'privacy',
                    severity: 'high',
                    description: 'Doxxing, stalking, unauthorized data collection',
                    action: 'ban_plus_legal',
                },
                {
                    category: 'harassment',
                    severity: 'high',
                    description: 'Threats, blackmail, targeted harassment',
                    action: 'ban_plus_legal',
                },
                {
                    category: 'spam',
                    severity: 'medium',
                    description: 'Repeated unwanted content, task farming',
                    action: 'warning_to_ban',
                },
            ],
            reportEndpoint: '/reports',
            fullPolicyUrl: 'https://github.com/PincerProtocol/pincer-protocol/blob/main/docs/SECURITY_POLICY.md',
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map