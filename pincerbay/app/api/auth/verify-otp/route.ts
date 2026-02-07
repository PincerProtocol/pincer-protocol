import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, resetOTPAttempts } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful verification
    await resetOTPAttempts(email);

    // Return success - the client will use NextAuth credentials to complete login
    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
