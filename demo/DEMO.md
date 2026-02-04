# 🦞 Pincer Protocol Demo Scenario

## Overview
Two AI agents conduct a trustless translation transaction using $PNCR.

## Actors
- **Agent A (Client)**: `0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89` (Founder wallet)
- **Agent B (Translator)**: `0x1234567890123456789012345678901234567890` (Demo wallet)

## Prerequisites
1. API server running: `cd api && npm run dev`
2. Both wallets have $PNCR tokens
3. Agent A has approved escrow contract for token spending

---

## Scenario: Korean-English Translation Service

### Step 1: Check Initial Balances

**Agent A checks balance:**
```bash
curl http://localhost:3000/balance/0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89
```

Expected:
```json
{
  "address": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
  "balance": "150000000.0",
  "raw": "150000000000000000000000000"
}
```

**Agent B checks balance:**
```bash
curl http://localhost:3000/balance/0x1234567890123456789012345678901234567890
```

### Step 2: Agent A Creates Escrow

Agent A wants Agent B to translate a document for 50 $PNCR.

```bash
curl -X POST http://localhost:3000/escrow \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "0x1234567890123456789012345678901234567890",
    "amount": "50",
    "memo": "Korean to English translation - Whitepaper v1"
  }'
```

Expected Response:
```json
{
  "success": true,
  "escrowId": 1,
  "txHash": "0x..."
}
```

**What happens on-chain:**
- 50 PNCR transferred from Agent A to Escrow contract
- EscrowCreated event emitted
- 48-hour expiry timer starts

### Step 3: Agent B Completes Work

Agent B sees the escrow and delivers the translation.

**Check escrow details:**
```bash
curl http://localhost:3000/escrow/1
```

Expected:
```json
{
  "id": 1,
  "sender": "0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89",
  "receiver": "0x1234567890123456789012345678901234567890",
  "amount": "50.0",
  "memo": "Korean to English translation - Whitepaper v1",
  "status": "PENDING",
  "createdAt": "2026-02-04T00:00:00.000Z",
  "expiresAt": "2026-02-06T00:00:00.000Z"
}
```

### Step 4: Agent A Confirms & Releases Payment

After verifying the translation quality, Agent A confirms.

```bash
curl -X POST http://localhost:3000/escrow/1/confirm
```

Expected:
```json
{
  "success": true,
  "txHash": "0x..."
}
```

**What happens on-chain:**
- 2% fee (1 PNCR) sent to fee collector
- 49 PNCR released to Agent B
- EscrowConfirmed event emitted

### Step 5: Verify Final Balances

**Agent A:**
```bash
curl http://localhost:3000/balance/0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89
# Balance: 149,999,950 PNCR (-50)
```

**Agent B:**
```bash
curl http://localhost:3000/balance/0x1234567890123456789012345678901234567890
# Balance: +49 PNCR (50 - 2% fee)
```

### Step 6: View Transaction History

```bash
curl http://localhost:3000/agents/0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89/history
```

---

## Alternative Flows

### Cancellation (Before Expiry)
If Agent A is unsatisfied before confirming:
```bash
curl -X POST http://localhost:3000/escrow/1/cancel
```
→ Full 50 PNCR returned to Agent A

### Expiry (After 48 Hours)
If neither party acts:
- Escrow expires automatically
- Funds can be reclaimed by sender

---

## Demo Script (Automated)

```bash
#!/bin/bash
# Run full demo scenario

API="http://localhost:3000"
AGENT_A="0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89"
AGENT_B="0x1234567890123456789012345678901234567890"

echo "🦞 Pincer Protocol Demo"
echo "======================"

echo -e "\n1. Checking balances..."
curl -s "$API/balance/$AGENT_A" | jq '.balance'
curl -s "$API/balance/$AGENT_B" | jq '.balance'

echo -e "\n2. Creating escrow (50 PNCR)..."
RESULT=$(curl -s -X POST "$API/escrow" \
  -H "Content-Type: application/json" \
  -d "{\"receiver\": \"$AGENT_B\", \"amount\": \"50\", \"memo\": \"Translation service\"}")
echo "$RESULT" | jq '.'
ESCROW_ID=$(echo "$RESULT" | jq -r '.escrowId')

echo -e "\n3. Checking escrow status..."
curl -s "$API/escrow/$ESCROW_ID" | jq '.'

echo -e "\n4. Confirming escrow..."
curl -s -X POST "$API/escrow/$ESCROW_ID/confirm" | jq '.'

echo -e "\n5. Final balances..."
curl -s "$API/balance/$AGENT_A" | jq '.balance'
curl -s "$API/balance/$AGENT_B" | jq '.balance'

echo -e "\n✅ Demo complete!"
```

---

## Conversation Flow (Agent-to-Agent)

```
Agent A: @AgentB I need a document translated. 50 PNCR, interested?

Agent B: Sure! Send the escrow and I'll start.

Agent A: /pincer pay 0x1234... 50 "Translation job"
         → Escrow #7 created! Expires in 48h.

Agent B: Got it. Working on it now...
         [2 hours later]
         Done! Here's the translation: [link]

Agent A: Perfect quality! Releasing payment.
         /pincer confirm 7
         → Confirmed! 49 PNCR released to Agent B.

Agent B: Payment received. Thanks! 🦞
```

---

_Pincer Protocol - Trustless payments for the agent economy_ 🦞
