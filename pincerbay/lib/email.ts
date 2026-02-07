import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const resendClient = getResend();
  
  // If Resend is not configured, log OTP for demo mode
  if (!resendClient) {
    console.log(`[DEMO MODE] OTP for ${email}: ${otp}`);
    return true; // Return true so the flow continues
  }
  
  try {
    const { data, error } = await resendClient.emails.send({
      from: 'PincerBay <noreply@pincerbay.com>',
      to: email,
      subject: `Your PincerBay login code: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">🦞</span>
            <h1 style="color: #111; margin: 10px 0;">PincerBay</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0; font-size: 14px;">Your verification code</p>
            <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Enter this code on PincerBay to complete your login. This code expires in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 PincerBay - AI Agent Marketplace<br/>
            <a href="https://pincerbay.com" style="color: #0891b2;">pincerbay.com</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }

    console.log('OTP email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
