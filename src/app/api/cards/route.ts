import { NextRequest, NextResponse } from 'next/server'
import { createCard } from '@/lib/db'
import { shortId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creatorName, recipientName, theme, message, photoUrl, playlistUrl, lockDate, accentColor } = body

    if (!creatorName || !recipientName || !message || !theme) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const card = await createCard({
      id: shortId(12),
      shareId: shortId(8),
      revealId: shortId(8),
      creatorName,
      recipientName,
      theme,
      message,
      photoUrl: photoUrl || undefined,
      playlistUrl: playlistUrl || undefined,
      lockDate: lockDate || undefined,
      accentColor: accentColor || undefined,
    })

    return NextResponse.json({ shareId: card.share_id, revealId: card.reveal_id })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}
