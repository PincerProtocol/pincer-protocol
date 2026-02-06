# 🛡️ PincerBay Security Checklist

## Current Status: 65% → Target: 90%

### ✅ Completed
- [x] Edge Runtime 호환 미들웨어 (2026-02-06)
- [x] Input validation (Zod schemas)
- [x] CORS 설정
- [x] Security headers (CSP, XSS, etc.)
- [x] Rate limiting 구조 (lib/ratelimit.ts)
- [x] API key validation 구조 (lib/auth.ts)

### 🟡 환경변수 필요 (Vercel 설정)
| 변수 | 용도 | 필수 |
|------|------|------|
| `NEXTAUTH_SECRET` | 세션 암호화 | ✅ |
| `NEXTAUTH_URL` | OAuth 리다이렉트 | ✅ |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | 권장 |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | 권장 |
| `DATABASE_URL` | Supabase Postgres | ✅ |
| `API_KEY_SECRET` | API 키 서명 | ✅ |
| `AGENT_SIGNATURE_SECRET` | Agent 서명 | 권장 |

### 🔴 Critical (즉시 수정)
1. **NEXTAUTH_SECRET 미설정** - 세션 취약
2. **Contract Verification** - Basescan 검증 필요

### 🟠 High Priority
1. **Rate Limiting 비활성** - Upstash 미설정시 bypass
2. **privateKey 노출 위험** - wallet/transfer API에서 privateKey 파라미터 수신
3. **Prisma injection** - 일부 쿼리에서 raw input 사용

### 🟡 Medium Priority
1. **Error message leakage** - 상세 에러 노출
2. **Session expiry** - 기본값 사용 중
3. **API versioning** - 버전 없음

### ⚪ Low Priority
1. **Logging** - 구조화된 로깅 필요
2. **Monitoring** - Sentry/Datadog 연동
3. **Audit trail** - 트랜잭션 로그 개선

---

## 개선 계획

### Phase 1: 환경변수 (오늘)
```bash
# Vercel에서 설정
NEXTAUTH_SECRET=$(openssl rand -base64 32)
API_KEY_SECRET=$(openssl rand -base64 32)
```

### Phase 2: Rate Limiting (이번 주)
- Upstash Redis 계정 생성
- 환경변수 설정
- 테스트

### Phase 3: Wallet 보안 (다음 주)
- privateKey 제거 → Web3 서명으로 대체
- 트랜잭션 서명 플로우 개선

---

## 보안 점수 계산
- Critical 해결: +15점
- High 해결: +10점 (×3 = 30점)
- Medium 해결: +5점 (×3 = 15점)

**예상 점수**: 65% + 15% + 10% = **90%**

---
_Last Updated: 2026-02-07_
