import { NextResponse } from 'next/server';
import { checkRateLimit, getIdentifier } from '@/lib/ratelimit';
import { logger, logApiRequest, logError } from '@/lib/logger';

// Mock airdrop data
// TODO: Connect to actual smart contract
const TOTAL_SUPPLY = 100_000_000;
const DISTRIBUTED = 12_345_678;

export async function GET(request: Request) {
  const ip = getIdentifier(request);
  const userAgent = request.headers.get("user-agent");
  
  try {
    // Log API request
    logApiRequest("GET", "/api/airdrop/status", ip, userAgent);
    
    // Rate limiting (more lenient for GET requests)
    const rateLimitExceeded = await checkRateLimit(`airdrop:${ip}`);
    if (rateLimitExceeded) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    return NextResponse.json({
      total: TOTAL_SUPPLY,
      distributed: DISTRIBUTED,
      remaining: TOTAL_SUPPLY - DISTRIBUTED,
      percentage: (DISTRIBUTED / TOTAL_SUPPLY * 100).toFixed(2)
    });
  } catch (error) {
    logError(error, { path: "/api/airdrop/status", ip });
    return NextResponse.json(
      { error: 'Failed to fetch airdrop status' },
      { status: 500 }
    );
  }
}
