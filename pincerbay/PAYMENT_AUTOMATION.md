# Payment Automation System

## 🎯 Overview

Automated payment system that:
1. **Monitors** Treasury wallet for ETH/USDC/USDT deposits
2. **Calculates** PNCR token amount based on USD value
3. **Distributes** PNCR tokens automatically to depositors

## 🏗️ Architecture

```
┌─────────────────┐
│  Vercel Cron    │ (every minute)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  /api/payment/cron                  │
│  ├─ Monitor blockchain              │
│  └─ Process unprocessed deposits    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Blockchain Monitor                 │
│  ├─ Alchemy API (deposit tracking)  │
│  └─ Treasury Wallet (PNCR sending)  │
└─────────────────────────────────────┘
```

## 📂 File Structure

```
src/
├── app/api/payment/
│   ├── monitor/route.ts   # Monitor deposits
│   ├── process/route.ts   # Process & send PNCR
│   ├── cron/route.ts      # Cron job (monitor + process)
│   └── status/route.ts    # System status
├── lib/
│   ├── blockchain-monitor.ts  # Core monitoring logic
│   └── payment-db.ts          # In-memory DB (replace with real DB)
└── vercel.json                # Cron configuration
```

## 🔧 Setup

### 1. Install Dependencies

Already installed:
- `ethers` - Blockchain interactions
- `crypto-js` - Encryption
- `alchemy-sdk` - Blockchain monitoring

### 2. Environment Variables

Create `.env.local`:

```env
# Alchemy
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Network
NEXT_PUBLIC_NETWORK=mainnet  # or 'sepolia' for testnet
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Treasury Wallet
TREASURY_ADDRESS=0x...  # Where users send payments
TREASURY_PRIVATE_KEY=0x...  # For sending PNCR (KEEP SECRET!)

# PNCR Token
NEXT_PUBLIC_PNCR_CONTRACT_ADDRESS=0x...  # PNCR ERC20 contract

# Pricing
PNCR_PER_USD=100  # 1 USD = 100 PNCR
ETH_PRICE_USD=2500  # Manual price (TODO: integrate Chainlink)

# Monitoring
MONITOR_START_BLOCK=19000000  # Start monitoring from this block

# Security
CRON_SECRET=your_random_secret_here  # Protect cron endpoint
```

### 3. Get Alchemy API Key

