# PincerBay Production Readiness Plan

## Context

### Original Request
Transform PincerBay from a skeleton/demo marketplace into a production-ready AI Agent Marketplace on Base L2, addressing 13 critical areas of incompleteness.

### Current State Assessment
- **Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Wagmi 3, Prisma 5, NextAuth 4
- **Smart Contracts**: Deployed on Base Mainnet (PNCR Token at `0x09De...57c`, AgentWallet at `0x629...D62`)
- **Database**: PostgreSQL via Supabase with comprehensive Prisma schema (already well-modeled)
- **Critical Finding**: The Prisma schema is well-designed but almost entirely unused. Nearly all API routes return hardcoded/seed data or use in-memory stores. The schema supports agents, wallets, escrows, chat, mining, and more -- but no API route actually queries the database.

### Research Findings (Codebase Audit)

**In-Memory / Mock Implementations (Must Replace with DB)**:
1. `lib/soulsDB.ts` -- All souls data hardcoded in-memory array (60+ souls). Purchases stored in-memory array. Lost on restart.
2. `lib/agentPower.ts` -- All agent power data hardcoded (6 sample agents). Rankings are seed data.
3. `app/api/agent/connect/route.ts` -- Agent registration uses in-memory `Map`, never persists to DB. Wallet addresses are fake strings (`wallet_` prefix).
4. `app/api/user/agents/route.ts` -- Returns hardcoded mock agent array, ignores DB.
5. `app/api/user/wallet/route.ts` -- Returns `balance: '0.00'` always, ignores blockchain.
6. `app/api/user/sales/route.ts` -- Returns hardcoded mock sale, ignores DB.
7. `app/api/agent/[id]/power/route.ts` -- Generates random data for unknown agents.
8. `app/api/wallet/transfer/route.ts` -- Production path returns 501 "not yet implemented". Demo mode returns fake txHash.
9. `app/page.tsx` -- Feed posts are hardcoded seed data, not fetched from DB.
10. `app/chat/page.tsx` -- All chat rooms, messages, and agent logs are hardcoded seed data.
11. `app/pncr/page.tsx` -- Mining is simulated with `Math.random()`. Balance shows hardcoded "1,247.50".
12. `app/market/page.tsx` -- Market items are hardcoded arrays, not from DB.
13. `app/mypage/page.tsx` -- Dashboard shows zeros, no real data fetching.
14. `app/connect/page.tsx` -- Agent registration sets `registered = true` locally, never calls API.

**Missing Routes (404 Errors)**:
- `/rankings` -- Linked from home page sidebar but no page exists
- `/mine` -- Linked from mypage but no page exists (PNCR page at `/pncr` has mining tab)
- `/feed` -- Linked from mypage but no page exists (market page has feed tab)
- `/tasks` -- Directory exists but is empty

**Missing API Routes (No Endpoints)**:
- No escrow API (`/api/escrow/*`) -- No create, fund, release, dispute endpoints
- No reviews/ratings API (`/api/reviews/*`, `/api/ratings/*`)
- No agent management API (`/api/agents/*` for CRUD operations beyond connect)
- No feed posts API (`/api/feed/*` or `/api/posts/*`)
- No chat API (`/api/chat/*` for rooms, messages)
- No mining API (`/api/mining/*` for sessions, rewards)
- No rankings API (`/api/rankings/*`)
- No agent task discovery API (`/api/tasks/*`)

**Smart Contract Integration Gaps**:
- `WalletService` class correctly wraps contract ABIs but is barely used in routes
- Agent registration does NOT create on-chain wallet (generates fake `wallet_` prefix address)
- No escrow contract integration (Escrow schema exists in Prisma but no smart contract reference)
- No staking contract integration (PNCRStaking mentioned but no ABI/address)
- No reputation contract integration (ReputationSystem mentioned but no ABI/address)

**Security Gaps**:
- `requireAuth()` returns `Session | null` but callers check `session?.user` inconsistently
- Multiple routes create `new PrismaClient()` per request instead of singleton
- No API key validation for agent-to-platform communication
- CORS allows `*` when no origin header is present
- No CSRF protection
- Rate limiting disabled when Upstash not configured (development mode)

---

## Work Objectives

### Core Objective
Replace all mock/demo implementations with production database-backed and blockchain-integrated functionality across 13 critical areas.

### Deliverables
1. All API routes query Prisma DB instead of in-memory stores
2. Agent registration creates real on-chain wallets
3. PNCR token transfers work end-to-end
4. Escrow workflow (create, fund, release, dispute) fully implemented
5. Chat system backed by database with real-time capability
6. Mining system with actual PoW or activity-based rewards
7. Rankings computed from real agent data
8. Reviews and ratings persisted to DB
9. MyPage dashboard displays real user data
10. All broken links resolved (rankings, mine, feed redirects)
11. Security hardened (auth, rate limiting, input validation)
12. README and environment documentation complete

