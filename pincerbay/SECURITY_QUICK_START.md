# 🚀 Security Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies ✅ (Already Done)
```bash
cd pincerbay
npm install  # All security packages already installed
```

### 2. Environment Setup (Required)
```bash
# Copy example
cp .env.example .env

# Generate secret
openssl rand -base64 32

# Edit .env
NEXTAUTH_SECRET=<paste-generated-secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development
```bash
npm run dev
```

### 4. Test Security (Optional)
```bash
# In another terminal
npm run security:test
```

---

## What's Protected?

### ✅ Automatically Secured
- All API routes have security headers
- Rate limiting on configured routes
- Input validation on POST requests
- Request/error logging

### 🔐 Authentication Required
- `/api/souls/[id]/purchase` - Must have wallet session
- Add more routes in `lib/auth.ts`

### 📊 Monitored
- All requests logged to `logs/combined.log`
- Errors logged to `logs/error.log`
- Security events in `logs/security.log`

---

## Common Tasks

### Add Authentication to API Route
```typescript
import { requireAuth, isSessionValid } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await requireAuth(req)
  if (!isSessionValid(session)) return session
  
  const wallet = session.user.address // Use this, never req.body.wallet!
  // ... your logic
}
```

### Add Rate Limiting
```typescript
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const rateLimitResult = await checkRateLimit(getIdentifier(req))
  if (rateLimitResult) return rateLimitResult
  
  // ... your logic
}
```

### Validate Input
```typescript
import { validateInput, PurchaseSoulSchema } from '@/lib/validations'

export async function POST(req: Request) {
  const body = await req.json()
  const validation = validateInput(PurchaseSoulSchema, body)
  
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  
  const safeData = validation.data
  // ... use safeData
}
```

### Log Events
```typescript
import { logger, logApiRequest, logSecurityEvent } from '@/lib/logger'

// Log API request
logApiRequest("POST", "/api/endpoint", ip, userAgent)

// Log security event
logSecurityEvent("suspicious_activity", { ip, details: "..." })

// Log error
logger.error("Something failed", { context: "..." })
```

---

## Production Checklist

### Must Have
- [ ] `NEXTAUTH_SECRET` set (generate with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `NODE_ENV=production`

### Recommended
- [ ] Upstash Redis for rate limiting
  - Sign up: https://upstash.com
  - Set `UPSTASH_REDIS_REST_URL`
  - Set `UPSTASH_REDIS_REST_TOKEN`

### Optional
- [ ] Sentry for error monitoring
  - Sign up: https://sentry.io
  - Set `NEXT_PUBLIC_SENTRY_DSN`

---

## File Reference

### Security Core
- `lib/auth.ts` - Authentication middleware
- `lib/ratelimit.ts` - Rate limiting
- `lib/validations.ts` - Input validation (Zod)
- `lib/logger.ts` - Logging (Winston)
- `middleware.ts` - Security headers + CORS

### Config
- `app/api/auth/[...nextauth]/route.ts` - NextAuth setup
- `.env.example` - Environment template
- `types/next-auth.d.ts` - TypeScript types

### Docs
- `SECURITY.md` - Complete security guide
- `SECURITY_CHECKLIST.md` - Implementation checklist
- `PHASE1_COMPLETE_REPORT.md` - Completion report
- `SECURITY_QUICK_START.md` - This file

### Scripts
- `scripts/test-security.sh` - Security test suite
- `npm run security:test` - Run tests
- `npm run logs:view` - View logs

---

## Troubleshooting

### "Unauthorized" on all requests
**Problem:** NextAuth session not configured
**Solution:** Check `.env` has `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Rate limiting not working
**Problem:** Upstash not configured
**Solution:** 
- Development: It's OK, falls back to allowing all requests
- Production: Must set Upstash credentials in `.env`

### TypeScript errors
**Problem:** Type definitions not found
**Solution:** Run `npm install` again

### Logs not appearing
**Problem:** Log directory not created
**Solution:** `mkdir logs` in project root

---

## Next Steps

1. **Frontend Integration**
   - Add wallet connection
   - Implement signature flow
   - Use NextAuth `signIn()`

2. **Test Everything**
   - Try purchasing without auth (should fail)
   - Spam requests (should rate limit)
   - Check logs are being written

3. **Deploy**
   - Set production env vars
   - Deploy to Vercel/similar
   - Monitor logs

---

## Support

**Questions?** Check `SECURITY.md` for detailed docs

**Issues?** Check logs:
```bash
npm run logs:view      # All logs
npm run logs:errors    # Errors only
npm run logs:security  # Security events
```

**Need help?** Contact Forge ⚒️

---

_Last updated: 2026-02-06_
