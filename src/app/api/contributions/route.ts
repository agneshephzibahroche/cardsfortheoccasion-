import { NextRequest, NextResponse } from 'next/server'
import { getCardByShareId, createContribution } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shareId, contributorName, message, photoUrl } = body

    if (!shareId || !contributorName || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const card = getCardByShareId(shareId)

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.lock_date && new Date() > new Date(card.lock_date)) {
      return NextResponse.json({ error: 'Contributions are closed for this card' }, { status: 403 })
    }

    const contribution = createContribution({
      id: uuidv4(),
      cardId: card.id,
      contributorName,
      message,
      photoUrl: photoUrl || undefined,
    })

    return NextResponse.json({ id: contribution.id })
  } catch (error) {
    console.error('Error adding contribution:', error)
    return NextResponse.json({ error: 'Failed to add contribution' }, { status: 500 })
  }
}
