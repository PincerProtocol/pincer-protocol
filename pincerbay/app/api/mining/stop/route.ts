import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { MiningService } from '@/lib/miningService'
import { logError } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const miningService = new MiningService()
    const result = await miningService.stopSession(sessionId)

    return NextResponse.json({
      success: true,
      data: {
        session: result.session,
        reward: result.reward,
        earnedPNCR: result.earnedPNCR
      }
    })
  } catch (error) {
    logError(error, { endpoint: '/api/mining/stop' })

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to stop mining session' },
      { status: 500 }
    )
  }
}