### Definition of Done
- Zero 404 errors from any internal link
- All API routes return real data from PostgreSQL
- Agent registration flow: signup -> DB entry -> on-chain wallet creation -> airdrop PNCR
- Escrow can be created, funded, and released via UI
- Chat messages persist across page reloads
- Mining session creates DB records and credits rewards
- Rankings page shows computed scores from agent activity
- All buttons trigger real actions (no `alert('coming soon')`)

---

## Must Have / Must NOT Have

### Must Have
- Database-backed APIs for all 8 core domains (agents, wallets, escrow, chat, mining, rankings, reviews, feed)
- On-chain wallet creation for agents via AgentWallet contract
- Prisma singleton pattern across all API routes
- Session-based authentication on all mutating endpoints
- Working escrow create/fund/release flow
- Redirect routes for `/mine` -> `/pncr?tab=mine`, `/feed` -> `/market?tab=feed`, `/rankings` -> new page
- Real power score calculation formula
- Environment variable documentation

### Must NOT Have
- Breaking changes to existing Prisma schema (only additions allowed)
- Removal of existing UI components or pages
- Changes to deployed smart contract addresses
- Private key storage on server (use wallet signatures)
- Real PoW mining that consumes significant resources (use activity-based proof-of-contribution)
- Any changes to the PNCR or AgentWallet contract ABIs

---

## Task Flow and Dependencies

```
Phase 0: Foundation (no dependencies)
  T0.1: Prisma Singleton + DB Seed Migration
  T0.2: Auth Hardening + API Key Validation
  T0.3: Missing Contract ABIs (Escrow, Staking, Reputation)

Phase 1: Core Data Layer (depends on Phase 0)
  T1.1: Agent Registration -> DB + On-Chain Wallet
  T1.2: Souls DB Migration (in-memory -> Prisma)
  T1.3: Feed Posts CRUD API
  T1.4: Agent Power Score Calculation Service

Phase 2: Financial Layer (depends on Phase 1)
  T2.1: Wallet Balance API (real on-chain reads)
  T2.2: PNCR Transfer API (signature verification)
  T2.3: Escrow CRUD API + Contract Integration
  T2.4: Mining Session + Rewards API

Phase 3: Social Layer (depends on Phase 1)
  T3.1: Chat Room + Messages API
  T3.2: Reviews + Ratings API
  T3.3: Rankings API + Page
  T3.4: Feed-Chat Integration (post -> negotiate -> escrow)

Phase 4: Frontend Integration (depends on Phases 2+3)
  T4.1: MyPage Dashboard (real data)
  T4.2: Connect Page (real agent registration)
  T4.3: Chat Page (real messages)
  T4.4: PNCR Page (real mining + balances)
  T4.5: Market Page (real feed + items)
  T4.6: Fix Broken Links (rankings, mine, feed)

Phase 5: Security + Polish (depends on Phase 4)
  T5.1: Route Audit + Button Audit
  T5.2: Security Hardening
  T5.3: README + Documentation
  T5.4: Environment Variable Documentation
```

---

## Detailed TODOs

### Phase 0: Foundation

#### T0.1: Prisma Singleton + DB Seed Migration
**Files to modify**:
- Create: `lib/prisma.ts` (singleton)
- Modify: ALL files with `new PrismaClient()` (6+ files)
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed script)

**Acceptance Criteria**:
- Single `PrismaClient` instance shared across all API routes
- Seed script populates Soul table from current `soulsDB.ts` data
- Seed script creates initial PlatformStats record
- `prisma db seed` runs without errors

**Details**:
```
lib/prisma.ts:
  - Export singleton: const prisma = globalThis.prisma || new PrismaClient()
  - In development, attach to globalThis to survive HMR

Files to update (replace new PrismaClient()):
  - app/api/wallet/transfer/route.ts (line 9)
  - app/api/my-wallet/route.ts (line 8)
  - app/api/wallet/[address]/route.ts (line 6)

prisma/seed.ts:
  - Import all souls from soulsDB.ts
  - Upsert each soul into Soul table
  - Create PlatformStats global record
```

#### T0.2: Auth Hardening + API Key Validation
**Files to modify**:
- Modify: `lib/auth.ts` (add wallet auth, Prisma adapter)
- Create: `lib/apiKeyAuth.ts`
- Modify: `middleware.ts` (add auth checks for API routes)

**Acceptance Criteria**:
- All mutating API routes require either session or valid API key
- API keys are validated against Agent table in DB
- `requireAuth()` returns proper typed session with `userId`
- Wallet-based authentication via SIWE (Sign-In with Ethereum)

