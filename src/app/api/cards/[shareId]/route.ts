import { NextRequest, NextResponse } from 'next/server'
import { getCardByShareId } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const card = await getCardByShareId(params.shareId)
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

    const isLocked = card.lock_date ? new Date() > new Date(card.lock_date) : false

    return NextResponse.json({
      card: {
        id: card.id,
        shareId: card.share_id,
        creatorName: card.creator_name,
        recipientName: card.recipient_name,
        theme: card.theme,
        lockDate: card.lock_date,
        accentColor: card.accent_color,
        createdAt: card.created_at,
        contributions: card.contributions,
      },
      isLocked,
      contributionCount: card.contributions.length,
    })
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 })
  }
}
