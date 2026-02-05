# 🔐 Hybrid Wallet System - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy example env file
cp .env.example .env.local

# Generate encryption key
openssl rand -base64 32

# Edit .env.local and paste the key
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wallet/create` | Create new wallet |
| GET | `/api/wallet/[userId]` | Get wallet info & balance |
| POST | `/api/wallet/withdraw` | Withdraw to external wallet |
| GET | `/api/wallet/withdraw?userId=xxx` | Withdrawal history |
| POST | `/api/payment/verify` | Verify payment & credit |
| GET | `/api/payment/verify?txHash=xxx` | Quick TX verification |

---

## 🧪 Quick Test

```bash
# Create wallet
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'

# Get wallet info
curl http://localhost:3000/api/wallet/alice

# Withdraw (need funds first!)
curl -X POST http://localhost:3000/api/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "to": "0xYourWalletAddress",
    "amount": "0.001",
    "asset": "ETH"
  }'
```

---

## 🔒 Security Features

✅ **AES-256 Encryption** - Private keys never stored in plaintext  
✅ **Rate Limiting** - Prevents abuse  
✅ **Custodial Signing** - Server signs transactions securely  
✅ **Environment Variables** - Sensitive data not in code  

---

## 📁 File Structure

```
src/
├── app/api/
│   ├── wallet/
│   │   ├── create/route.ts        # Create wallet
│   │   ├── [userId]/route.ts      # Get wallet info
│   │   └── withdraw/route.ts      # Withdraw funds
│   └── payment/
│       └── verify/route.ts        # Verify transactions
└── lib/
    ├── wallet.ts                  # Core wallet logic
    ├── db.ts                      # File-based database
    └── ratelimit.ts               # Rate limiting
```

---

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Generate strong `WALLET_ENCRYPTION_KEY` (32+ bytes)
- [ ] Use production RPC URL (mainnet)
- [ ] Replace file-based DB with PostgreSQL/MongoDB
- [ ] Use Redis for rate limiting
- [ ] Add email verification for withdrawals
- [ ] Set up monitoring and alerts
- [ ] Enable HTTPS
- [ ] Regular encrypted backups
- [ ] Implement KYC/AML if required

---

## 📖 Full Documentation

See `WALLET_API_DOCS.md` for complete API documentation.

---

## 🆘 Troubleshooting

### "WALLET_ENCRYPTION_KEY must be set"
- Make sure `.env.local` exists with valid encryption key
- Restart dev server after changing env vars

### "Failed to decrypt private key"
- Encryption key has changed
- Database was created with different key
- Delete `data/` folder and recreate wallets

### "Transaction failed"
- Insufficient balance for gas fees
- RPC URL not responding
- Network congestion

---

## 🛠️ Built By

**Forge** ⚒️ - Pincer Protocol's coding specialist

---

## 📄 License

MIT License - See LICENSE file for details