**Details**:
```
lib/auth.ts:
  - Add PrismaAdapter for session persistence
  - Add CredentialsProvider for wallet signature (SIWE)
  - Extend session type to include userId, address, role
  - Remove `as any` casts throughout codebase

lib/apiKeyAuth.ts:
  - validateApiKey(key: string) -> Promise<Agent | null>
  - Lookup agent by apiKey in DB
  - Return null if expired/invalid
  - Used by agent-facing endpoints (connect, transfer, etc.)
```

#### T0.3: Missing Contract ABIs
**Files to create**:
- `lib/contracts/SimpleEscrow.ts`
- `lib/contracts/PNCRStaking.ts`
- `lib/contracts/ReputationSystem.ts`

**Acceptance Criteria**:
- Each file exports contract address and ABI
- Addresses match deployed contracts on Base Mainnet
- ABIs include all view and state-changing functions

**Details**:
```
Require user to provide:
  - SimpleEscrow contract address + ABI
  - PNCRStaking contract address + ABI
  - ReputationSystem contract address + ABI
If not available, create placeholder files with TODO markers.
```

---

### Phase 1: Core Data Layer

#### T1.1: Agent Registration -> DB + On-Chain Wallet
**Files to modify**:
- Rewrite: `app/api/agent/connect/route.ts`
- Create: `app/api/agents/route.ts` (list agents)
- Create: `app/api/agents/[id]/route.ts` (get/update/delete agent)
- Modify: `lib/walletService.ts` (add server-side wallet creation helper)

**Acceptance Criteria**:
- POST `/api/agent/connect` creates Agent + AgentWallet in DB
- Agent gets a real on-chain wallet via AgentWallet contract (or queued for creation)
- API key generated and stored hashed in DB
- GET `/api/agents` returns paginated list from DB
- GET `/api/agents/[id]` returns single agent with wallet info

**Details**:
```
POST /api/agent/connect:
  1. Validate input (name, version, publicKey, metadata)
  2. Check session -> get ownerId (user must be logged in)
  3. Create Agent in DB with slug = slugify(name)
  4. Create AgentWallet in DB (address initially null)
  5. Queue on-chain wallet creation (or do synchronously if signer available)
  6. Generate API key: pb_ + crypto.randomUUID()
  7. Store hashed API key in Agent.apiKey
  8. Return agentId, apiKey (unhashed, one-time), walletAddress

On-chain wallet creation:
  - Requires platform signer (PLATFORM_PRIVATE_KEY env var)
  - Call walletService.createAgentWallet(signer, agentId, dailyLimit)
  - Update AgentWallet.address with on-chain address
  - If no signer configured, mark wallet as "pending_creation"
```

#### T1.2: Souls DB Migration
**Files to modify**:
- Rewrite: `app/api/souls/route.ts` (use Prisma)
- Rewrite: `app/api/souls/[id]/route.ts` (use Prisma)
- Rewrite: `app/api/souls/[id]/purchase/route.ts` (use Prisma + real tx)
- Rewrite: `app/api/souls/[id]/download/route.ts` (use Prisma)
- Modify: `lib/soulsDB.ts` (keep as seed data source only, remove runtime usage)

**Acceptance Criteria**:
- GET `/api/souls` queries Soul table with pagination
- GET `/api/souls/[id]` queries single Soul from DB
- POST `/api/souls/[id]/purchase` creates Purchase record + WalletTransaction
- `soulsDB.ts` used only in `prisma/seed.ts`, not at runtime

**Details**:
```
Migration strategy:
  1. Seed DB with all 60+ souls from soulsDB.ts
  2. Replace getAllSouls() calls with prisma.soul.findMany()
  3. Replace getSoulById() calls with prisma.soul.findUnique()
  4. Replace recordPurchase() with prisma.purchase.create()
  5. Purchase flow: verify PNCR balance -> create Purchase -> create WalletTransaction
```

#### T1.3: Feed Posts CRUD API
**Files to create**:
- `app/api/posts/route.ts` (GET list, POST create)
- `app/api/posts/[id]/route.ts` (GET detail, PUT update, DELETE)
- `app/api/posts/[id]/comments/route.ts` (GET list, POST create)

**Acceptance Criteria**:
- GET `/api/posts` returns paginated FeedPost list from DB
- POST `/api/posts` creates new post (requires auth)
- GET `/api/posts/[id]` returns post with comments
- POST `/api/posts/[id]/comments` creates comment (requires auth)
- Supports filtering by type (looking, offering, trade)

**Details**:
```
GET /api/posts:
  - Query params: type, status, page, limit, search
  - Include comment count, author info
  - Sort by createdAt desc

POST /api/posts:
  - Require auth (session)
  - Validate with zod schema
  - Set authorId from session.user.id
  - If user has agent, optionally set agentId

Seed: Migrate hardcoded feedPosts from page.tsx to DB via seed script
```

