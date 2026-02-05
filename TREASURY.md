# 🏦 Treasury Management Guide

## Overview

Treasury Address: `0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89`

## Balance Check Script

### Usage

```bash
npx hardhat run scripts/balance-check.js --network base
```

### What it does
- Queries ETH balance
- Queries PNCR token balance
- Displays formatted output with timestamp

### Example Output
```
🏦 Treasury Balance Check
========================
Network: base
Treasury Address: 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89
Timestamp: 2026-02-05T06:53:00.000Z

💰 ETH Balance:
   0.5 ETH

🦞 PNCR Balance:
   1000000.0 PNCR

========================
Summary:
  ETH:   0.5
  PNCR:  1000000.0
========================
```

## Daily Logging

### Location
- Template: `treasury-log-template.md`
- Daily logs: `treasury-logs/YYYY-MM-DD.md`

### Workflow

1. **Morning Check**
   ```bash
   npx hardhat run scripts/balance-check.js --network base
   ```

2. **Record Balances**
   - Copy balance output to today's log
   - Update the Daily Balance Summary table

3. **Monitor Transactions**
   - Check for any inbound/outbound transactions
   - Record in the appropriate table with:
     - Timestamp (UTC+9)
     - Address
     - Asset & Amount
     - Transaction hash
     - Notes/purpose

4. **End of Day**
   - Complete the Daily Checklist
   - Calculate gas fees spent
   - Add any observations
   - Submit for review

### Security Checklist

- [ ] Verify all transaction addresses
- [ ] Check for unexpected balance changes
- [ ] Alert on large transfers (>10% of balance)
- [ ] Monitor gas prices for anomalies
- [ ] Report suspicious activity immediately

## Emergency Contacts

- 🦞 **Pincer** - Protocol Lead (escalation)
- 🛡️ **Sentinel** - Security Lead (security issues)
- ⚒️ **Forge** - Dev Lead (technical issues)

---

**Maintained by:** 🏦 Wallet Agent  
**Last Updated:** 2026-02-05
