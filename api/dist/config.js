"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowStatus = exports.ESCROW_ABI = exports.PNCR_TOKEN_ABI = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
    pncrTokenAddress: process.env.PNCR_TOKEN_ADDRESS || '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c',
    escrowAddress: process.env.ESCROW_ADDRESS || '0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7',
    privateKey: process.env.PRIVATE_KEY || '',
};
// Contract ABIs (matching actual deployed contracts)
exports.PNCR_TOKEN_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
];
exports.ESCROW_ABI = [
    'function createEscrow(address seller, uint256 amount) returns (uint256)',
    'function confirmDelivery(uint256 txId)',
    'function cancelEscrow(uint256 txId)',
    'function getTransaction(uint256 txId) view returns (tuple(uint256 id, address buyer, address seller, uint256 amount, uint256 fee, uint8 status, uint256 createdAt, uint256 expiresAt))',
    'function transactionCount() view returns (uint256)',
    'function feeRate() view returns (uint256)',
    'function ESCROW_DURATION() view returns (uint256)',
    'event EscrowCreated(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount, uint256 fee, uint256 expiresAt)',
    'event EscrowCompleted(uint256 indexed txId, uint256 sellerAmount, uint256 feeAmount)',
    'event EscrowCancelled(uint256 indexed txId)',
];
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus[EscrowStatus["PENDING"] = 0] = "PENDING";
    EscrowStatus[EscrowStatus["COMPLETED"] = 1] = "COMPLETED";
    EscrowStatus[EscrowStatus["CANCELLED"] = 2] = "CANCELLED";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
//# sourceMappingURL=config.js.map