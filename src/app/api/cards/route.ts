import { NextRequest, NextResponse } from 'next/server'
import { createCard } from '@/lib/db'
import { shortId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creatorName, recipientName, theme, message, photoUrl, playlistUrl, lockDate, accentColor, email } = body

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

    // Send recovery email (non-fatal — card creation still succeeds if this fails)
    if (email && process.env.RESEND_API_KEY) {
      try {
        const origin = new URL(request.url).origin
        const shareUrl = `${origin}/contribute/${card.share_id}`
        const revealUrl = `${origin}/reveal/${card.reveal_id}`

        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.FROM_EMAIL ?? 'Cards for the Occasion <onboarding@resend.dev>',
          to: email,
          subject: `Your card for ${recipientName} is ready! 🎉`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
  <h1 style="font-size:22px;margin:0 0 8px;">${creatorName}, your card is ready! 🎉</h1>
  <p style="color:#6b7280;margin:0 0 28px;">Here are the links for <strong>${recipientName}&apos;s</strong> card. Keep them safe &mdash; save this email.</p>

  <div style="padding:18px 20px;background:#fdf2f8;border-radius:10px;border-left:4px solid #ec4899;margin-bottom:14px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9d174d;text-transform:uppercase;letter-spacing:.06em;">📤 Share with friends &mdash; NOT ${recipientName}</p>
    <a href="${shareUrl}" style="color:#ec4899;font-size:14px;word-break:break-all;">${shareUrl}</a>
  </div>

  <div style="padding:18px 20px;background:#f5f3ff;border-radius:10px;border-left:4px solid #8b5cf6;margin-bottom:28px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5b21b6;text-transform:uppercase;letter-spacing:.06em;">🎁 Reveal link &mdash; send only to ${recipientName}</p>
    <a href="${revealUrl}" style="color:#8b5cf6;font-size:14px;word-break:break-all;">${revealUrl}</a>
  </div>

  <p style="color:#9ca3af;font-size:12px;">Cards for the Occasion</p>
</div>`,
        })
      } catch (emailErr) {
        console.error('Email send failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ shareId: card.share_id, revealId: card.reveal_id })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}
