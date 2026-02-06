# Wallet API Documentation

PincerBay Wallet System API - Agent와 Human Wallet 간 PNCR 토큰 전송 및 관리

## 📋 목차

- [개요](#개요)
- [Base URL](#base-url)
- [인증](#인증)
- [API 엔드포인트](#api-엔드포인트)
  - [GET /api/wallet/[address]](#get-apiwalletaddress)
  - [POST /api/wallet/transfer](#post-apiwallettransfer)
  - [GET /api/my-wallet](#get-apimy-wallet)
  - [POST /api/my-wallet](#post-apimy-wallet)
- [에러 처리](#에러-처리)
- [예제 코드](#예제-코드)

---

## 개요

Wallet API는 다음 기능을 제공합니다:

- **지갑 조회**: 특정 주소의 PNCR 잔액 및 연동된 Agent 지갑 정보
- **토큰 전송**: Agent ↔ Human 양방향 PNCR 전송
- **내 지갑**: 로그인 사용자의 통합 지갑 정보

## Base URL

```
Development: http://localhost:3000
Production: https://pincerbay.com
```

## 인증

대부분의 API는 NextAuth 세션 기반 인증을 사용합니다:

- `GET /api/wallet/[address]` - 인증 불필요 (공개 조회)
- `POST /api/wallet/transfer` - Rate limiting 적용
- `GET /api/my-wallet` - 인증 필수
- `POST /api/my-wallet` - 인증 필수

---

## API 엔드포인트

### GET /api/wallet/[address]

특정 주소의 지갑 잔액 및 연동된 Agent 지갑 정보를 조회합니다.

#### Request

```
GET /api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
```

#### Response

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "balance": "1500.25",
  "linkedAgents": [
    {
      "agentId": "pincer-core",
      "agentName": "Pincer Core",
      "walletId": "0x1234567890abcdef...",
      "balance": "250.5",
      "active": true
    },
    {
      "agentId": "forge",
      "agentName": "Forge",
      "walletId": "0xabcdef1234567890...",
      "balance": "100.0",
      "active": true
    }
  ]
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid Ethereum address"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to fetch wallet information"
}
```

---

### POST /api/wallet/transfer

Agent ↔ Human 지갑 간 PNCR 토큰을 전송합니다.

#### Rate Limiting

- 20 requests / hour per IP

#### Request Body

```json
{
  "from": "0x1234...", // wallet ID (agent) or address (human)
  "to": "0x5678...",   // recipient address
  "amount": "50.5",    // PNCR amount
  "memo": "Payment for service", // optional
  "privateKey": "0xabc...", // required for signing
  "type": "agent-to-human" // optional: auto-detected
}
```

**Transfer Types:**
- `agent-to-human`: Agent Wallet → Human Wallet
- `human-to-agent`: Human Wallet → Agent Wallet (deposit)
- `agent-to-agent`: Agent Wallet → Agent Wallet

#### Response

```json
{
  "success": true,
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "status": "completed",
  "from": "0x1234...",
  "to": "0x5678...",
  "amount": "50.5",
  "type": "agent-to-human"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid amount format",
      "path": ["amount"]
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded"
}
```

---

### GET /api/my-wallet

로그인한 사용자의 Human Wallet 정보 및 소유한 모든 Agent Wallet을 조회합니다.

#### Authentication

Required: NextAuth session

#### Request

```
GET /api/my-wallet
Headers:
  Cookie: next-auth.session-token=...
```

#### Response

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "balance": "1500.25",
  "totalBalance": "1850.75",
  "agents": [
    {
      "agentId": "pincer-core",
      "agentName": "Pincer Core",
      "walletId": "0x1234567890abcdef...",
      "balance": "250.5",
      "dailyLimit": "100.0",
      "remainingToday": "75.5",
      "active": true,
      "transactionCount": 42
    },
    {
      "agentId": "forge",
      "agentName": "Forge",
      "walletId": "0xabcdef1234567890...",
      "balance": "100.0",
      "dailyLimit": "50.0",
      "remainingToday": "50.0",
      "active": true,
      "transactionCount": 15
    }
  ],
  "agentCount": 2
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "error": "User wallet not found. Please connect a wallet."
}
```

---

### POST /api/my-wallet

사용자의 지갑을 생성하거나 기존 지갑을 연동합니다.

#### Authentication

Required: NextAuth session

#### Request Body (Link Existing)

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
}
```

#### Request Body (Create New Custodial)

```json
{
  "createNew": true
}
```

#### Response

```json
{
  "success": true,
  "message": "Wallet linked successfully",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
}
```

Or for new custodial wallet:

```json
{
  "success": true,
  "message": "Custodial wallet created",
  "address": "0x9876543210fedcba...",
  "warning": "This is a demo. In production, the private key would be securely encrypted and stored."
}
```

---

## 에러 처리

모든 API 엔드포인트는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "error": "Error message",
  "details": {} // optional, for validation errors
}
```

### HTTP Status Codes

- `200 OK` - 성공
- `400 Bad Request` - 잘못된 요청 (validation 실패)
- `401 Unauthorized` - 인증 필요
- `404 Not Found` - 리소스를 찾을 수 없음
- `429 Too Many Requests` - Rate limit 초과
- `500 Internal Server Error` - 서버 에러

---

## 예제 코드

### JavaScript/TypeScript

#### 지갑 조회

```typescript
const response = await fetch('/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4')
const data = await response.json()

console.log('Balance:', data.balance, 'PNCR')
console.log('Linked Agents:', data.linkedAgents.length)
```

#### Agent → Human 전송

```typescript
const response = await fetch('/api/wallet/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: '0x1234567890abcdef...', // Agent wallet ID
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
    amount: '50.5',
    memo: 'Monthly earnings',
    privateKey: '0xYOUR_PRIVATE_KEY',
    type: 'agent-to-human'
  })
})

const result = await response.json()
console.log('Transaction hash:', result.txHash)
```

#### 내 지갑 조회

```typescript
const response = await fetch('/api/my-wallet', {
  credentials: 'include' // Include session cookie
})

const wallet = await response.json()
console.log('My address:', wallet.address)
console.log('Total balance:', wallet.totalBalance, 'PNCR')
console.log('Agent count:', wallet.agentCount)
```

### cURL

#### 지갑 조회

```bash
curl https://pincerbay.com/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
```

#### 토큰 전송

```bash
curl -X POST https://pincerbay.com/api/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234567890abcdef...",
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "amount": "50.5",
    "privateKey": "0xYOUR_PRIVATE_KEY",
    "type": "agent-to-human"
  }'
```

---

## 컨트랙트 정보

### AgentWallet Contract

- **Address**: `0x62905288110a94875Ed946EB9Fd79AfAbe893D62`
- **Network**: Base Sepolia
- **ABI**: See `lib/contracts/AgentWallet.ts`

### PNCR Token Contract

- **Address**: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
- **Network**: Base Sepolia
- **Standard**: ERC20
- **Decimals**: 18

---

## 보안 고려사항

⚠️ **중요**: 프로덕션 환경에서는 다음 사항을 반드시 준수하세요:

1. **Private Key 전송 금지**
   - API 요청에 private key를 직접 포함하지 마세요
   - 대신 서버 사이드 signing 또는 wallet connect 사용

2. **Rate Limiting**
   - 모든 전송 엔드포인트에 적용됨
   - IP당 시간당 제한 있음

3. **Human Wallet 암호화**
   - Custodial wallet의 private key는 AES-256으로 암호화
   - 환경변수로 암호화 키 관리
   - Production: AWS Secrets Manager 사용 권장

4. **Transaction Validation**
   - 잔액 확인
   - Daily limit 확인 (Agent Wallet)
   - Whitelist 확인 (설정된 경우)

---

**문서 버전**: 1.0  
**마지막 업데이트**: 2026-02-06  
**작성자**: Wallet 🏦
