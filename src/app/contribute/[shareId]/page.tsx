'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { THEMES, ThemeKey, formatDateTime } from '@/lib/utils'

interface CardInfo {
  id: string
  creatorName: string
  recipientName: string
  theme: string
  lockDate: string | null
  accentColor: string | null
  createdAt: string
  contributions: { id: string }[]
}

function CircleProgress({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  return (
    <svg width="48" height="48" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.15s linear' }}
      />
      <text x="22" y="26" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="600">
        {pct}%
      </text>
    </svg>
  )
}

export default function ContributePage({ params }: { params: { shareId: string } }) {
  const [card, setCard] = useState<CardInfo | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)
  const uploadCancelledRef = useRef(false)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  useEffect(() => {
    fetch(`/api/cards/${params.shareId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true)
        else { setCard(data.card); setIsLocked(data.isLocked) }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.shareId])

  const handlePhotoUpload = (file: File) => {
    uploadCancelledRef.current = false
    setUploading(true)
    setUploadProgress(0)

    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.onprogress = (e) => {
      if (uploadCancelledRef.current) return
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 92))
    }

    xhr.onload = () => {
      if (uploadCancelledRef.current) return
      try {
        const data = JSON.parse(xhr.responseText)
        if (data.url) { setPhotoUrl(data.url); setUploadProgress(100) }
        else setError(data.error || 'Upload failed')
      } catch { setError('Upload failed') }
      setUploading(false)
    }

    xhr.onerror = () => {
      if (!uploadCancelledRef.current) setError('Upload failed')
      setUploading(false)
    }

    xhr.open('POST', '/api/upload')
    xhr.send(fd)
  }

  const skipPhoto = () => {
    uploadCancelledRef.current = true
    xhrRef.current?.abort()
    xhrRef.current = null
    setUploading(false)
    setUploadProgress(0)
    setPhotoUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: params.shareId, contributorName: name.trim(), message: message.trim(), photoUrl: photoUrl || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading card…</p>
      </div>
    )
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl text-gray-800 mb-2">Card not found</h1>
          <p className="text-gray-500 mb-6">This link may be invalid or expired.</p>
          <Link href="/" className="card-button-primary">Create your own card</Link>
        </div>
      </div>
    )
  }

  const theme = THEMES[card.theme as ThemeKey] ?? THEMES.birthday
  const accent = card.accentColor || theme.accent

  if (submitted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center px-4`}>
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4 animate-float">🎉</div>
          <h1 className="font-display text-2xl sm:text-3xl text-gray-900 mb-3">Message added!</h1>
          <p className="font-serif text-gray-500 mb-5 leading-relaxed text-sm sm:text-base">
            Your message is tucked into {card.recipientName}&apos;s card. They&apos;ll see it when they open their reveal!
          </p>
          <div className="flex justify-center gap-2 text-2xl mb-6">
            {theme.decorations.slice(0, 4).map((d, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>{d}</span>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setName(''); setMessage(''); setPhotoUrl('') }} className="card-button-secondary appearance-none">
            Add another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} paper-bg py-8 px-4`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 mb-5 text-center shadow-sm" style={{ background: theme.cardBg }}>
          <div className="text-4xl sm:text-5xl mb-3">{theme.emoji}</div>
          <p className="font-bold text-gray-600 text-sm sm:text-base">{card.creatorName} is creating a card for</p>
          <h1 className="font-display text-2xl sm:text-3xl mt-1" style={{ color: accent }}>{card.recipientName}!</h1>
          <div className="flex justify-center gap-1.5 mt-3 text-lg sm:text-xl">
            {theme.decorations.slice(0, 5).map((d, i) => <span key={i}>{d}</span>)}
          </div>
          {card.contributions.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {card.contributions.length} {card.contributions.length === 1 ? 'person has' : 'people have'} already added a message
            </p>
          )}
          {isLocked && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
              🔒 Contributions closed on {formatDateTime(card.lockDate!)}
            </div>
          )}
        </div>

        {isLocked ? (
          <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-display text-xl text-gray-800 dark:text-gray-200 mb-2">Contributions are closed</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">The creator locked this card on {formatDateTime(card.lockDate!)}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl shadow-lg p-6 sm:p-8 space-y-4">
            <h2 className="font-heading font-semibold tracking-wide text-gray-900 dark:text-gray-100">Add your message ✍️</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your name *</label>
              <input className="card-input" placeholder="e.g. Alex, Grandma, The whole team…" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your message *</label>
              <textarea className="card-textarea" rows={4} placeholder={`Write something for ${card.recipientName}…`} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Add a photo (optional)</label>
              {photoUrl ? (
                <div className="relative">
                  <img src={photoUrl} alt="Uploaded" className="w-full max-h-64 object-contain rounded-lg bg-gray-50 dark:bg-gray-900" />
                  <button type="button" onClick={() => setPhotoUrl('')} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold appearance-none">×</button>
                </div>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
                  {uploading ? (
                    <div className="border-2 border-dashed border-pink-200 rounded-xl p-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CircleProgress pct={uploadProgress} />
                        <p className="text-sm text-gray-500">Uploading photo…</p>
                        <button type="button" onClick={skipPhoto} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors appearance-none">
                          Skip photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-all" onClick={() => fileRef.current?.click()}>
                      <div className="text-2xl mb-1">📸</div>
                      <p className="text-sm text-gray-500">Tap to add a photo</p>
                      <p className="text-xs text-gray-400 mt-0.5">Optional — skip if you prefer</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 appearance-none"
              style={{ backgroundColor: accent }}
              disabled={submitting || !name.trim() || !message.trim()}
            >
              {submitting ? 'Adding…' : '✉️ Add my message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
