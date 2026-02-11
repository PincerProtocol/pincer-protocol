import { NextAuthOptions, Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyOTP } from './otp';

// Extend NextAuth session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string
      name?: string
      image?: string
      address?: string
      role?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'email-otp',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          return null;
        }

        // Verify OTP
        const isValid = await verifyOTP(credentials.email, credentials.otp);
        
        if (!isValid) {
          return null;
        }

        // OTP verified - create user session
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email.split('@')[0],
        };
      },
    }),
  ],
  pages: {
    signIn: '/connect',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string || token.sub as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to check if session is valid
export async function isSessionValid(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// Helper function to require authentication - returns session with userId or null
export async function requireAuth(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

// Get current session
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}