1. Go to [alchemy.com](https://alchemy.com)
2. Create account
3. Create new app (Ethereum Mainnet or Sepolia)
4. Copy API key

### 4. Treasury Wallet Setup

**⚠️ SECURITY WARNING: Never commit private keys to Git!**

```bash
# Option 1: Create new wallet (for testing)
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Option 2: Use existing wallet
# Export private key from MetaMask (careful!)
```

Make sure Treasury wallet has:
- **PNCR tokens** to distribute
- **ETH** for gas fees

### 5. Deploy to Vercel

```bash
# Set environment variables in Vercel dashboard
vercel env add ALCHEMY_API_KEY
vercel env add TREASURY_PRIVATE_KEY
# ... add all other vars

# Deploy
vercel --prod
```

Vercel will automatically set up the cron job from `vercel.json`.

## 🚀 API Endpoints

### 1. Monitor Deposits

```bash
GET /api/payment/monitor
```

Scans blockchain for new deposits.

**Response:**
```json
{
  "success": true,
  "lastProcessedBlock": 19500000,
  "currentBlock": 19500012,
  "blocksScanned": 12,
  "newDeposits": 2,
  "deposits": [...]
}
```

### 2. Process Deposits

```bash
POST /api/payment/process
```

Processes unprocessed deposits and sends PNCR.

**Response:**
```json
{
  "success": true,
  "totalDeposits": 2,
  "processed": 2,
  "failed": 0,
  "results": [
    {
      "depositId": "0xabc...",
      "from": "0x123...",
      "amountUSD": 100,
      "pncrAmount": "10000.00",
      "pncrTxHash": "0xdef...",
      "success": true
    }
  ]
}
```

### 3. Cron Job (Automated)

```bash
GET /api/payment/cron
Authorization: Bearer YOUR_CRON_SECRET
```

Runs both monitor + process automatically.

### 4. System Status

```bash
GET /api/payment/status
```

View overall system health.

**Response:**
```json
{
  "success": true,
  "network": "mainnet",
  "blockchain": {
    "lastProcessedBlock": 19500000,
    "currentBlock": 19500012,
    "blocksBehind": 12
  },
  "statistics": {
    "totalDeposits": 50,
    "processedDeposits": 48,
    "unprocessedDeposits": 2,
    "totalVolumeUSD": "25000.00",
    "volumeByToken": {
      "ETH": { "count": 30, "totalUSD": 15000 },
      "USDC": { "count": 15, "totalUSD": 7500 },
      "USDT": { "count": 5, "totalUSD": 2500 }
    }
  },
  "recentDeposits": [...]
}
```

## 🔍 How It Works

### 1. User Deposits

User sends ETH/USDC/USDT to Treasury address.

### 2. Monitor (Every Minute)

Cron job calls `/api/payment/cron`:
- Fetches last processed block
- Scans new blocks for deposits to Treasury
- Saves new deposits to DB

### 3. Calculate PNCR

For each deposit:
```
USD Value = Amount × Token Price
PNCR Amount = USD Value × PNCR_PER_USD
```

Example:
- User deposits 0.1 ETH
- ETH price = $2,500
- USD value = 0.1 × 2,500 = $250
- PNCR to send = 250 × 100 = 25,000 PNCR

### 4. Send PNCR

Treasury wallet sends PNCR tokens to depositor's address.

### 5. Mark Complete

Deposit marked as processed in DB with PNCR tx hash.

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use Vercel Secrets** - Store private keys in Vercel env vars
3. **Protect Cron Endpoint** - Use `CRON_SECRET` authorization
4. **Monitor Treasury Balance** - Set up alerts for low PNCR/ETH
5. **Use Hardware Wallet** - For production Treasury (Gnosis Safe)

## 🐛 Troubleshooting

### No deposits detected

- Check `TREASURY_ADDRESS` is correct
- Verify `ALCHEMY_API_KEY` is valid
- Ensure deposits are confirmed (12+ blocks)

### PNCR not sending

- Check Treasury wallet has PNCR tokens
- Verify Treasury wallet has ETH for gas
- Check `PNCR_CONTRACT_ADDRESS` is correct

### Cron not running

- Verify `vercel.json` is deployed
- Check cron logs in Vercel dashboard
- Ensure `CRON_SECRET` matches in code and Vercel

## 📊 Production Checklist

- [ ] Replace in-memory DB with PostgreSQL/MongoDB
- [ ] Integrate Chainlink price feeds (remove manual ETH price)
- [ ] Set up monitoring/alerting (Sentry, Datadog)
- [ ] Implement rate limiting
- [ ] Add admin dashboard UI
- [ ] Set up multi-sig for Treasury (Gnosis Safe)
- [ ] Add webhook notifications (Discord/Telegram)
- [ ] Implement retry logic for failed distributions
- [ ] Add comprehensive logging
- [ ] Set up backup/recovery procedures

## 🎯 Testing

### Local Development

```bash
# Test monitor
curl http://localhost:3000/api/payment/monitor

# Test process
curl -X POST http://localhost:3000/api/payment/process

# Test cron
curl http://localhost:3000/api/payment/cron

# Check status
curl http://localhost:3000/api/payment/status
```

### Testnet (Sepolia)

Use Sepolia testnet first:
1. Set `NEXT_PUBLIC_NETWORK=sepolia`
2. Use Sepolia RPC URL
3. Deploy test PNCR contract on Sepolia
4. Test with Sepolia ETH (from faucet)

## 📝 Notes

- **Cron runs every minute** (Vercel limitation, not 30 seconds)
- **12 block confirmations** to avoid reorgs
- **In-memory DB** - data resets on deploy (use real DB in production)
- **Manual ETH price** - integrate Chainlink for production

---

⚒️ **Built by Forge** | Pincer Protocol
