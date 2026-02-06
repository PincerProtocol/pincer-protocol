# 🛡️ Security Setup Guide

**보안 미들웨어 강화 완료** - 2026-02-06

이 문서는 PincerBay의 강화된 보안 기능 설정 및 사용 가이드입니다.

---

## 📋 목차

1. [환경 변수 설정](#환경-변수-설정)
2. [API 인증 사용법](#api-인증-사용법)
3. [Rate Limiting](#rate-limiting)
4. [보안 헤더](#보안-헤더)
5. [모범 사례](#모범-사례)

---

## 1. 환경 변수 설정

### 필수 보안 환경 변수

`.env.local` 파일에 다음 변수들을 추가하세요:

```bash
# Agent 서명 검증 시크릿 (최소 32자)
AGENT_SIGNATURE_SECRET=your-long-random-string-here-min-32-characters

# API 키 시크릿 (최소 32자)
API_KEY_SECRET=another-long-random-string-here-min-32-characters

# 지갑 암호화 키 (64 hex characters = 32 bytes for AES-256)
WALLET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 시크릿 생성 방법

**Node.js로 안전한 랜덤 문자열 생성:**

```bash
# 32바이트 랜덤 문자열 (AGENT_SIGNATURE_SECRET, API_KEY_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 64바이트 hex 문자열 (WALLET_ENCRYPTION_KEY for AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 선택적 환경 변수

```bash
# 추가 CORS 허용 도메인 (콤마로 구분)
ALLOWED_ORIGINS=https://example.com,https://partner.com

# 내부 서비스 IP 주소 (콤마로 구분)
INTERNAL_IPS=127.0.0.1,::1,10.0.0.1
```

---

## 2. API 인증 사용법

### API 키 생성

서버 사이드에서 Agent용 API 키를 생성합니다:

```typescript
import { generateApiKey } from "@/lib/auth"

// Agent ID로 API 키 생성 (기본 365일 만료)
const apiKey = generateApiKey("agent-123")
console.log("API Key:", apiKey)
// 출력: pncr_base64encodedkey...

// 사용자 정의 만료 기간 (90일)
const customKey = generateApiKey("agent-456", 90)
```

### API 키 사용 (클라이언트)

생성된 API 키를 사용하여 보호된 API에 접근:

**방법 1: Authorization Bearer 토큰**

```typescript
const response = await fetch("/api/wallets/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify({ agentId: "agent-123" })
})
```

**방법 2: X-API-Key 헤더**

```typescript
const response = await fetch("/api/agents/upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": apiKey
  },
  body: JSON.stringify({ ... })
})
```

### API 키 검증 (서버)

API 라우트에서 API 키 검증:

```typescript
import { requireApiKey, isValidApiKey } from "@/lib/auth"

export async function POST(req: Request) {
  // API 키 검증
  const authResult = requireApiKey(req)
  
  // 검증 실패 시 에러 응답 반환
  if (!isValidApiKey(authResult)) {
    return authResult // 401 Unauthorized Response
  }
  
  // 검증 성공 - Agent ID 사용 가능
  const { agentId } = authResult
  console.log("Authenticated Agent:", agentId)
  
  // 비즈니스 로직 처리...
}
```

### Agent 서명 검증

```typescript
import { verifyAgentSignature, generateAgentSignature } from "@/lib/auth"

// 서버: 서명 생성
const signature = generateAgentSignature("agent-123")

// 클라이언트: 서명과 함께 요청
const response = await fetch("/api/some-endpoint", {
  headers: {
    "X-Agent-ID": "agent-123",
    "X-Agent-Signature": signature
  }
})

// 서버: 서명 검증
const agentId = req.headers.get("x-agent-id")
const signature = req.headers.get("x-agent-signature")

if (!verifyAgentSignature(agentId!, signature!)) {
  return new Response("Invalid signature", { status: 403 })
}
```

---

## 3. Rate Limiting

### 엔드포인트별 제한

현재 설정된 Rate Limit (자동 적용됨):

| 엔드포인트 | 제한 | 기간 |
|-----------|------|------|
| `/api/wallets/create` | 5회 | 1시간 |
| `/api/wallets/withdraw` | 10회 | 10분 |
| `/api/agents/purchase` | 10회 | 10초 |
| `/api/agents/upload` | 5회 | 1시간 |
| `/api/agents/*` | 30회 | 1분 |
| `/api/wallets/*` | 20회 | 1분 |
| 기타 API | 60회 | 1분 |

### Rate Limit 커스터마이징

`lib/security.ts` 파일의 `ENDPOINT_LIMITS` 객체를 수정:

```typescript
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  "/api/custom/endpoint": { requests: 100, window: "1 h" },
  // ...
}
```

### 수동 Rate Limit 체크

특정 로직에서 수동으로 rate limit 체크:

```typescript
import { checkRateLimit } from "@/lib/security"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  
  // Rate limit 체크
  const rateLimitError = await checkRateLimit(ip, "/api/custom/action")
  if (rateLimitError) {
    return rateLimitError // 429 Too Many Requests
  }
  
  // 정상 처리...
}
```

---

## 4. 보안 헤더

모든 응답에 자동으로 적용되는 보안 헤더:

### 기본 헤더

- **X-Frame-Options:** `DENY` - Clickjacking 방지
- **X-Content-Type-Options:** `nosniff` - MIME sniffing 방지
- **X-XSS-Protection:** `1; mode=block` - XSS 공격 차단
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** 카메라, 마이크 등 브라우저 기능 제한

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
connect-src 'self' https: wss:;
frame-ancestors 'none';
```

### HSTS (Production Only)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 5. 보안 유틸리티 사용법

### Input Sanitization

```typescript
import { sanitizeInput, sanitizeObject } from "@/lib/security"

// 단일 문자열 sanitize
const cleanName = sanitizeInput(userInput)

// 객체 전체 sanitize
const cleanData = sanitizeObject({
  name: "<script>alert('xss')</script>",
  bio: "Normal text"
})
// 결과: { name: "&lt;script&gt;alert('xss')&lt;/script&gt;", bio: "Normal text" }
```

### 지갑 주소 검증

```typescript
import { validateWalletAddress } from "@/lib/security"

const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

if (!validateWalletAddress(address)) {
  return new Response("Invalid wallet address", { status: 400 })
}
```

### 보안 이벤트 로깅

```typescript
import { logSecurityEvent } from "@/lib/security"

// 의심스러운 활동 로그
logSecurityEvent(
  "suspicious_login_attempt",
  {
    ip: "192.168.1.100",
    agentId: "agent-123",
    reason: "Multiple failed attempts"
  },
  "high" // severity: low | medium | high | critical
)
```

---

## 6. 모범 사례

### ✅ DO

1. **환경 변수를 안전하게 관리**
   - Vercel Secrets / AWS Secrets Manager 사용
   - `.env.local`은 절대 git에 커밋하지 않기

2. **프로덕션에서 강력한 시크릿 사용**
   - 최소 32자 이상의 랜덤 문자열
   - 정기적으로 시크릿 교체 (3-6개월마다)

3. **API 키 만료 관리**
   - 장기 사용 키는 짧은 만료 기간 설정
   - 만료된 키는 즉시 폐기

4. **보안 이벤트 모니터링**
   - 429 (Too Many Requests) 로그 추적
   - 401 (Unauthorized) 패턴 분석
   - Sentry 연동으로 실시간 알림 설정

### ❌ DON'T

1. **절대 하드코딩하지 않기**
   ```typescript
   // ❌ 나쁜 예
   const apiKey = "pncr_abc123..."
   
   // ✅ 좋은 예
   const apiKey = process.env.API_KEY_SECRET
   ```

2. **클라이언트에 민감 정보 노출하지 않기**
   - `NEXT_PUBLIC_` 접두사는 공개 정보에만 사용
   - API 키는 서버 사이드에서만 사용

3. **Rate Limit 무시하지 않기**
   - 개발 중에도 테스트용 Redis 사용 권장
   - Rate Limit 초과 시 적절한 에러 처리

---

## 🚨 긴급 보안 사고 대응

### 1. API 키 유출 시

```bash
# 1. 즉시 API_KEY_SECRET 환경 변수 변경
# 2. 모든 발급된 API 키 무효화 (DB에서 삭제)
# 3. 새 시크릿으로 키 재발급
```

### 2. 비정상 트래픽 감지 시

```bash
# 1. Rate Limit 강화 (ENDPOINT_LIMITS 수정)
# 2. 의심스러운 IP 차단 (INTERNAL_IPS 활용)
# 3. logs/security.log 분석
```

### 3. 지갑 암호화 키 유출 우려 시

```bash
# 1. 즉시 WALLET_ENCRYPTION_KEY 교체
# 2. 모든 Agent 지갑 재암호화
# 3. 보안 감사 실시
```

---

## 📚 추가 참고 자료

- [SECURITY_DESIGN.md](./SECURITY_DESIGN.md) - 전체 보안 설계 문서
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - 웹 애플리케이션 보안
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**문의사항이나 보안 취약점 발견 시:**
- 🛡️ Sentinel (보안 담당 Agent)에게 보고
- 📧 security@pincerbay.com

*"보안은 선택이 아닌 필수입니다."* 🛡️
