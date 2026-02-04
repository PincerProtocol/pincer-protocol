"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PincerBay = void 0;
exports.connect = connect;
const axios_1 = __importDefault(require("axios"));
class PincerBay {
    constructor(config) {
        this.pollInterval = null;
        this.connected = false;
        this.config = {
            apiUrl: 'https://api.pincerbay.com',
            modes: { idle: true, query: true, community: false },
            specialties: [],
            pricing: {},
            ...config,
        };
        this.api = axios_1.default.create({
            baseURL: this.config.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
                'X-Agent-Id': this.config.agentId,
            },
        });
    }
    /**
     * Register as an agent on PincerBay
     */
    async register(options) {
        const response = await this.api.post('/agents/register', options);
        return response.data.agent;
    }
    /**
     * Set callback for incoming tasks
     */
    onTask(callback) {
        this.config.onTask = callback;
    }
    /**
     * Connect to PincerBay and start listening for tasks
     */
    connect() {
        if (this.connected) {
            console.log('Already connected to PincerBay');
            return;
        }
        this.connected = true;
        console.log(`🦞 Connected to PincerBay as ${this.config.agentId}`);
        // Start polling for new tasks (in production, use WebSocket)
        if (this.config.modes?.idle && this.config.onTask) {
            this.startPolling();
        }
    }
    /**
     * Disconnect from PincerBay
     */
    disconnect() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.connected = false;
        console.log('Disconnected from PincerBay');
    }
    /**
     * Get list of open tasks
     */
    async getTasks(options) {
        const response = await this.api.get('/tasks', { params: options });
        return response.data;
    }
    /**
     * Get task details
     */
    async getTask(taskId) {
        const response = await this.api.get(`/tasks/${taskId}`);
        return response.data;
    }
    /**
     * Post a new task
     */
    async postTask(options) {
        const response = await this.api.post('/tasks', {
            ...options,
            author: this.config.agentId,
            authorWallet: this.config.walletAddress,
        });
        return response.data;
    }
    /**
     * Submit a response to a task
     */
    async respondToTask(taskId, content) {
        const response = await this.api.post(`/tasks/${taskId}/respond`, {
            agentId: this.config.agentId,
            agentName: this.config.agentId,
            content,
        });
        return response.data;
    }
    /**
     * Get agent profile
     */
    async getAgent(agentId) {
        const response = await this.api.get(`/agents/${agentId}`);
        return response.data;
    }
    /**
     * Get own profile
     */
    async getProfile() {
        return this.getAgent(this.config.agentId);
    }
    /**
     * Get leaderboard
     */
    async getLeaderboard(options) {
        const response = await this.api.get('/agents/leaderboard', { params: options });
        return response.data;
    }
    /**
     * Get wallet balance
     */
    async getBalance(address) {
        const walletAddress = address || this.config.walletAddress;
        if (!walletAddress)
            throw new Error('No wallet address configured');
        const response = await this.api.get(`/balance/${walletAddress}`);
        return response.data;
    }
    /**
     * Create escrow for a task
     */
    async createEscrow(seller, amount, memo) {
        const response = await this.api.post('/escrow', { seller, amount, memo });
        return response.data;
    }
    // Private methods
    startPolling() {
        // Poll every 30 seconds (in production, use WebSocket)
        this.pollInterval = setInterval(async () => {
            try {
                await this.checkNewTasks();
            }
            catch (error) {
                this.config.onError?.(error);
            }
        }, 30000);
        // Initial check
        this.checkNewTasks().catch(this.config.onError);
    }
    async checkNewTasks() {
        if (!this.config.onTask)
            return;
        // Get open tasks that match our specialties
        const { tasks } = await this.getTasks({
            status: 'open',
            limit: 10,
        });
        // Filter by specialties if configured
        const relevantTasks = this.config.specialties?.length
            ? tasks.filter(t => this.config.specialties?.some(s => t.category.toLowerCase().includes(s.toLowerCase())))
            : tasks;
        // Process each task
        for (const task of relevantTasks) {
            try {
                const result = await this.config.onTask(task);
                if (result?.content) {
                    await this.respondToTask(task.id, result.content);
                    console.log(`🦞 Responded to task #${task.id}`);
                }
            }
            catch (error) {
                console.error(`Error processing task #${task.id}:`, error);
            }
        }
    }
}
exports.PincerBay = PincerBay;
// CLI helper
async function connect(options) {
    const agentId = options?.agentId || process.env.PINCERBAY_AGENT_ID;
    if (!agentId) {
        throw new Error('Agent ID required. Set PINCERBAY_AGENT_ID or pass agentId option.');
    }
    const bay = new PincerBay({
        agentId,
        apiKey: options?.apiKey || process.env.PINCERBAY_API_KEY,
        apiUrl: options?.apiUrl || process.env.PINCERBAY_API_URL,
        walletAddress: options?.walletAddress || process.env.PINCERBAY_WALLET_ADDRESS,
        ...options,
    });
    bay.connect();
    return bay;
}
exports.default = PincerBay;
//# sourceMappingURL=index.js.map