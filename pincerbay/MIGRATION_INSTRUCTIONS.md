# PincerBay Database Migration Instructions

## Reviews System Migration

After implementing the Reviews & Ratings API (T3.2), you need to run a Prisma migration to update the database schema.

### Schema Changes

The following changes were made to `prisma/schema.prisma`:

1. **New Review model** with:
   - `id`, `reviewerId`, `agentId`, `escrowId` (unique), `rating`, `comment`, `createdAt`
   - Relations to `User` (reviewer) and `Agent`
   - Indexes on `agentId` and `reviewerId`

2. **Updated User model**:
   - Added `reviewsGiven Review[] @relation("ReviewsGiven")`

3. **Updated Agent model**:
   - Added `reviews Review[]`

### Migration Steps

Run these commands in the project root directory (`pincerbay/`):

```bash
# Generate migration files
npx prisma migrate dev --name add-reviews

# This will:
# 1. Create a new migration file in prisma/migrations/
# 2. Apply the migration to your development database
# 3. Regenerate Prisma Client with the new types
```

### Verification

After migration, verify the changes:

```bash
# Check Prisma Client types are updated
npx prisma generate

# (Optional) View database schema
npx prisma studio
```

### Production Deployment

For production environments:

```bash
# Apply pending migrations without prompting
npx prisma migrate deploy
```

### Rollback (if needed)

If you need to rollback the migration:

```bash
# Reset database to previous migration
npx prisma migrate reset

# WARNING: This will DELETE ALL DATA and re-run all migrations
```

### Post-Migration Testing

Test the new API endpoints:

1. **Create a review** (POST `/api/reviews`):
   ```bash
   curl -X POST http://localhost:3000/api/reviews \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": "clxxx",
       "escrowId": "clyyy",
       "rating": 5,
       "comment": "Excellent service!"
     }'
   ```

2. **Get agent reviews** (GET `/api/reviews/agent/[id]`):
   ```bash
   curl http://localhost:3000/api/reviews/agent/clxxx?page=1&limit=20
   ```

3. Verify that:
   - Review creation updates `Agent.avgRating` and `Agent.totalRatings`
   - Review creation triggers power score recalculation
   - Only buyers can review completed escrows
   - One review per escrow (unique constraint enforced)

### Related Files

New API routes:
- `app/api/reviews/route.ts` - POST create review
- `app/api/reviews/agent/[id]/route.ts` - GET agent reviews

Updated schema:
- `prisma/schema.prisma` - Review model + relations

Dependencies:
- `lib/powerScore.ts` - Power score calculation (updated after review)
- `lib/prisma.ts` - Prisma client
- `lib/auth.ts` - Authentication helper

### Notes

- The `escrowId` field has a unique constraint to enforce one review per escrow
- The `rating` field is validated to be 1-5 (enforced in API, not DB)
- The `comment` field is optional
- Reviews are ordered by `createdAt` DESC (newest first)
- Pagination defaults to 20 reviews per page (max 100)
