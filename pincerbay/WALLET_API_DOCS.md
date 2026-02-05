# Hybrid Wallet System API Documentation

## Overview

This is a custodial hybrid wallet system that allows users to:
1. Create temporary wallets for easy onboarding
2. Receive and store PNCR tokens and ETH
3. Withdraw to their own external wallets
4. Verify payment transactions

## Security Features

- ✅ Private keys encrypted with AES-256
- ✅ Encryption key stored in environment variables
- ✅ Rate limiting on all endpoints
- ✅ Never exposes private keys in responses
- ✅ Server-side transaction signing (custodial)

## API Endpoints

### 1. Create Wallet

**POST** `/api/wallet/create`

Create a new temporary custodial wallet for a user.

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "createdAt": 1707147600000
  }
}
```

**Rate Limit:** 5 requests per hour per user

---

### 2. Get Wallet Info

**GET** `/api/wallet/[userId]`

Get wallet information, balances, and transaction history.

**Parameters:**
- `userId` (path parameter): User identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "createdAt": 1707147600000,
    "balances": {
      "ETH": "0.5",
      "PNCR": "1000.0"
    },
    "transactions": []
  }
}
```

**Rate Limit:** 30 requests per minute per user

---

### 3. Withdraw Funds

**POST** `/api/wallet/withdraw`

Withdraw ETH or PNCR tokens from custodial wallet to external wallet.

**Request Body:**
```json
{
  "userId": "user123",
  "to": "0x...",
  "amount": "10.5",
  "asset": "PNCR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "wd_1707147600000_abc123",
    "txHash": "0x...",
    "to": "0x...",
    "amount": "10.5",
    "asset": "PNCR",
    "status": "completed"
  }
}
```

**Rate Limit:** 10 requests per hour per user

---

**GET** `/api/wallet/withdraw?userId=xxx`

Get withdrawal history for a user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wd_1707147600000_abc123",
      "userId": "user123",
      "to": "0x...",
      "amount": "10.5",
      "asset": "PNCR",
      "status": "completed",
      "txHash": "0x...",
      "createdAt": 1707147600000,
      "completedAt": 1707147650000
    }
  ]
}
```

---

### 4. Verify Payment

**POST** `/api/payment/verify`

Verify an incoming payment transaction and credit PNCR tokens.

**Request Body:**
```json
{
  "userId": "user123",
  "txHash": "0x...",
  "expectedAmount": "100.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "txHash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "100.0",
    "blockNumber": 12345678,
    "message": "Payment verified successfully"
  }
}
```

**Rate Limit:** 20 requests per minute per user

---

**GET** `/api/payment/verify?txHash=xxx`

Quick transaction verification (no credit, read-only).

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "from": "0x...",
    "to": "0x...",
    "value": "100.0",
    "blockNumber": 12345678
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found (wallet or transaction not found)
- `409` - Conflict (wallet already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ethers@6 crypto-js @types/crypto-js
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

**Required:**
- `WALLET_ENCRYPTION_KEY` - Strong random string for encrypting private keys
- `NEXT_PUBLIC_RPC_URL` - Ethereum RPC endpoint (Alchemy, Infura, etc.)
- `NEXT_PUBLIC_PNCR_CONTRACT_ADDRESS` - PNCR token contract address

**Generate encryption key:**
```bash
openssl rand -base64 32
```

### 3. Start Development Server

```bash
npm run dev
```

---

## Production Deployment Checklist

- [ ] Use strong `WALLET_ENCRYPTION_KEY` (32+ bytes)
- [ ] Use mainnet RPC URL
- [ ] Deploy PNCR contract and update address
- [ ] Replace file-based DB with PostgreSQL/MongoDB
- [ ] Replace in-memory rate limiting with Redis
- [ ] Add email verification for withdrawals
- [ ] Implement transaction history indexer (Etherscan API)
- [ ] Add comprehensive logging and monitoring
- [ ] Set up backup for encrypted wallets
- [ ] Implement withdrawal limits and KYC if needed
- [ ] Add HTTPS and proper CORS configuration
- [ ] Enable database encryption at rest
- [ ] Set up automated key rotation

---

## Database Schema (File-based)

### wallets.json
```json
{
  "user123": {
    "userId": "user123",
    "address": "0x...",
    "encryptedPrivateKey": "U2FsdGVkX1...",
    "createdAt": 1707147600000
  }
}
```

### withdrawals.json
```json
[
  {
    "id": "wd_1707147600000_abc123",
    "userId": "user123",
    "to": "0x...",
    "amount": "10.5",
    "asset": "PNCR",
    "status": "completed",
    "txHash": "0x...",
    "createdAt": 1707147600000,
    "completedAt": 1707147650000
  }
]
```

---

## Security Best Practices

1. **Key Management**
   - Store `WALLET_ENCRYPTION_KEY` in secure vault (AWS Secrets Manager, HashiCorp Vault)
   - Never commit encryption keys to git
   - Rotate keys periodically

2. **Rate Limiting**
   - Implement at API gateway level
   - Use Redis for distributed rate limiting in production

3. **Monitoring**
   - Log all withdrawal attempts
   - Alert on suspicious activity
   - Monitor for unusual transaction patterns

4. **Backups**
   - Regular encrypted backups of wallet database
   - Test restoration procedures
   - Store backups in secure, separate location

5. **Compliance**
   - Consider KYC/AML requirements for your jurisdiction
   - Implement transaction limits if needed
   - Maintain audit logs

---

## Testing

### Test Wallet Creation
```bash
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-1"}'
```

### Test Wallet Retrieval
```bash
curl http://localhost:3000/api/wallet/test-user-1
```

### Test Withdrawal
```bash
curl -X POST http://localhost:3000/api/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "amount": "0.001",
    "asset": "ETH"
  }'
```

---

## Support

For issues or questions, contact the Pincer Protocol team.

**Built with ⚒️ by Forge**