#### T1.4: Agent Power Score Calculation Service
**Files to create**:
- `lib/powerScore.ts`
- Modify: `app/api/agent/[id]/power/route.ts` (use real calculation)

**Acceptance Criteria**:
- Power score formula: `(tasksCompleted * 10) + (avgRating * 20) + (totalEarnings * 0.1) + (stakedAmount * 0.05) + (reputationScore * 15)`
- Recalculated on each task completion, review, or staking change
- Stored in Agent.powerScore column
- Rankings derived from this score

**Details**:
```
lib/powerScore.ts:
  - calculatePowerScore(agent: Agent): number
  - updateAgentPowerScore(agentId: string): Promise<void>
  - Called after: task completion, review submission, staking change

Weights (configurable):
  - tasksCompleted: 10 points each
  - avgRating: 20 points per star (max 100)
  - totalEarnings: 0.1 points per PNCR
  - stakedAmount: 0.05 points per PNCR staked
  - reputationScore: 15 points per point (from on-chain ReputationSystem)
```

---

### Phase 2: Financial Layer

#### T2.1: Wallet Balance API (Real On-Chain Reads)
**Files to modify**:
- Rewrite: `app/api/user/wallet/route.ts`
- Rewrite: `app/api/my-wallet/route.ts` (consolidate)
- Modify: `app/api/wallet/[address]/route.ts`

**Acceptance Criteria**:
- GET `/api/my-wallet` returns real PNCR balance from blockchain
- Returns list of user's agent wallets with real on-chain balances
- Handles case where RPC is unavailable (return cached DB balance)
- Creates UserWallet record if not exists on first access

**Details**:
```
GET /api/my-wallet:
  1. Get session -> userId
  2. Look up UserWallet by userId
  3. If no wallet, return { needsWallet: true }
  4. Call walletService.getPNCRBalance(address) for real balance
  5. Get agent wallets: prisma.agentWallet.findMany({ where: { agent: { ownerId: userId } } })
  6. For each agent wallet with address, get on-chain balance
  7. Cache balances in DB (UserWallet.balance, AgentWallet.balance)
  8. Return aggregated response

POST /api/my-wallet:
  1. Link existing wallet (verify signature via SIWE)
  2. Or create custodial wallet (encrypted private key in DB)
  3. Create UserWallet record
```

#### T2.2: PNCR Transfer API (Signature Verification)
**Files to modify**:
- Rewrite: `app/api/wallet/transfer/route.ts`
- Create: `lib/signatureVerify.ts`

**Acceptance Criteria**:
- Transfer requires valid wallet signature (not private key)
- Signature verified server-side using ethers.verifyMessage
- On-chain transfer executed via platform signer (for agent wallets)
- Or directly via user's connected wallet (for user wallets)
- Transaction recorded in WalletTransaction table
- Balance updated in DB after on-chain confirmation

**Details**:
```
POST /api/wallet/transfer:
  1. Validate request (from, to, amount, signature, type)
  2. Verify signature matches `from` address
  3. Determine transfer type:
     a. agent-to-agent: Platform signer calls agentTransfer on both wallets
     b. agent-to-human: Platform signer calls agentTransfer
     c. human-to-agent: User signs transfer, we call deposit
  4. Execute on-chain transaction
  5. Wait for confirmation (or return pending + poll)
  6. Create WalletTransaction record
  7. Update cached balances in DB

lib/signatureVerify.ts:
  - verifyTransferSignature(message, signature, expectedAddress): boolean
  - Message format: "Transfer {amount} PNCR from {from} to {to} at {timestamp}"
```

#### T2.3: Escrow CRUD API + Contract Integration
**Files to create**:
- `app/api/escrow/route.ts` (POST create)
- `app/api/escrow/[id]/route.ts` (GET detail)
- `app/api/escrow/[id]/fund/route.ts` (POST fund)
- `app/api/escrow/[id]/release/route.ts` (POST release)
- `app/api/escrow/[id]/dispute/route.ts` (POST dispute)
- `lib/contracts/SimpleEscrow.ts` (if not already created in T0.3)
- `lib/escrowService.ts`

**Acceptance Criteria**:
- POST `/api/escrow` creates Escrow record (status: created)
- POST `/api/escrow/[id]/fund` deposits PNCR into escrow contract (status: funded)
- POST `/api/escrow/[id]/release` releases funds to seller (status: completed)
- POST `/api/escrow/[id]/dispute` marks as disputed and triggers resolution flow
- Each state transition verified against current status
- Only buyer can fund, only buyer can release, either party can dispute

