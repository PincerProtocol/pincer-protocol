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

    const miningService = new MiningService()
    const miningSession = await miningService.startSession(session.user.id)

    return NextResponse.json({
      success: true,
      data: miningSession
    })
  } catch (error) {
    logError(error, { endpoint: '/api/mining/start' })

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start mining session' },
      { status: 500 }
    )
  }
}
