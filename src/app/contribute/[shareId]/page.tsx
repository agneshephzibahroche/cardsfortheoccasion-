'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { THEMES, ThemeKey, formatDate } from '@/lib/utils'

interface CardInfo {
  id: string
  creatorName: string
  recipientName: string
  theme: string
  lockDate: string | null
  createdAt: string
  contributions: { id: string }[]
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
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/cards/${params.shareId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setNotFound(true)
        } else {
          setCard(data.card)
          setIsLocked(data.isLocked)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.shareId])

  const handlePhotoUpload = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setPhotoUrl(data.url)
      else setError(data.error || 'Upload failed')
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
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
        body: JSON.stringify({
          shareId: params.shareId,
          contributorName: name.trim(),
          message: message.trim(),
          photoUrl: photoUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add message')
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">Loading card…</div>
      </div>
    )
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-serif text-2xl font-bold text-gray-800 mb-2">Card not found</h1>
          <p className="text-gray-500 mb-6">This link may be invalid or expired.</p>
          <Link href="/" className="card-button-primary">Create your own card</Link>
        </div>
      </div>
    )
  }

  const theme = THEMES[card.theme as ThemeKey] ?? THEMES.birthday

  if (submitted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center px-4`}>
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center">
          <div className="text-6xl mb-4 animate-float">🎉</div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-3">
            Message added!
          </h1>
          <p className="text-gray-500 mb-4 leading-relaxed">
            Your message has been tucked into {card.recipientName}&apos;s card.
            They&apos;ll see it when they open their reveal!
          </p>
          <div
            className="text-4xl mb-6 flex justify-center gap-2"
          >
            {theme.decorations.slice(0, 4).map((d, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                {d}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              setSubmitted(false)
              setName('')
              setMessage('')
              setPhotoUrl('')
            }}
            className="card-button-secondary"
          >
            Add another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} paper-bg py-12 px-4`}>
      <div className="max-w-lg mx-auto">
        {/* Card header */}
        <div
          className="rounded-3xl p-8 mb-6 text-center shadow-sm"
          style={{ background: theme.cardBg }}
        >
          <div className="text-5xl mb-3">{theme.emoji}</div>
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: theme.textColor }}>
            {card.creatorName} is creating a card
          </h1>
          <h2 className="font-serif text-3xl font-bold" style={{ color: theme.accent }}>
            for {card.recipientName}!
          </h2>
          <div className="flex justify-center gap-2 mt-4 text-xl">
            {theme.decorations.slice(0, 5).map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {card.contributions.length > 0 && (
            <p className="text-sm text-gray-400 mt-4">
              {card.contributions.length} {card.contributions.length === 1 ? 'person has' : 'people have'} already added a message
            </p>
          )}

          {isLocked && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
              🔒 Contributions closed on {formatDate(card.lockDate!)}
            </div>
          )}
        </div>

        {isLocked ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-serif text-xl font-bold text-gray-800 mb-2">
              Contributions are closed
            </h2>
            <p className="text-gray-500">
              The creator locked this card on {formatDate(card.lockDate!)}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-5">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Add your message ✍️
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your name *
              </label>
              <input
                className="card-input"
                placeholder="e.g. Alex, Grandma, The whole team…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your message *
              </label>
              <textarea
                className="card-textarea"
                rows={4}
                placeholder={`Write something for ${card.recipientName}…`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add a photo (optional)
              </label>
              {photoUrl ? (
                <div className="relative">
                  <img src={photoUrl} alt="Uploaded" className="w-full h-36 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-all"
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoUpload(f)
                    }}
                  />
                  {uploading ? (
                    <div className="text-gray-400 animate-pulse">Uploading…</div>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">📸</div>
                      <p className="text-sm text-gray-500">Click to add a photo</p>
                      <p className="text-xs text-gray-400">Max 5MB</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="card-button-primary w-full"
              disabled={submitting || !name.trim() || !message.trim()}
            >
              {submitting ? 'Adding your message…' : '✉️ Add my message'}
            </button>

            <p className="text-center text-xs text-gray-400">
              No account needed · Your message is safe
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