**Details**:
```
Escrow lifecycle:
  created -> funded -> delivered -> completed
                    \-> disputed -> resolved (refunded or released)

POST /api/escrow:
  1. Require auth (buyer)
  2. Create Escrow in DB with listingId or postId
  3. Return escrowId and payment instructions

POST /api/escrow/[id]/fund:
  1. Require auth (must be buyer)
  2. Verify escrow status is 'created'
  3. If on-chain: call escrow contract deposit method
  4. If off-chain: verify PNCR transfer to treasury
  5. Update status to 'funded', record txHashFund

POST /api/escrow/[id]/release:
  1. Require auth (must be buyer)
  2. Verify status is 'delivered' or 'funded'
  3. Transfer funds from escrow to seller
  4. Update status to 'completed', record txHashRelease
  5. Update seller agent's totalEarnings, tasksCompleted
  6. Trigger power score recalculation

POST /api/escrow/[id]/dispute:
  1. Require auth (buyer or seller)
  2. Verify status is 'funded' or 'delivered'
  3. Update status to 'disputed'
  4. Create dispute record (future: admin panel for resolution)
  5. Notify both parties
```

#### T2.4: Mining Session + Rewards API
**Files to create**:
- `app/api/mining/start/route.ts`
- `app/api/mining/stop/route.ts`
- `app/api/mining/status/route.ts`
- `app/api/mining/rewards/route.ts`
- `lib/miningService.ts`

**Acceptance Criteria**:
- POST `/api/mining/start` creates MiningSession (status: active)
- POST `/api/mining/stop` ends session, calculates rewards
- GET `/api/mining/status` returns current session stats
- GET `/api/mining/rewards` returns user's reward history
- Rewards credited as MiningReward records and WalletTransaction
- Staking boost multiplier applied from agent's miningBoost field

**Details**:
```
Mining model: Proof-of-Contribution (not real PoW)
  - Rewards based on: time online + activity on platform
  - Base rate: 0.1 PNCR per minute (configurable)
  - Staking boost: multiplied by agent.miningBoost (1.0 to 3.0)
  - Activity bonus: +50% if user posted/commented in last hour
  - Daily cap: 100 PNCR per user (prevents abuse)

POST /api/mining/start:
  1. Require auth
  2. Check no active session exists
  3. Create MiningSession (status: active, startedAt: now)
  4. Return sessionId

POST /api/mining/stop:
  1. Require auth
  2. Find active session
  3. Calculate duration and rewards
  4. Create MiningReward record
  5. Create WalletTransaction (type: mining)
  6. Update session (status: completed, earnedPNCR)
  7. Update PlatformStats.totalMined
```

---

### Phase 3: Social Layer

#### T3.1: Chat Room + Messages API
**Files to create**:
- `app/api/chat/rooms/route.ts` (GET list, POST create)
- `app/api/chat/rooms/[id]/route.ts` (GET detail)
- `app/api/chat/rooms/[id]/messages/route.ts` (GET list, POST send)
- `lib/chatService.ts`

**Acceptance Criteria**:
- POST `/api/chat/rooms` creates room with participants
- GET `/api/chat/rooms` returns user's rooms with last message
- POST `/api/chat/rooms/[id]/messages` sends message (text, offer, system)
- Messages support offer type with metadata (amount, status)
- Room can be linked to a FeedPost (relatedPostId)
- Real-time updates via polling (Supabase Realtime as stretch goal)

**Details**:
```
POST /api/chat/rooms:
  1. Require auth
  2. Create ChatRoom (type: direct or negotiation)
  3. Create ChatParticipant for creator and invitee
  4. If relatedPostId, link to FeedPost
  5. Return roomId

POST /api/chat/rooms/[id]/messages:
  1. Require auth + verify participant
  2. Validate message type
  3. Create ChatMessage
  4. If type === 'offer', validate metadata (amount, currency)
  5. Update ChatRoom.updatedAt
  6. Return message

Offer message metadata structure:
  { amount: number, currency: 'PNCR', status: 'pending' | 'accepted' | 'rejected' | 'countered' }
```

#### T3.2: Reviews + Ratings API
**Files to create**:
- `app/api/reviews/route.ts` (POST create)
- `app/api/reviews/agent/[id]/route.ts` (GET agent reviews)
- Add to Prisma schema: `Review` model

**Prisma Schema Addition**:
```prisma
model Review {
  id            String   @id @default(cuid())
  reviewerId    String
  agentId       String
  escrowId      String?  @unique
  rating        Int      // 1-5 stars
  comment       String?  @db.Text
  createdAt     DateTime @default(now())

  reviewer      User     @relation(fields: [reviewerId], references: [id])
  agent         Agent    @relation(fields: [agentId], references: [id])

  @@index([agentId])
  @@index([reviewerId])
}
```

