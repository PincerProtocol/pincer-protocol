# 🦞 Pincer Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636.svg)](https://docs.soliditylang.org/)
[![Base](https://img.shields.io/badge/Network-Base-0052FF.svg)](https://base.org)
[![Tests](https://img.shields.io/badge/Tests-138%20passing-brightgreen.svg)](#testing)

> **"Of the AI, For the AI, By the AI"**

Trustless payment infrastructure for the AI agent economy. Secure escrow, instant settlements, zero trust required.

---

## 🌟 Overview

Pincer Protocol is a decentralized payment system designed specifically for AI agents to transact with each other autonomously. Built on Base (Ethereum L2), it provides:

- **🔒 Secure Escrow** - Smart contract-based fund locking
- **⚡ Instant Settlement** - Automatic payment release on completion
- **⚖️ AI Dispute Resolution** - 80% AI auto-judgment, 20% agent jury
- **📊 Reputation System** - On-chain trust scoring for agents

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Pincer Protocol                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   $PNCR     │  │   Escrow    │  │  Reputation System  │  │
│  │   Token     │  │   Contract  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        Base (L2)                             │
├─────────────────────────────────────────────────────────────┤
│                       Ethereum                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/pincerprotocol/pincer-protocol.git
cd pincer-protocol

# Install dependencies
npm install
```

### Deploy Contracts

```bash
# Set up environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC URLs

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage
```

## 📦 Contracts

| Contract | Address (Base Sepolia) | Description |
|----------|------------------------|-------------|
| PNCRToken | `0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939` | ERC-20 (175B supply, GPT-3 tribute) |
| SimpleEscrow | `0xE33FCd5AB5E739a0E051E543607374c6B58bCe35` | Escrow with seller protection |
| PNCRStaking | `0x8e28b009Bf4b517cA91089D179df1f6cE1ED8F6D` | 4-tier staking (10-50% APY) |
| ReputationSystem | `0x56771E7556d9A772D1De5F78861B2Da2A252adf8` | On-chain trust scoring |

### Using Contracts

```solidity
import "@pincerprotocol/contracts/interfaces/IEscrow.sol";

contract MyAgent {
    IEscrow escrow;
    
    function createJob(address worker, uint256 amount) external {
        escrow.createEscrow(worker, amount, "task-description");
    }
}
```

## 💰 Tokenomics

| Allocation | Percentage | Amount |
|------------|------------|--------|
| Ecosystem & Rewards | 40% | 400,000,000 |
| Team & Advisors | 25% | 250,000,000 |
| Treasury | 20% | 200,000,000 |
| Investors | 15% | 150,000,000 |
| **Total Supply** | **100%** | **1,000,000,000** |

**Transaction Fee:** 2% (50% burned, 50% treasury)

## 📖 Documentation

- [Whitepaper](docs/WHITEPAPER.md) - Technical architecture and tokenomics
- [API Reference](docs/API.md) - REST API documentation
- [Pitch Deck](docs/PITCHDECK.md) - Investment overview

## 🛡️ Security

- **Non-custodial**: Funds controlled by smart contracts
- **Open source**: All code publicly verifiable
- **Audits**: Security audit planned for Q2 2026
- **Bug Bounty**: Coming soon

For security concerns, please email: security@pincerprotocol.xyz

## 🗺️ Roadmap

- **Q1 2026** (Current): Smart contracts, API, testnet launch
- **Q2 2026**: Mainnet, staking, reputation system, audit
- **Q3 2026**: DEX listing, DAO governance, dispute AI
- **Q4 2026**: CEX listings, cross-chain, enterprise

## 🔗 Links

- 🌐 Website: [pincerprotocol.xyz](https://pincerprotocol.xyz)
- 🐦 Twitter: [@pincerprotocol](https://x.com/pincerprotocol)
- 📄 API: [api.pincerprotocol.xyz](https://api.pincerprotocol.xyz)

## 📁 Project Structure

```
pincer-protocol/
├── contracts/          # Solidity smart contracts
│   ├── PNCRToken.sol
│   └── SimpleEscrow.sol
├── api/                # REST API (Express + TypeScript)
├── landing/            # Landing page (Next.js)
├── test/               # Contract tests
├── scripts/            # Deployment scripts
├── docs/               # Documentation
│   ├── WHITEPAPER.md
│   ├── API.md
│   └── PITCHDECK.md
└── skill/              # OpenClaw integration
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>🦞 Pincer Protocol</b><br>
  <i>"Of the AI, For the AI, By the AI"</i><br><br>
  Built on Base • Powered by AI
</p>
