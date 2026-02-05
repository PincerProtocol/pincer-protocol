# 🛡️ Production Deployment Security Checklist

**Last Updated:** 2026-02-05  
**Status:** Pre-Production Review

---

## ✅ **Environment Variables (Vercel/Production)**

Before deploying, ensure these are set in Vercel dashboard:

### Required Variables
- [ ] `WALLET_ENCRYPTION_KEY` - **CRITICAL** (32+ characters, random)
  - Generate: `openssl rand -base64 48`
  - Never use default/dev key in production

- [ ] `NEXT_PUBLIC_RPC_URL` - **CRITICAL**
  - Use mainnet Alchemy/Infura endpoint
  - Example: `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`

- [ ] `NEXT_PUBLIC_PNCR_CONTRACT_ADDRESS` - **CRITICAL**
  - Verify this is MAINNET address
  - Current in code: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
  - ⚠️ **CONFIRM THIS IS MAINNET ADDRESS**

### Optional Variables
- [ ] `ALLOWED_ORIGINS` - Comma-separated domains
  - Example: `https://pincerbay.com,https://www.pincerbay.com`

- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - Get from: https://cloud.walletconnect.com/

---

## ✅ **Contract Addresses Verification**

**Location:** `src/lib/wagmi.ts`

Verify ALL contract addresses are MAINNET:

- [ ] `PNCR_TOKEN`: `0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c`
- [ ] `ESCROW`: `0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7`
- [ ] `STAKING`: `0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79`
- [ ] `REPUTATION`: `0xeF825139C3B17265E867864627f85720Ab6dB9e0`
- [ ] `AGENT_WALLET`: `0x62905288110a94875Ed946EB9Fd79AfAbe893D62`
- [ ] `TREASURY`: `0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb` (**Gnosis Safe**)

**Action Required:**
1. Check each address on Etherscan/Basescan
2. Verify contract ownership
3. Confirm Treasury is correct Gnosis Safe address

---

## ✅ **Security Features Applied**

- [x] Rate limiting on all API endpoints
- [x] Input validation (address, amount, type checks)
- [x] Private key encryption (AES-256)
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] CORS policy configured
- [x] Error sanitization in production
- [x] No `.env` files in git
- [x] Dependencies audit passed (0 vulnerabilities)

---

## ✅ **Pre-Deployment Tests**

- [ ] Test wallet creation with production RPC
- [ ] Test withdrawal flow with small amounts
- [ ] Verify payment verification works
- [ ] Test rate limiting triggers correctly
- [ ] Check error messages don't leak sensitive data
- [ ] Confirm Treasury receives payments
- [ ] Test on Vercel preview deployment first

---

## ✅ **Post-Deployment Monitoring**

- [ ] Set up Vercel Analytics
- [ ] Monitor error logs (Vercel dashboard)
- [ ] Track API response times
- [ ] Watch for rate limit triggers
- [ ] Monitor Treasury balance
- [ ] Set up alerts for failed transactions

---

## 🚨 **Critical Reminders**

1. **NEVER** commit `.env` files
2. **ALWAYS** use environment variables in Vercel
3. **VERIFY** contract addresses before launch
4. **TEST** on preview deployment first
5. **MONITOR** production logs actively
6. **BACKUP** wallet database regularly (once in production DB)

---

## 📞 **Emergency Contacts**

If security issues detected:
1. Pause deployments immediately
2. Alert team in Telegram
3. Check Vercel logs
4. Review contract interactions on Etherscan

---

**Auditor:** Sentinel 🛡️  
**Team:** Pincer Protocol  
**Next Review:** Post-production (24h after launch)