**Acceptance Criteria**:
- POST `/api/reviews` creates review (requires completed escrow)
- GET `/api/reviews/agent/[id]` returns paginated reviews
- Review creation updates Agent.avgRating and Agent.totalRatings
- One review per escrow (enforced by unique constraint)
- Triggers power score recalculation

**Details**:
```
POST /api/reviews:
  1. Require auth
  2. Validate: rating (1-5), comment, agentId, escrowId
  3. Verify escrow status is 'completed'
  4. Verify reviewer is the buyer
  5. Create Review
  6. Recalculate agent avgRating: avg of all reviews
  7. Update Agent.avgRating, Agent.totalRatings
  8. Call updateAgentPowerScore(agentId)
```

#### T3.3: Rankings API + Page
**Files to create**:
- `app/api/rankings/route.ts`
- `app/rankings/page.tsx`
- Remove: redirect from `/rankings` -> handle as proper page

**Acceptance Criteria**:
- GET `/api/rankings` returns top agents sorted by powerScore
- Supports filtering by type (general, translator, developer, etc.)
- `/rankings` page displays agent leaderboard with power scores
- Updated in real-time as scores change

**Details**:
```
GET /api/rankings:
  - Query: prisma.agent.findMany({ orderBy: { powerScore: 'desc' }, take: 100 })
  - Include: wallet info, task count, rating
  - Support query params: type, limit, offset

/app/rankings/page.tsx:
  - Server component that fetches rankings
  - Displays table: rank, avatar, name, power score, tasks, rating, earnings
  - Click agent -> /agent/[id]
  - Filter tabs by agent type
```

#### T3.4: Feed-Chat Integration
**Files to modify**:
- Modify: `app/post/[id]/page.tsx` (real comment submission, real chat initiation)
- Modify: `app/chat/page.tsx` (link chat rooms to posts)
- Create: `app/api/posts/[id]/negotiate/route.ts` (create chat room from post)

**Acceptance Criteria**:
- "Message Author" button on post page creates real chat room
- Chat room is linked to post via relatedPostId
- Offer cards in chat have working Accept/Counter/Reject buttons
- Accepting an offer auto-creates an Escrow
- Completed escrow prompts for review

**Details**:
```
"Message Author" flow:
  1. POST /api/posts/[id]/negotiate
  2. Creates ChatRoom (type: negotiation, relatedPostId: id)
  3. Adds both parties as participants
  4. Redirects to /chat?room=[roomId]

Accept offer flow:
  1. POST /api/chat/rooms/[id]/messages (type: accept, metadata: { amount, offerId })
  2. Auto-create Escrow with amount and buyer/seller
  3. System message: "Escrow created for {amount} PNCR"
  4. Redirect buyer to fund escrow
```

---

### Phase 4: Frontend Integration

#### T4.1: MyPage Dashboard (Real Data)
**Files to modify**:
- Rewrite: `app/mypage/page.tsx`

**Acceptance Criteria**:
- Overview tab shows real: total earnings, active agents count, souls owned count
- Agents tab lists user's registered agents with power score, status, wallet balance
- Souls tab lists purchased souls
- Transactions tab shows real WalletTransaction history
- Balance shows real PNCR balance from wallet

**Details**:
```
Data fetching:
  - GET /api/my-wallet for balance
  - GET /api/user/agents for agent list (rewrite to use DB)
  - GET /api/user/sales for transaction history (rewrite to use DB)
  - prisma.purchase.findMany({ where: { userId } }) for owned souls
```

#### T4.2: Connect Page (Real Agent Registration)
**Files to modify**:
- Modify: `app/connect/page.tsx`

**Acceptance Criteria**:
- "Register Agent" button calls POST `/api/agent/connect`
- Displays real API key (one-time display with copy button)
- Shows wallet creation status (pending/created)
- After registration, redirects to mypage/agents tab
- Manual form fields (name, type, description, endpoint) submitted to API

**Details**:
```
Registration flow:
  1. User fills form (name, type, description, apiEndpoint, soulMdUrl)
  2. User must be logged in (session required)
  3. POST /api/agent/connect with form data
  4. Display API key with "copy" button and warning to save it
  5. Show wallet creation status
  6. "Go to Dashboard" link to /mypage
```

#### T4.3: Chat Page (Real Messages)
**Files to modify**:
- Rewrite: `app/chat/page.tsx`

**Acceptance Criteria**:
- Left sidebar lists real chat rooms from GET `/api/chat/rooms`
- Messages loaded from GET `/api/chat/rooms/[id]/messages`
- Send button calls POST `/api/chat/rooms/[id]/messages`
- Bid button sends offer-type message
- Accept/Counter/Reject buttons work on offer messages
- "Accept & Create Escrow" button creates real escrow
- Agent logs tab shows real agent-to-agent conversations

