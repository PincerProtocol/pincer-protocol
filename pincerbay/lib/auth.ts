import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { Session } from "next-auth"

export async function requireAuth(req?: Request): Promise<Session | Response> {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - Please connect your wallet" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
  
  return session
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export function isSessionValid(session: Session | Response): session is Session {
  return !(session instanceof Response)
}
