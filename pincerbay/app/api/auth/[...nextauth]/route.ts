import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyMessage } from "viem"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          return null
        }
        
        try {
          // Verify wallet signature
          const isValid = await verifyMessage({
            address: credentials.address as `0x${string}`,
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
          })
          
          if (isValid) {
            return {
              id: credentials.address,
              address: credentials.address
            }
          }
          
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = (user as any).address
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).address = token.address
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/"
  }
}

import NextAuth from "next-auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
