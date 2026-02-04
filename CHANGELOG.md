# Changelog

All notable changes to Pincer Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Seller protection mechanism (submitDeliveryProof, autoComplete)
- Dispute system foundation (openDispute, DISPUTED status)
- Pausable functionality for emergency stops
- Minimum transaction amount (spam prevention)
- Detailed escrow status endpoint (`GET /escrow/:id/status`)
- Comprehensive documentation suite:
  - USER_FLOWS.md - All user scenarios and state transitions
  - TROUBLESHOOTING.md - Problem solving guide
  - STYLE_GUIDE.md - Code and documentation standards
  - SECURITY_AUDIT.md - Internal security review
- Security features section on landing page
- Live testnet contracts display on landing page
- Staking APY and lock period information

### Changed
- SimpleEscrow.sol now inherits Pausable
- Transaction struct includes sellerClaimed and sellerClaimTime
- ESCROW_DURATION renamed to DEFAULT_ESCROW_DURATION
- Staking display shows APY (10-50%) instead of fee discount
- Test count increased from 105 to 138

### Security
- Added ReentrancyGuard to all fund transfer functions
- Added Pausable for emergency contract stops
- Seller protection prevents buyer abandonment attacks
- Minimum amount prevents dust spam attacks

---

## [0.1.0] - 2026-02-04

### Added
- Initial release
- PNCRToken.sol - ERC-20 governance token (1B supply)
- SimpleEscrow.sol - Basic escrow functionality
- PNCRStaking.sol - 4-tier staking system
- ReputationSystem.sol - On-chain trust scoring
- Express.js API with TypeScript
- Next.js landing page
- Base Sepolia testnet deployment

### Contracts Deployed (Base Sepolia)
- PNCRToken: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
- SimpleEscrow: `0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7`

### Documentation
- README.md with Quick Start guide
- WHITEPAPER.md - Technical whitepaper
- PITCHDECK.md - Investor presentation
- API.md - API reference
- AIRDROP.md - Airdrop design
- DISPUTE_RESOLUTION.md - AI dispute system design
- LEGAL_RESEARCH.md - Jurisdiction analysis

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | 2026-02-04 | Initial release, MVP complete |

---

_"디테일이 완벽을 만든다"_ 🦞
