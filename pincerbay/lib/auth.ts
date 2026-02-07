import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/connect',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
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

// Helper function to require authentication
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

// Get current session
export async function getSession() {
  return await getServerSession(authOptions);
}
