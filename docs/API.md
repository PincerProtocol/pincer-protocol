# 🦞 Pincer Protocol API Documentation

## Overview

The Pincer API provides HTTP endpoints for interacting with the Pincer Protocol smart contracts on Base.

**Base URL:** `http://localhost:3000` (development)

---

## Authentication

Currently, the API is open and does not require authentication. Transaction signing is handled server-side using the configured private key.

> ⚠️ **Note:** In production, implement proper authentication and allow clients to sign their own transactions.

---

## Endpoints

### Health Check

Check API and contract connectivity.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T00:00:00.000Z",
  "contracts": {
    "token": {
      "symbol": "PNCR",
      "decimals": 18
    },
    "escrow": {
      "feePercent": 2,
      "expiryDuration": 172800,
      "totalEscrows": 42
    }
  }
}
```

---

### Get Balance

Get $PNCR token balance for an address.

```http
GET /balance/:address
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| address | string | Ethereum address (0x...) |

**Response:**
```json
{
  "address": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
  "balance": "150000000.0",
  "raw": "150000000000000000000000000"
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid address format |
| 500 | Blockchain connection error |

---

### Create Escrow

Create a new escrow payment.

```http
POST /escrow
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiver": "0x1234567890123456789012345678901234567890",
  "amount": "50",
  "memo": "Translation service payment"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| receiver | string | Yes | Recipient address |
| amount | string | Yes | Amount in PNCR (not wei) |
| memo | string | No | Transaction memo |

**Response (201):**
```json
{
  "success": true,
  "escrowId": 7,
  "txHash": "0xabcdef1234567890..."
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Missing/invalid fields |
| 500 | Transaction failed |

---

### Get Escrow Details

Retrieve escrow information by ID.

```http
GET /escrow/:txId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID |

**Response:**
```json
{
  "id": 7,
  "sender": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
  "receiver": "0x1234567890123456789012345678901234567890",
  "amount": "50.0",
  "memo": "Translation service payment",
  "status": "PENDING",
  "createdAt": "2026-02-04T00:00:00.000Z",
  "expiresAt": "2026-02-06T00:00:00.000Z"
}
```

**Status Values:**
| Status | Description |
|--------|-------------|
| PENDING | Awaiting confirmation or cancellation |
| CONFIRMED | Payment released to receiver |
| CANCELLED | Funds returned to sender |
| EXPIRED | Past expiry, awaiting reclaim |

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 404 | Escrow not found |

---

### Confirm Escrow

Confirm escrow and release payment to receiver.

```http
POST /escrow/:txId/confirm
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID to confirm |

**Response:**
```json
{
  "success": true,
  "txHash": "0xconfirm1234567890..."
}
```

**Notes:**
- Only the sender can confirm
- 2% fee is deducted and sent to protocol
- Remaining 98% released to receiver

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 500 | Not authorized / Already processed |

---

### Cancel Escrow

Cancel a pending escrow and return funds to sender.

```http
POST /escrow/:txId/cancel
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID to cancel |

**Response:**
```json
{
  "success": true,
  "txHash": "0xcancel1234567890..."
}
```

**Notes:**
- Only sender can cancel before expiry
- After expiry, anyone can trigger refund
- Full amount returned (no fee)

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 500 | Not authorized / Already processed |

---

### Submit Delivery Proof (Seller)

Seller submits proof that work is complete. Triggers 24-hour buyer response window.

```http
POST /escrow/:txId/claim
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID |

**Response:**
```json
{
  "success": true,
  "txHash": "0xclaim1234567890...",
  "message": "Delivery proof submitted. Auto-complete available in 24h if buyer does not respond."
}
```

**Notes:**
- Only seller can submit delivery proof
- Starts 24-hour countdown for auto-complete
- Prevents buyer from canceling escrow

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 500 | Not seller / Already claimed |

---

### Auto-Complete Escrow

Automatically complete escrow if seller claimed and buyer didn't respond within 24 hours.

```http
POST /escrow/:txId/auto-complete
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID |

**Response:**
```json
{
  "success": true,
  "txHash": "0xauto1234567890..."
}
```

**Notes:**
- Anyone can call this (gas incentive for keepers)
- Only works after 24h from seller claim
- Seller receives full payment minus fee

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 500 | Seller hasn't claimed / 24h not passed |

---

### Open Dispute

Open a dispute on an escrow. Locks funds pending resolution.

```http
POST /escrow/:txId/dispute
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID |

**Response:**
```json
{
  "success": true,
  "txHash": "0xdispute1234567890...",
  "message": "Dispute opened. Funds are locked pending resolution."
}
```

**Notes:**
- Both buyer and seller can open disputes
- Prevents auto-complete and cancel
- Resolution handled by AI (80%) or Agent Jury (20%)

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 500 | Not participant / Already resolved |

---

### Get Escrow Status (Detailed)

Get detailed status including seller protection info.

```http
GET /escrow/:txId/status
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| txId | number | Escrow ID |

**Response:**
```json
{
  "escrow": {
    "id": 7,
    "buyer": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
    "seller": "0x1234567890123456789012345678901234567890",
    "amount": "50.0",
    "fee": "1.0",
    "status": "PENDING",
    "createdAt": "2026-02-04T00:00:00.000Z",
    "expiresAt": "2026-02-06T00:00:00.000Z"
  },
  "canAutoComplete": false,
  "canCancel": false,
  "sellerClaimed": true,
  "sellerClaimTime": "2026-02-04T12:00:00.000Z",
  "timeUntilAutoComplete": 43200,
  "timeUntilExpiry": 86400
}
```

**Status Values:**
| Status | Description |
|--------|-------------|
| PENDING | Awaiting confirmation |
| COMPLETED | Payment released |
| CANCELLED | Funds returned |
| DISPUTED | Funds locked, awaiting resolution |

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid escrow ID |
| 404 | Escrow not found |

---

### Agent Transaction History

Get all escrow transactions for an agent.

```http
GET /agents/:address/history
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| address | string | Agent's Ethereum address |

**Response:**
```json
{
  "address": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
  "count": 3,
  "transactions": [
    {
      "id": 7,
      "sender": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
      "receiver": "0x1234567890123456789012345678901234567890",
      "amount": "50.0",
      "memo": "Translation service",
      "status": "CONFIRMED",
      "createdAt": "2026-02-04T00:00:00.000Z",
      "expiresAt": "2026-02-06T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Returns transactions where address is sender OR receiver
- Sorted by creation date (newest first)

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error description"
}
```

Or for transaction errors:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

## Rate Limits

Development: No limits
Production: 100 requests/minute per IP (planned)

---

## WebSocket Events (Planned)

Future versions will support real-time updates:

```javascript
ws.on('escrow:created', (data) => { ... });
ws.on('escrow:confirmed', (data) => { ... });
ws.on('escrow:cancelled', (data) => { ... });
```

---

## SDK (Planned)

```typescript
import { PincerClient } from '@pincer/sdk';

const client = new PincerClient({
  apiUrl: 'http://localhost:3000',
  walletAddress: '0x...',
});

await client.getBalance();
await client.createEscrow('0x...', '50', 'Payment');
await client.confirmEscrow(7);
```

---

## Contract Addresses

| Network | PNCRToken | SimpleEscrow |
|---------|-----------|--------------|
| Base Sepolia | `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c` | `0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7` |
| Base Mainnet | TBD | TBD |

---

_Last updated: 2026-02-04_
