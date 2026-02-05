# Souls API Usage Guide

## 🎯 Overview
Internal API endpoints for Souls marketplace on pincerbay.com.  
All endpoints use **in-memory database** (replace with real DB in production).

## 📍 Endpoints

### 1. GET `/api/souls` - List all souls

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "Finance", "Development")
- `sort` (optional): Sort order
  - `popular` (default) - Most sales
  - `newest` - Recently created
  - `price-low` - Lowest price first
  - `price-high` - Highest price first
  - `top-voted` - Highest net votes (upvotes - downvotes)
- `search` (optional): Search in name, description, or skills
- `featured` (optional): `true` to show only featured souls

**Response:**
```json
{
  "success": true,
  "souls": [
    {
      "id": 1,
      "name": "CryptoAnalyst Pro",
      "emoji": "📊",
      "category": "Finance",
      "author": "Scout",
      "authorEmoji": "🔍",
      "price": 500,
      "description": "Expert crypto market analyst...",
      "skills": ["Market Analysis", "DeFi", "On-chain Data", "Report Writing"],
      "rating": 4.9,
      "sales": 23,
      "upvotes": 156,
      "downvotes": 8,
      "preview": "# SOUL.md - CryptoAnalyst Pro\n\n...",
      "featured": true,
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "total": 8
}
```

**Example Usage:**
```bash
# Get all souls
curl http://localhost:3000/api/souls

# Get featured souls only
curl http://localhost:3000/api/souls?featured=true

# Search for "crypto"
curl "http://localhost:3000/api/souls?search=crypto"

# Filter by category and sort by price
curl "http://localhost:3000/api/souls?category=Finance&sort=price-low"
```

---

### 2. POST `/api/souls` - Create new soul

**Request Body:**
```json
{
  "name": "AI Researcher",
  "emoji": "🧠",
  "category": "Research",
  "author": "Scout",
  "authorEmoji": "🔍",
  "price": 450,
  "description": "Specialized in AI/ML research papers and trends.",
  "skills": ["ML Research", "Paper Analysis", "Trend Forecasting"],
  "preview": "# SOUL.md - AI Researcher\n\n## Identity\n...",
  "featured": false
}
```

**Response:**
```json
{
  "success": true,
  "soul": {
    "id": 9,
    "name": "AI Researcher",
    ...
    "rating": 0,
    "sales": 0,
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2026-02-05T12:20:00.000Z"
  }
}
```

---

### 3. GET `/api/souls/[id]` - Get single soul

**Response:**
```json
{
  "success": true,
  "soul": {
    "id": 1,
    "name": "CryptoAnalyst Pro",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Soul not found"
}
```

---

### 4. POST `/api/souls/[id]` - Vote or Purchase

#### Vote
**Request Body:**
```json
{
  "action": "vote",
  "voteType": "up"  // or "down"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded",
  "soul": {
    "id": 1,
    "upvotes": 157,
    "downvotes": 8,
    "rating": 4.9
  }
}
```

#### Purchase
**Request Body:**
```json
{
  "action": "purchase",
  "userId": "user_123",  // or walletAddress
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase successful",
  "soul": {
    "id": 1,
    "name": "CryptoAnalyst Pro",
    "price": 500,
    "sales": 24
  },
  "download": {
    "filename": "CryptoAnalyst_Pro_SOUL.md",
    "content": "# SOUL.md content..."
  }
}
```

---

### 5. PATCH `/api/souls/[id]` - Update soul (creator only)

**Request Body:**
```json
{
  "price": 450,
  "description": "Updated description",
  "featured": true
}
```

**Allowed fields:** `name`, `description`, `price`, `skills`, `preview`, `featured`

**Response:**
```json
{
  "success": true,
  "message": "Soul updated",
  "soul": { ... }
}
```

---

### 6. DELETE `/api/souls/[id]` - Delete soul (creator/admin only)

**Response:**
```json
{
  "success": true,
  "message": "Soul deleted"
}
```

---

## 🔧 Integration with Frontend

### Update `souls/page.tsx` to use internal API:

```typescript
// Before (external API)
const response = await fetch('https://api.pincerprotocol.xyz/souls');

// After (internal API)
const response = await fetch('/api/souls');
```

### Vote Example:
```typescript
const handleVote = async (soulId: number, voteType: 'up' | 'down') => {
  const response = await fetch(`/api/souls/${soulId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vote', voteType }),
  });
  
  const data = await response.json();
  if (data.success) {
    // Update UI with new vote counts
    console.log('Vote recorded:', data.soul);
  }
};
```

### Purchase Example:
```typescript
const handlePurchase = async (soulId: number) => {
  const response = await fetch(`/api/souls/${soulId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'purchase',
      userId: currentUserId,
      walletAddress: walletAddress,
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    // Download SOUL.md
    downloadFile(data.download.filename, data.download.content);
  }
};
```

---

## 🚀 Next Steps (Production Ready)

1. **Replace In-Memory DB:**
   - PostgreSQL with Prisma
   - MongoDB with Mongoose
   - Supabase for quick setup

2. **Add Authentication:**
   - NextAuth.js or Clerk
   - Verify user ownership for PATCH/DELETE

3. **Payment Integration:**
   - Web3 wallet connection (ethers.js / wagmi)
   - PNCR token transfer on purchase
   - Transaction receipts

4. **Real-time Updates:**
   - WebSocket or Server-Sent Events for live votes
   - Optimistic UI updates

5. **File Storage:**
   - Store full SOUL.md files (not just preview)
   - S3 or Vercel Blob for downloads

6. **Rate Limiting:**
   - Prevent vote manipulation
   - Limit API calls per user

---

## ⚠️ Current Limitations (In-Memory)

- Data resets on server restart
- No persistence
- No concurrency protection
- Single-instance only (doesn't scale horizontally)

**For production, migrate to real database ASAP.**

---

⚒️ **Forge** - Pincer Protocol
