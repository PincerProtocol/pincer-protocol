import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail, generateOTP } from '@/lib/email';
import { storeOTP, getOTPAttempts, incrementOTPAttempts } from '@/lib/otp';
import { logger } from '@/lib/logger';

const MAX_ATTEMPTS_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check rate limit
    const attempts = await getOTPAttempts(email);
    if (attempts >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // Increment attempts
    await incrementOTPAttempts(email);

    // Send email
    const sent = await sendOTPEmail(email, otp);

    if (!sent) {
      // If Resend is not configured, still return success in demo mode
      if (!process.env.RESEND_API_KEY) {
        logger.info(`[DEMO MODE] OTP for ${email}: ${otp}`);
        return NextResponse.json({
          success: true,
          message: 'Check your email for the verification code',
          demo: true,
          // Only show OTP in development/demo mode
          ...(process.env.NODE_ENV === 'development' && { _demoOtp: otp }),
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for the verification code',
    });
  } catch (error) {
    logger.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
