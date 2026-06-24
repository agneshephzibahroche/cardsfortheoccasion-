import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024
const MAX_BASE64_SIZE = 2 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Use JPEG, PNG, GIF, or WebP.' }, { status: 400 })
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })

    // Use Vercel Blob when configured (production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const blob = await put(`cards/${uuidv4()}.${ext}`, file, { access: 'public' })
      return NextResponse.json({ url: blob.url })
    }

    // Fallback: store as base64 data URL (works without any config)
    if (file.size > MAX_BASE64_SIZE)
      return NextResponse.json({ error: 'File too large for this mode. Max 2MB.' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    return NextResponse.json({ url: `data:${file.type};base64,${base64}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
