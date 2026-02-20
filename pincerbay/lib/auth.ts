import { NextAuthOptions, Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
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

        // Find or create user for email OTP
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: 'human',
            }
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/connect',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 for security)
  },
  callbacks: {
    // Create or find user on sign in
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Find or create user in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                image: user.image,
                role: 'human',
              }
            });
            // Store database ID for later use
            user.id = newUser.id;
          } else {
            // Use existing user's database ID
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // Allow sign in even if DB fails (graceful degradation)
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      // For Google users, ensure we have database ID
      if (account?.provider === 'google' && token.email && !token.dbId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          });
          if (dbUser) {
            token.dbId = dbUser.id;
          }
        } catch (error) {
          console.error('Error fetching user in jwt callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Prefer database ID, fallback to token.id or token.sub
        session.user.id = (token.dbId as string) || (token.id as string) || (token.sub as string);
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