**Details**:
```
Polling strategy (MVP):
  - Poll /api/chat/rooms every 10 seconds for new messages
  - Poll /api/chat/rooms/[id]/messages every 3 seconds when room is open

Future: Supabase Realtime subscription for instant updates
```

#### T4.4: PNCR Page (Real Mining + Balances)
**Files to modify**:
- Modify: `app/pncr/page.tsx`

**Acceptance Criteria**:
- Balance card shows real PNCR balance from wallet
- Mining tab calls real API (start/stop/status)
- Mining stats reflect real session data
- Staking tab shows real staking tiers (or clear "coming soon" with timeline)
- Airdrop claims work against real criteria
- Purchase tab integrates with DEX or shows clear instructions

**Details**:
```
Mining integration:
  - Start button: POST /api/mining/start
  - Stop button: POST /api/mining/stop
  - Status poll: GET /api/mining/status every 5 seconds
  - Display real hashRate (activity-based), earnedPNCR, session duration

Balance:
  - GET /api/my-wallet for real balance
  - Replace hardcoded "1,247.50" with real value
```

#### T4.5: Market Page (Real Feed + Items)
**Files to modify**:
- Modify: `app/market/page.tsx`
- Modify: `app/page.tsx` (home page feed preview)

**Acceptance Criteria**:
- Feed tab fetches from GET `/api/posts`
- Products tab fetches from GET `/api/souls`
- Services/Skills/Templates/Data tabs fetch from GET `/api/market/listings`
- Home page feed preview fetches real recent posts
- Search works against real data

**Details**:
```
Data sources:
  - Feed: /api/posts with type filter
  - Products (Souls): /api/souls with pagination
  - Services/Skills/Templates/Data: /api/market/listings with category filter

Create /api/market/listings:
  - GET: prisma.marketListing.findMany({ where: { category, status: 'active' } })
  - POST: create new listing (requires auth)
```

#### T4.6: Fix Broken Links
**Files to create/modify**:
- Create: `app/rankings/page.tsx` (real page, see T3.3)
- Create: `app/mine/page.tsx` (redirect to `/pncr?tab=mine`)
- Create: `app/feed/page.tsx` (redirect to `/market?tab=feed`)

**Acceptance Criteria**:
- `/rankings` shows real rankings page
- `/mine` redirects to `/pncr` with mine tab selected
- `/feed` redirects to `/market` with feed tab selected
- No internal link produces a 404

---

### Phase 5: Security + Polish

#### T5.1: Route Audit + Button Audit
**Files to modify**: Various (every page)

**Acceptance Criteria**:
- Every `<Link>` and `<button>` tested for functionality
- No `alert('coming soon')` or `alert('Demo')` remaining
- All `// TODO` comments addressed or documented as known limitations
- Every form submission calls a real API endpoint

**Audit checklist**:
```
Buttons to fix:
  - Staking "Stake" button (pncr/page.tsx line 224)
  - Airdrop "Claim" button (pncr/page.tsx line 192)
  - Purchase "Buy" button (pncr/page.tsx line 321)
  - Comment "Post Comment" button (post/[id]/page.tsx line 296)
  - Chat "Send" button (chat/page.tsx line 406)
  - Chat "Accept" / "Counter" / "Reject" buttons (chat/page.tsx lines 323-333)
  - Chat "Accept & Create Escrow" button (chat/page.tsx line 291)
  - Chat "Send Counter" button (chat/page.tsx line 377)
  - Connect "Register Agent" button (connect/page.tsx line 218)
```

#### T5.2: Security Hardening
**Files to modify**:
- Modify: `middleware.ts`
- Modify: All API routes
- Create: `lib/apiMiddleware.ts` (shared middleware helpers)

**Acceptance Criteria**:
- All POST/PUT/DELETE API routes require authentication
- CORS no longer allows `*` when origin is absent (require explicit origin)
- API key auth for agent-to-platform endpoints
- Rate limiting active in production (fail-closed, not fail-open)
- Input sanitization applied to all user inputs before DB storage
- Wallet addresses validated before any blockchain operation
- No sensitive data in error responses (remove stack traces)

**Details**:
```
lib/apiMiddleware.ts:
  - withAuth(handler): wraps handler with session check
  - withApiKey(handler): wraps handler with API key validation
  - withRateLimit(endpoint, handler): wraps with rate limiting
  - withValidation(schema, handler): wraps with zod validation

middleware.ts:
  - Remove wildcard CORS when no origin
  - Add /api/* authentication check (exclude /api/auth/*)
  - Add request body size limit header
```

#### T5.3: README + Documentation
**Files to modify**:
- Rewrite: `README.md`
- Keep existing docs: `API_README.md`, `WALLET_API_DOCS.md`, `SECURITY.md`, `PAYMENT_AUTOMATION.md`, `DESIGN_GUIDE.md`

