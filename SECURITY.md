# 🛡️ Security Policy

> **"디테일이 완벽을 만든다"** — Detail makes Perfect

Security is not an afterthought at Pincer Protocol. It's foundational.

## 📧 Reporting Vulnerabilities

**Found something?** Report immediately:

- **Email:** security@pincerprotocol.xyz
- **Response Time:** Within 24 hours
- **Disclosure Policy:** Responsible disclosure preferred

All reports will be:
1. Acknowledged within 24 hours
2. Investigated within 72 hours
3. Patched (if valid) ASAP
4. Credited (with permission)

## ✅ Security Measures

### Smart Contract Security

| Protection | Implementation | Status |
|------------|----------------|--------|
| Reentrancy | OpenZeppelin ReentrancyGuard | ✅ Active |
| Overflow/Underflow | Solidity 0.8.20+ built-in | ✅ Active |
| Access Control | Ownable + Custom modifiers | ✅ Active |
| Emergency Pause | Pausable on all contracts | ✅ Active |
| Safe Transfers | OpenZeppelin SafeERC20 | ✅ Active |
| Input Validation | require() checks | ✅ Active |

### Contract-Specific Protections

#### PNCRToken.sol
- ✅ Fixed supply (no mint function)
- ✅ Burnable (deflationary)
- ✅ Standard ERC20 implementation
- ✅ Immutable wallet addresses

#### SimpleEscrow.sol
- ✅ ReentrancyGuard on all fund movements
- ✅ Pausable for emergencies
- ✅ Buyer ≠ Seller validation
- ✅ Minimum amount check (anti-spam)
- ✅ Seller protection (24h auto-complete)
- ✅ Status state machine (no invalid transitions)

#### PNCRStaking.sol
- ✅ ReentrancyGuard on stake/unstake
- ✅ Minimum stake per tier
- ✅ Lock period enforcement
- ✅ Safe reward calculations

#### ReputationSystem.sol
- ✅ AccessControl (role-based)
- ✅ Score bounds (0-1000)
- ✅ Authorized adjusters only

## 🧪 Test Coverage

**138+ tests passing** across all contracts.

```
Test Results:
├── PNCRToken.test.js       21 tests ✅
├── SimpleEscrow.test.js    75 tests ✅
├── PNCRStaking.test.js     21 tests ✅
└── ReputationSystem.test.js 21 tests ✅
```

### Test Categories

| Category | Coverage |
|----------|----------|
| Unit Tests | All public functions |
| Integration | Multi-contract flows |
| Edge Cases | Boundary conditions |
| Attack Vectors | Reentrancy, overflow, auth bypass |
| Gas Optimization | Within reasonable limits |

## 🔒 Access Control

### Owner Capabilities
- Pause/unpause contracts
- Update fee rates (max 5%)
- Update fee recipient
- Update minimum amounts

### Owner Limitations
- ❌ Cannot mint new tokens
- ❌ Cannot access escrowed funds
- ❌ Cannot modify user balances directly
- ❌ Cannot bypass escrow state machine

## 🚨 Emergency Procedures

### If Critical Bug Found:
1. **Pause** affected contracts immediately
2. **Assess** impact and scope
3. **Communicate** to users via official channels
4. **Patch** and test fix
5. **Upgrade** if proxy (or deploy new if immutable)
6. **Unpause** after verification

### Emergency Contact Priority:
1. security@pincerprotocol.xyz
2. @pincerprotocol on Twitter
3. Team Telegram (private)

## 📋 Security Checklist

### Before Mainnet (COMPLETED ✅)
- [x] All functions have appropriate access control
- [x] ReentrancyGuard on external calls
- [x] SafeERC20 for token transfers
- [x] Input validation on all parameters
- [x] Events emitted for all state changes
- [x] No floating pragma
- [x] Explicit visibility on all functions
- [x] Check-Effects-Interactions pattern
- [x] No tx.origin usage
- [x] Tested on testnet first

### Ongoing Security
- [ ] External audit (Q2 2026)
- [ ] Bug bounty program (Q2 2026)
- [ ] Continuous monitoring
- [ ] Incident response plan

## 🐛 Bug Bounty (Coming Q2 2026)

**Planned Rewards:**
- Critical: Up to $10,000
- High: Up to $5,000
- Medium: Up to $1,000
- Low: Up to $200

*Scope and rules will be announced on official channels.*

## 📜 Audit Status

| Audit | Status | Date |
|-------|--------|------|
| Internal Review | ✅ Complete | Feb 2026 |
| External Audit | ⏳ Scheduled | Q2 2026 |

### Internal Review Findings
- 0 Critical issues
- 0 High issues
- 2 Medium issues (addressed)
- 4 Low issues (addressed/accepted)

## 🔗 Verified Contracts (Base Mainnet)

All contracts verified on Basescan:

| Contract | Address | Verified |
|----------|---------|----------|
| PNCRToken | `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c` | ✅ |
| SimpleEscrow | `0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7` | ✅ |
| PNCRStaking | `0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79` | ✅ |
| ReputationSystem | `0xeF825139C3B17265E867864627f85720Ab6dB9e0` | ✅ |

## 📖 Security Resources

- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [SWC Registry](https://swcregistry.io/)
- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

<p align="center">
  <b>🦞 Pincer Protocol</b><br>
  Security is the foundation of trust.<br><br>
  <i>security@pincerprotocol.xyz</i>
</p>
