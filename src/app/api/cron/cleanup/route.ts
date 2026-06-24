import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldCards } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await cleanupOldCards()
    console.log('Weekly cleanup:', result)
    return NextResponse.json({ ...result, runAt: new Date().toISOString() })
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