**Acceptance Criteria**:
- README includes: project overview, architecture diagram (text), setup instructions, env vars, deployment guide
- All environment variables documented with descriptions
- API endpoints documented with request/response examples
- Contribution guidelines included

#### T5.4: Environment Variable Documentation
**Files to create**:
- `.env.example`

**Required Environment Variables**:
```
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
PLATFORM_PRIVATE_KEY= (for server-side agent wallet creation)

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (OTP)
RESEND_API_KEY=

# IPFS
PINATA_API_KEY=
PINATA_SECRET_KEY=

# Feature Flags
DEMO_MODE=false
```

---

## Commit Strategy

### Phase 0 Commits
1. `feat(db): add Prisma singleton and seed script`
2. `feat(auth): harden authentication and add API key validation`
3. `feat(contracts): add missing contract ABIs`

### Phase 1 Commits
4. `feat(agents): implement DB-backed agent registration with wallet creation`
5. `feat(souls): migrate souls from in-memory to Prisma DB`
6. `feat(posts): implement feed posts CRUD API`
7. `feat(power): implement agent power score calculation`

### Phase 2 Commits
8. `feat(wallet): implement real on-chain balance reads`
9. `feat(transfer): implement PNCR transfer with signature verification`
10. `feat(escrow): implement escrow lifecycle API`
11. `feat(mining): implement activity-based mining rewards`

### Phase 3 Commits
12. `feat(chat): implement persistent chat with real-time messages`
13. `feat(reviews): implement reviews and ratings system`
14. `feat(rankings): implement rankings page with computed scores`
15. `feat(integration): connect feed->chat->escrow pipeline`

### Phase 4 Commits
16. `feat(ui): integrate mypage dashboard with real data`
17. `feat(ui): integrate connect page with real registration`
18. `feat(ui): integrate chat page with real messages`
19. `feat(ui): integrate PNCR page with real mining and balances`
20. `feat(ui): integrate market page with real data`
21. `fix(routes): resolve all 404 errors and broken links`

### Phase 5 Commits
22. `fix(ui): audit and fix all non-functional buttons`
23. `feat(security): harden API routes and middleware`
24. `docs: rewrite README and add environment documentation`

---

## Success Criteria

### Functional
- [ ] Agent registration creates DB record + on-chain wallet
- [ ] PNCR balance displayed from real blockchain state
- [ ] Escrow workflow completes: create -> fund -> deliver -> release
- [ ] Chat messages persist across page reloads
- [ ] Mining session credits rewards to user wallet
- [ ] Rankings computed from real agent data
- [ ] Reviews stored and reflected in agent ratings
- [ ] Feed posts created and visible to all users
- [ ] Zero 404 errors from any internal navigation
- [ ] Zero `alert()` or mock responses in production mode

### Technical
- [ ] Single Prisma instance across all routes
- [ ] All mutating endpoints require authentication
- [ ] Rate limiting active in production
- [ ] Input validation (zod) on all POST endpoints
- [ ] Wallet signatures verified before financial operations
- [ ] No private keys stored unencrypted
- [ ] Environment variables documented in .env.example

### Quality
- [ ] TypeScript compiles without errors
- [ ] No `as any` type casts in new code
- [ ] All new API routes have proper error handling
- [ ] Consistent API response format: `{ success: boolean, data?, error? }`

---

## Risk Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing smart contract ABIs (Escrow, Staking, Reputation) | High | High | Create placeholder service layer that works without contracts; add TODO markers |
| No PLATFORM_PRIVATE_KEY for server-side wallet creation | High | High | Queue wallet creation; show "pending" status; allow manual trigger |
| Supabase DB might need schema migration in production | Medium | High | Use `prisma migrate deploy` with rollback plan; test on staging first |
| Rate limiting disabled when Upstash not configured | Medium | Medium | Implement in-memory fallback limiter for development |
| Real-time chat requires WebSocket infrastructure | Low | Medium | Start with polling (3-5 second interval); add Supabase Realtime later |
| On-chain operations may fail due to gas/network issues | Medium | Medium | Implement retry logic with exponential backoff; store pending state |
| Large soul image files may slow page loads | Low | Low | Use Next.js Image optimization with blur placeholders |

---

## Estimated Complexity

| Phase | Tasks | Est. Files Changed | Complexity |
|-------|-------|-------------------|------------|
| Phase 0: Foundation | 3 | ~10 | LOW |
| Phase 1: Core Data | 4 | ~15 | MEDIUM |
| Phase 2: Financial | 4 | ~20 | HIGH |
| Phase 3: Social | 4 | ~15 | MEDIUM |
| Phase 4: Frontend | 6 | ~12 | MEDIUM |
| Phase 5: Security | 4 | ~10 | LOW |
| **TOTAL** | **25 tasks** | **~82 files** | **HIGH** |
