import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
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
    let emailSent = false
    let emailError: string | null = null
    if (email) {
      const origin = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin
      const shareUrl = `${origin}/contribute/${card.share_id}`
      const revealUrl = `${origin}/reveal/${card.reveal_id}`

      const emailHtml = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111;">
  <h1 style="font-size:22px;margin:0 0 8px;">${creatorName}, your card is ready! 🎉</h1>
  <p style="color:#6b7280;margin:0 0 28px;">Here are the links for <strong>${recipientName}'s</strong> card. Keep them safe — save this email.</p>

  <div style="padding:18px 20px;background:#ede9fe;border-radius:10px;border-left:4px solid #7c3aed;margin-bottom:14px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#4c1d95;text-transform:uppercase;letter-spacing:.06em;">📤 Share with friends — NOT ${recipientName}</p>
    <a href="${shareUrl}" style="color:#7c3aed;font-size:14px;word-break:break-all;">${shareUrl}</a>
  </div>

  <div style="padding:18px 20px;background:#dbeafe;border-radius:10px;border-left:4px solid #3b82f6;margin-bottom:28px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:.06em;">🎁 Reveal link — send only to ${recipientName}</p>
    <a href="${revealUrl}" style="color:#3b82f6;font-size:14px;word-break:break-all;">${revealUrl}</a>
  </div>

  <p style="color:#9ca3af;font-size:12px;">Cards for the Occasion</p>
</div>`

      try {
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          // Gmail SMTP — no custom domain needed
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
          })
          await transporter.sendMail({
            from: `Cards for the Occasion <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Your card for ${recipientName} is ready! 🎉`,
            html: emailHtml,
          })
          emailSent = true
        } else if (process.env.RESEND_API_KEY) {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error: sendError } = await resend.emails.send({
            from: process.env.FROM_EMAIL ?? 'Cards for the Occasion <onboarding@resend.dev>',
            to: email,
            subject: `Your card for ${recipientName} is ready! 🎉`,
            html: emailHtml,
          })
          if (sendError) {
            emailError = typeof sendError === 'object' && sendError !== null && 'message' in sendError
              ? String((sendError as { message: unknown }).message)
              : JSON.stringify(sendError)
            console.error('Resend error:', sendError)
          } else {
            emailSent = true
          }
        } else {
          emailError = 'No email provider configured (add GMAIL_USER + GMAIL_APP_PASSWORD to Vercel env vars)'
          console.warn('No email provider configured')
        }
      } catch (emailErr) {
        emailError = emailErr instanceof Error ? emailErr.message : 'Unknown error'
        console.error('Email send failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ shareId: card.share_id, revealId: card.reveal_id, emailSent, emailError })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}
