import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const OTP_PREFIX = 'otp:';
const OTP_EXPIRY = 600; // 10 minutes in seconds

export async function storeOTP(email: string, otp: string): Promise<void> {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  await redis.set(key, otp, { ex: OTP_EXPIRY });
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  const storedOTP = await redis.get<string>(key);
  
  if (storedOTP === otp) {
    // Delete OTP after successful verification
    await redis.del(key);
    return true;
  }
  
  return false;
}

export async function getOTPAttempts(email: string): Promise<number> {
  const attemptsKey = `${OTP_PREFIX}attempts:${email.toLowerCase()}`;
  const attempts = await redis.get<number>(attemptsKey);
  return attempts || 0;
}

export async function incrementOTPAttempts(email: string): Promise<number> {
  const attemptsKey = `${OTP_PREFIX}attempts:${email.toLowerCase()}`;
  const attempts = await redis.incr(attemptsKey);
  // Reset attempts after 1 hour
  await redis.expire(attemptsKey, 3600);
  return attempts;
}

export async function resetOTPAttempts(email: string): Promise<void> {
  const attemptsKey = `${OTP_PREFIX}attempts:${email.toLowerCase()}`;
  await redis.del(attemptsKey);
}
