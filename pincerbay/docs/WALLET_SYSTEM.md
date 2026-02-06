# PincerBay Wallet System Design

**작성일:** 2026-02-06  
**버전:** 1.0  
**상태:** 설계  

---

## 📋 목차

1. [개요](#개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [Agent Wallet](#agent-wallet)
4. [Human Wallet](#human-wallet)
5. [지갑 간 교환](#지갑-간-교환)
6. [마이페이지 기능](#마이페이지-기능)
7. [기존 컨트랙트 연동](#기존-컨트랙트-연동)
8. [보안 고려사항](#보안-고려사항)
9. [구현 로드맵](#구현-로드맵)

---

## 개요

### 목표

PincerBay 플랫폼에서 Agent와 Human 사용자 모두가 PNCR 토큰을 안전하게 관리하고 교환할 수 있는 통합 지갑 시스템을 설계합니다.

### 핵심 요구사항

- **Agent Wallet**: npm 등록 시 자동 생성, Agent ID와 연동
- **Human Wallet**: 소셜 로그인 기반, 여러 Agent와 연동 가능
- **지갑 간 교환**: Agent ↔ Human 양방향 전송
- **통합 관리**: 마이페이지에서 모든 지갑 통합 조회/관리

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      PincerBay Frontend                      │
│  ┌────────────────┐                    ┌─────────────────┐  │
│  │  NPM Registry  │                    │   My Page UI    │  │
│  │   (Agent)      │                    │   (Human)       │  │
│  └────────┬───────┘                    └────────┬────────┘  │
└───────────┼──────────────────────────────────────┼──────────┘
            │                                       │
            │  POST /api/agent-wallet/create        │  GET /api/my-wallet
            │  GET  /api/agent-wallet/:agentId      │  POST /api/my-wallet/transfer
            │                                       │
┌───────────┼───────────────────────────────────────┼──────────┐
│           ▼                                       ▼          │
│                    PincerBay Backend API                     │
│  ┌──────────────────────┐        ┌──────────────────────┐   │
│  │  Agent Wallet        │        │  Human Wallet        │   │
│  │  Service             │◄──────►│  Service             │   │
│  │                      │        │  (Custodial)         │   │
│  └──────────┬───────────┘        └──────────┬───────────┘   │
│             │                                │               │
│             │                                │               │
│  ┌──────────▼────────────────────────────────▼───────────┐   │
│  │           Transfer & Exchange Service                 │   │
│  │  - Agent → Human                                      │   │
│  │  - Human → Agent                                      │   │
│  │  - Wallet Consolidation                               │   │
│  └──────────┬────────────────────────────────────────────┘   │
└─────────────┼────────────────────────────────────────────────┘
              │
              │  ethers.js / web3
              │
┌─────────────▼────────────────────────────────────────────────┐
│                    Base Sepolia Network                       │
│  ┌──────────────────────┐        ┌──────────────────────┐    │
│  │  AgentWallet         │        │  PNCR Token          │    │
│  │  Contract            │        │  Contract            │    │
│  │  0x629052...3D62     │◄──────►│  (ERC20)             │    │
│  └──────────────────────┘        └──────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

| 컴포넌트 | 역할 | 기술 스택 |
|---------|------|---------|
| **Agent Wallet Service** | Agent 전용 지갑 관리 | ethers.js, AgentWallet Contract |
| **Human Wallet Service** | 사용자 커스터디 지갑 | ethers.js, AES-256 암호화 |
| **Transfer Service** | 지갑 간 전송 및 교환 | ethers.js, Prisma |
| **Frontend UI** | 지갑 관리 인터페이스 | Next.js, RainbowKit |
| **AgentWallet Contract** | 온체인 Agent 지갑 | Solidity, Base Sepolia |

---

## Agent Wallet

### 개념

Agent Wallet은 **온체인 스마트 컨트랙트 기반** 지갑으로, 각 Agent마다 고유한 지갑 ID를 가지며, owner(Human)가 관리합니다.

### 생성 플로우

```
NPM Package Registration
         │
         ▼
  Extract Agent ID
  (from package.json)
         │
         ▼
  Check if wallet exists
  (getWalletId(owner, agentId))
         │
    ┌────┴────┐
    │ Exists? │
    └────┬────┘
         │ No
         ▼
  Call AgentWallet.createWallet()
  - agentId: string
  - dailyLimit: 100 PNCR (default)
  - whitelistEnabled: true
         │
         ▼
  Event: WalletCreated(walletId, owner, agentId)
         │
         ▼
  Save to DB:
  - agentId → walletId mapping
  - metadata (created_at, agent_name, etc.)
         │
         ▼
  Return walletId to frontend
```

### 데이터 구조

#### On-Chain (AgentWallet Contract)

```solidity
struct Wallet {
    address owner;           // Human wallet address
    string agentId;          // Unique agent identifier
    uint256 balance;         // PNCR balance
    uint256 dailyLimit;      // Daily spending limit
    uint256 spentToday;      // Amount spent today
    uint256 lastResetTime;   // Last limit reset timestamp
    bool whitelistEnabled;   // Whitelist mode
    bool active;             // Wallet status
    uint256 totalSpent;      // Lifetime spending
    uint256 transactionCount;// Total transactions
}

mapping(bytes32 => Wallet) public wallets;
mapping(address => bytes32[]) public walletsByOwner;
mapping(bytes32 => address[]) public approvedRecipients;
mapping(bytes32 => mapping(address => bool)) public operators;
```

#### Off-Chain (Database)

```typescript
model AgentWallet {
  id          String   @id @default(cuid())
  walletId    String   @unique // bytes32 from contract
  agentId     String   @unique
  packageName String
  owner       String   // Ethereum address
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Cached data from contract
  balance     String?  // Updated periodically
  dailyLimit  String?
  active      Boolean  @default(true)
  
  // Relations
  transactions Transaction[]
  
  @@index([owner])
  @@index([agentId])
}
```

### 주요 기능

#### 1. 지갑 생성

**API:** `POST /api/agent-wallet/create`

```typescript
{
  "agentId": "pincer-core",
  "packageName": "@pincer/core",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "dailyLimit": "100" // PNCR
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "walletId": "0x1234...",
    "agentId": "pincer-core",
    "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "txHash": "0xabcd..."
  }
}
```

#### 2. 지갑 조회

**API:** `GET /api/agent-wallet/:agentId`

```typescript
{
  "walletId": "0x1234...",
  "agentId": "pincer-core",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "balance": "250.5",
  "dailyLimit": "100",
  "remainingToday": "100",
  "whitelistEnabled": true,
  "active": true,
  "transactionCount": 42
}
```

#### 3. 송금

**API:** `POST /api/agent-wallet/:agentId/transfer`

```typescript
{
  "to": "0x9999...",
  "amount": "10.5",
  "memo": "Payment for API usage"
}
```

#### 4. 설정 관리

**API:** `POST /api/agent-wallet/:agentId/settings`

```typescript
{
  "dailyLimit": "200",
  "whitelistEnabled": false,
  "addRecipient": "0x8888...",
  "addOperator": "0x7777..."
}
```

---

## Human Wallet

### 개념

Human Wallet은 **커스터디 방식** 지갑으로, 사용자가 별도의 지갑 설정 없이 소셜 로그인만으로 PNCR을 받고 관리할 수 있습니다.

### 생성 플로우

```
Social Login (Google/GitHub)
         │
         ▼
  Get User ID from OAuth
         │
         ▼
  Check if wallet exists
  (DB: SELECT * WHERE userId = ?)
         │
    ┌────┴────┐
    │ Exists? │
    └────┬────┘
         │ No
         ▼
  Generate new wallet
  - Create HD wallet (ethers.Wallet.createRandom())
  - Encrypt private key (AES-256)
  - Store in database
         │
         ▼
  Return wallet info
  (address, balances)
```

### 데이터 구조

#### Database

```typescript
model HumanWallet {
  id                   String   @id @default(cuid())
  userId               String   @unique
  address              String   @unique
  encryptedPrivateKey  String   // AES-256 encrypted
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  // User info
  email                String?
  name                 String?
  provider             String   // google, github, etc.
  
  // Relations
  transactions         Transaction[]
  connectedAgents      AgentConnection[]
  
  @@index([userId])
  @@index([address])
}

model AgentConnection {
  id              String   @id @default(cuid())
  humanWalletId   String
  agentWalletId   String
  createdAt       DateTime @default(now())
  
  humanWallet     HumanWallet  @relation(fields: [humanWalletId], references: [id])
  agentWallet     AgentWallet  @relation(fields: [agentWalletId], references: [id])
  
  @@unique([humanWalletId, agentWalletId])
  @@index([humanWalletId])
}
```

### 주요 기능

#### 1. 지갑 자동 생성

**Trigger:** 첫 로그인 시 자동

```typescript
// app/api/auth/[...nextauth]/route.ts
callbacks: {
  async signIn({ user, account, profile }) {
    const wallet = await getOrCreateHumanWallet(user.id);
    return true;
  }
}
```

#### 2. 잔액 조회

**API:** `GET /api/my-wallet`

```typescript
{
  "userId": "google_12345",
  "address": "0x5555...",
  "balances": {
    "PNCR": "1500.25",
    "ETH": "0.05"
  },
  "connectedAgents": [
    {
      "agentId": "pincer-core",
      "walletId": "0x1234...",
      "balance": "250.5"
    }
  ]
}
```

#### 3. 출금

**API:** `POST /api/my-wallet/withdraw`

```typescript
{
  "to": "0xExternalWallet...",
  "amount": "100",
  "asset": "PNCR"
}
```

#### 4. Agent 연동

**API:** `POST /api/my-wallet/connect-agent`

```typescript
{
  "agentId": "pincer-core"
}
```

**Result:**
- Human wallet address를 Agent wallet의 operator로 등록
- DB에 연동 관계 저장

---

## 지갑 간 교환

### 시나리오

1. **Agent → Human**: Agent가 벌어온 수익을 owner에게 전송
2. **Human → Agent**: Agent 운영 자금 충전
3. **통합**: 여러 Agent 지갑을 Human 지갑으로 통합

### 구현 방식

#### 1. Agent → Human Transfer

```typescript
// API: POST /api/transfer/agent-to-human
{
  "agentId": "pincer-core",
  "humanUserId": "google_12345",
  "amount": "50"
}

// 내부 동작:
// 1. Get Agent wallet ID
// 2. Get Human wallet address
// 3. Call AgentWallet.agentTransfer(walletId, humanAddress, amount, "Transfer to owner")
// 4. Record in DB
```

#### 2. Human → Agent Transfer

```typescript
// API: POST /api/transfer/human-to-agent
{
  "humanUserId": "google_12345",
  "agentId": "pincer-core",
  "amount": "100"
}

// 내부 동작:
// 1. Get Human wallet private key (decrypt)
// 2. Get Agent wallet ID
// 3. Call PNCR.approve(AgentWallet, amount)
// 4. Call AgentWallet.deposit(walletId, amount)
// 5. Record in DB
```

#### 3. Consolidate (통합)

```typescript
// API: POST /api/transfer/consolidate
{
  "humanUserId": "google_12345",
  "agentIds": ["pincer-core", "pincer-sentinel", "pincer-forge"],
  "transferAll": true
}

// 내부 동작:
// 1. For each agent wallet:
//    - Get balance
//    - Transfer to human wallet
// 2. Return summary
```

### Transfer Record

```typescript
model Transaction {
  id            String   @id @default(cuid())
  type          String   // AGENT_TO_HUMAN, HUMAN_TO_AGENT, CONSOLIDATE
  from          String   // wallet ID or address
  to            String   // wallet ID or address
  amount        String
  asset         String   @default("PNCR")
  txHash        String?  // On-chain tx hash
  memo          String?
  status        String   // PENDING, COMPLETED, FAILED
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  agentWalletId String?
  humanWalletId String?
  
  agentWallet   AgentWallet? @relation(fields: [agentWalletId], references: [id])
  humanWallet   HumanWallet? @relation(fields: [humanWalletId], references: [id])
  
  @@index([from])
  @@index([to])
  @@index([status])
  @@index([createdAt])
}
```

---

## 마이페이지 기능

### UI 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        My Wallet                             │
├─────────────────────────────────────────────────────────────┤
│  💰 Total Balance                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PNCR: 1,750.75  (≈ $1,750)                            │ │
│  │  ETH:     0.05   (≈ $125)                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📍 My Address: 0x5555...  [Copy] [QR]                       │
│  🔗 View on Explorer                                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  🤖 Connected Agents                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [⚒️ Forge]         Balance: 250.5 PNCR   [Transfer] │ │
│  │ [🦞 Pincer]        Balance: 500.0 PNCR   [Transfer] │ │
│  │ [🛡️ Sentinel]      Balance: 100.0 PNCR   [Transfer] │ │
│  └────────────────────────────────────────────────────────┘ │
│  [+ Connect New Agent]  [Consolidate All →]                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  📊 Recent Transactions                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 2026-02-06 19:00  Agent→Me    +50 PNCR   (Forge)      │ │
│  │ 2026-02-06 18:30  Me→Agent   -100 PNCR   (Sentinel)   │ │
│  │ 2026-02-06 17:15  Received   +500 PNCR   (0x1234...)  │ │
│  └────────────────────────────────────────────────────────┘ │
│  [View All]                                                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ⚙️ Actions                                                   │
│  [Withdraw to External Wallet]  [Add Funds]                 │
└─────────────────────────────────────────────────────────────┘
```

### 주요 기능 명세

#### 1. 잔액 표시

**API:** `GET /api/my-wallet/dashboard`

**Response:**
```typescript
{
  "humanWallet": {
    "address": "0x5555...",
    "balances": {
      "PNCR": "900.25",
      "ETH": "0.05"
    }
  },
  "agentWallets": [
    {
      "agentId": "forge",
      "name": "Forge",
      "emoji": "⚒️",
      "walletId": "0x1234...",
      "balance": "250.5",
      "dailyLimit": "100"
    }
  ],
  "totalPNCR": "1750.75"
}
```

#### 2. 연동된 Agent 목록

**Features:**
- Agent 이름, 아이콘, 잔액 표시
- 각 Agent 지갑으로 Quick Transfer 버튼
- Agent 지갑 상세 보기 (거래 내역, 설정)

#### 3. 거래 내역

**API:** `GET /api/my-wallet/transactions?page=1&limit=20`

**Response:**
```typescript
{
  "transactions": [
    {
      "id": "tx_123",
      "type": "AGENT_TO_HUMAN",
      "from": "Forge (0x1234...)",
      "to": "My Wallet",
      "amount": "50",
      "asset": "PNCR",
      "timestamp": "2026-02-06T19:00:00Z",
      "txHash": "0xabcd...",
      "status": "COMPLETED"
    }
  ],
  "total": 156,
  "page": 1,
  "hasMore": true
}
```

**Filter Options:**
- Type: ALL, AGENT_TO_HUMAN, HUMAN_TO_AGENT, WITHDRAW, DEPOSIT
- Date Range
- Agent (specific agent wallet)

#### 4. Quick Actions

**Withdraw:**
```typescript
// Modal: Withdraw to External Wallet
{
  "to": "0xExternal...",
  "amount": "100",
  "asset": "PNCR"
}
// → Call POST /api/my-wallet/withdraw
```

**Transfer to Agent:**
```typescript
// Modal: Fund Agent Wallet
{
  "agentId": "forge",
  "amount": "50"
}
// → Call POST /api/transfer/human-to-agent
```

**Consolidate All:**
```typescript
// Confirmation Modal
"Move all PNCR from 3 agent wallets to My Wallet?"
Total: 850.5 PNCR
// → Call POST /api/transfer/consolidate
```

---

## 기존 컨트랙트 연동

### AgentWallet Contract 정보

- **주소:** `0x62905288110a94875Ed946EB9Fd79AfAbe893D62`
- **네트워크:** Base Sepolia
- **ABI:** 이미 구현됨 (`api/src/routes/wallet.ts`)

### 연동 전략

#### 1. 기존 컨트랙트 활용

AgentWallet 컨트랙트는 이미 필요한 모든 기능을 제공하므로, **추가 컨트랙트 배포 없이** 기존 컨트랙트를 그대로 사용합니다.

#### 2. Backend API 확장

기존 `/api/wallet` 엔드포인트를 Agent 전용으로 분리:

```
기존: /api/wallet/*
  → Agent 전용: /api/agent-wallet/*
  → Human 전용: /api/my-wallet/*
  → 교환: /api/transfer/*
```

#### 3. 통합 서비스 레이어

```typescript
// services/WalletService.ts
class WalletService {
  // Agent Wallet (on-chain)
  async createAgentWallet(agentId: string, owner: string)
  async getAgentWallet(agentId: string)
  async agentTransfer(agentId: string, to: string, amount: string)
  
  // Human Wallet (custodial)
  async getOrCreateHumanWallet(userId: string)
  async getHumanWalletBalance(userId: string)
  async humanWithdraw(userId: string, to: string, amount: string)
  
  // Transfer between wallets
  async transferAgentToHuman(agentId: string, userId: string, amount: string)
  async transferHumanToAgent(userId: string, agentId: string, amount: string)
  async consolidateAgentWallets(userId: string, agentIds: string[])
}
```

#### 4. 프론트엔드 통합

```typescript
// hooks/useWallet.ts
export function useWallet() {
  const { data: session } = useSession();
  
  // Human wallet (always available for logged-in users)
  const { data: humanWallet } = useQuery({
    queryKey: ['my-wallet'],
    queryFn: () => fetch('/api/my-wallet').then(r => r.json())
  });
  
  // Agent wallets (if user owns any agents)
  const { data: agentWallets } = useQuery({
    queryKey: ['agent-wallets'],
    queryFn: () => fetch('/api/agent-wallet/list').then(r => r.json())
  });
  
  return {
    humanWallet,
    agentWallets,
    totalBalance: humanWallet?.balance + agentWallets?.reduce((sum, w) => sum + w.balance, 0)
  };
}
```

---

## 보안 고려사항

### 1. Private Key 관리

**Human Wallet:**
- ✅ AES-256-GCM 암호화
- ✅ 환경변수로 암호화 키 관리 (`WALLET_ENCRYPTION_KEY`)
- ✅ Private key는 메모리에서만 복호화, API 응답에 절대 포함 안 함
- ⚠️ Production: AWS Secrets Manager / HashiCorp Vault 사용

**Agent Wallet:**
- ✅ On-chain contract, private key 불필요
- ✅ Owner만 컨트랙트 함수 호출 가능

### 2. 인증 & 권한

```typescript
// Middleware: 본인 지갑만 접근 가능
async function requireWalletOwnership(req, res, next) {
  const session = await getServerSession(req, res, authOptions);
  const walletOwnerId = await getWalletOwner(req.params.walletId);
  
  if (session.user.id !== walletOwnerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
}
```

### 3. Rate Limiting

```typescript
// Rate limits per endpoint
{
  'POST /api/my-wallet/create': '5/hour',
  'POST /api/my-wallet/withdraw': '10/hour',
  'POST /api/transfer/*': '20/hour',
  'GET /api/my-wallet': '60/minute',
}
```

### 4. Transaction Validation

```typescript
// Pre-flight checks before transfer
async function validateTransfer(from, to, amount) {
  // 1. Balance check
  if (fromBalance < amount) throw new Error('Insufficient balance');
  
  // 2. Daily limit check (for agent wallets)
  if (isAgentWallet && dailySpent + amount > dailyLimit) {
    throw new Error('Daily limit exceeded');
  }
  
  // 3. Whitelist check
  if (whitelistEnabled && !approvedRecipients.includes(to)) {
    throw new Error('Recipient not approved');
  }
  
  // 4. Amount validation
  if (amount <= 0 || amount > MAX_TRANSFER) {
    throw new Error('Invalid amount');
  }
}
```

### 5. Audit Logging

```typescript
// Log all sensitive operations
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE_WALLET, TRANSFER, WITHDRAW, etc.
  details   Json
  ipAddress String
  userAgent String
  timestamp DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([timestamp])
}
```

---

## 구현 로드맵

### Phase 1: Agent Wallet 통합 (Week 1)

- [ ] API endpoint refactoring (`/api/wallet` → `/api/agent-wallet`)
- [ ] Agent 등록 플로우에 지갑 생성 통합
- [ ] Agent 지갑 조회 UI (npm registry 페이지)
- [ ] Agent 지갑 관리 UI (설정, 수신자 목록)

### Phase 2: Human Wallet 구현 (Week 2)

- [ ] Custodial wallet 생성 로직
- [ ] Private key 암호화/복호화 서비스
- [ ] 로그인 시 자동 지갑 생성
- [ ] 마이페이지 기본 UI (잔액, 주소)

### Phase 3: 지갑 간 교환 (Week 3)

- [ ] Agent → Human transfer API
- [ ] Human → Agent transfer API (approve + deposit)
- [ ] Consolidate API
- [ ] Transfer 히스토리 기록 및 조회

### Phase 4: 마이페이지 완성 (Week 4)

- [ ] Dashboard UI (총 잔액, Agent 목록)
- [ ] 거래 내역 UI (필터, 페이지네이션)
- [ ] Withdraw 모달
- [ ] Transfer 모달 (Agent ↔ Human)
- [ ] QR 코드 생성 (입금 주소)

### Phase 5: 보안 & 최적화 (Week 5)

- [ ] Rate limiting (Redis)
- [ ] Audit logging
- [ ] Transaction monitoring
- [ ] Gas optimization
- [ ] Error handling & retry logic

### Phase 6: Production 준비 (Week 6)

- [ ] AWS Secrets Manager 연동
- [ ] Database encryption at rest
- [ ] Backup & recovery 절차
- [ ] Monitoring & alerting (Sentry, CloudWatch)
- [ ] Security audit

---

## 부록: API 명세서

### Agent Wallet API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/agent-wallet/create` | Create agent wallet | Session |
| GET | `/api/agent-wallet/:agentId` | Get wallet info | Session |
| GET | `/api/agent-wallet/:agentId/history` | Get transactions | Session |
| POST | `/api/agent-wallet/:agentId/transfer` | Send PNCR | Session + Owner |
| POST | `/api/agent-wallet/:agentId/settings` | Update settings | Session + Owner |

### Human Wallet API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/my-wallet` | Get my wallet | Session |
| GET | `/api/my-wallet/dashboard` | Dashboard data | Session |
| GET | `/api/my-wallet/transactions` | Transaction history | Session |
| POST | `/api/my-wallet/withdraw` | Withdraw to external | Session |
| POST | `/api/my-wallet/connect-agent` | Connect agent | Session |

### Transfer API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transfer/agent-to-human` | Agent → Human | Session + Owner |
| POST | `/api/transfer/human-to-agent` | Human → Agent | Session |
| POST | `/api/transfer/consolidate` | Consolidate all agents | Session |

---

## 참고 자료

- [AgentWallet Contract Source](../contracts/AgentWallet.sol)
- [Existing Wallet API](../WALLET_API_DOCS.md)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Base Network Documentation](https://docs.base.org/)

---

**설계자:** Wallet 🏦  
**검토:** Pincer 🦞, Forge ⚒️  
**승인 대기 중**
