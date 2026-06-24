import { NextRequest, NextResponse } from 'next/server'
import { getCardByRevealId, markCardRevealed, saveReaction } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: { revealId: string } }
) {
  try {
    const isFirstReveal = await markCardRevealed(params.revealId)
    const card = await getCardByRevealId(params.revealId)
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

    return NextResponse.json({
      isFirstReveal,
      card: {
        id: card.id,
        creatorName: card.creator_name,
        recipientName: card.recipient_name,
        theme: card.theme,
        message: card.message,
        photoUrl: card.photo_url,
        playlistUrl: card.playlist_url,
        lockDate: card.lock_date,
        accentColor: card.accent_color,
        reaction: card.reaction,
        createdAt: card.created_at,
        contributions: card.contributions.map((c) => ({
          id: c.id,
          contributorName: c.contributor_name,
          message: c.message,
          photoUrl: c.photo_url,
          createdAt: c.created_at,
        })),
      },
    })
  } catch (error) {
    console.error('Error revealing card:', error)
    return NextResponse.json({ error: 'Failed to reveal card' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { revealId: string } }
) {
  try {
    const { reaction } = await request.json()
    if (!reaction) return NextResponse.json({ error: 'Missing reaction' }, { status: 400 })
    await saveReaction(params.revealId, reaction)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error saving reaction:', error)
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
  }
}
