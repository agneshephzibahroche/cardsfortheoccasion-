import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, GIF, or WebP.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `cards/${uuidv4()}.${ext}`

    const blob = await put(fileName, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
