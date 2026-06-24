'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import ThemeSelector from '@/components/ThemeSelector'
import { ThemeKey, THEMES } from '@/lib/utils'

type Step = 1 | 2 | 3

interface FormData {
  recipientName: string
  creatorName: string
  theme: ThemeKey
  message: string
  photoUrl: string
  playlistUrl: string
  lockDate: string
}

interface Result {
  shareId: string
  revealId: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="shrink-0 px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    recipientName: '',
    creatorName: '',
    theme: 'birthday',
    message: '',
    photoUrl: '',
    playlistUrl: '',
    lockDate: '',
  })
  const [photoUploading, setPhotoUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const theme = THEMES[form.theme]

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) update('photoUrl', data.url)
      else setError(data.error || 'Upload failed')
    } catch {
      setError('Upload failed')
    } finally {
      setPhotoUploading(false)
    }
  }

  const canGoStep2 = form.recipientName.trim() && form.creatorName.trim()
  const canGoStep3 = form.message.trim().length >= 10

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: form.creatorName,
          recipientName: form.recipientName,
          theme: form.theme,
          message: form.message,
          photoUrl: form.photoUrl || undefined,
          playlistUrl: form.playlistUrl || undefined,
          lockDate: form.lockDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create card')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = result ? `${origin}/contribute/${result.shareId}` : ''
  const revealUrl = result ? `${origin}/reveal/${result.revealId}` : ''

  if (result) {
    return (
      <div className="min-h-screen paper-bg flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{theme.emoji}</div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Your card is ready! 🎉
            </h1>
            <p className="text-gray-500">Share these two links carefully</p>
          </div>

          {/* Share link */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📤</span>
              <h3 className="font-semibold text-gray-800">Share with friends</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Send this to everyone who wants to add a message. <strong>Don&apos;t</strong> send to {form.recipientName}!
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-xs text-gray-600 truncate flex-1 font-mono">{shareUrl}</span>
              <CopyButton text={shareUrl} />
            </div>
          </div>

          {/* Reveal link */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎁</span>
              <h3 className="font-semibold text-gray-800">Reveal link for {form.recipientName}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Send <em>only</em> to {form.recipientName} when you&apos;re ready for them to open it.
              The first open gets the full animation!
            </p>
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-3">
              <span className="text-xs text-gray-600 truncate flex-1 font-mono">{revealUrl}</span>
              <CopyButton text={revealUrl} />
            </div>
          </div>

          {form.lockDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
              🔒 Contributions will close on {new Date(form.lockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/" className="card-button-secondary flex-1 text-center">
              Home
            </Link>
            <button
              onClick={() => {
                setResult(null)
                setStep(1)
                setForm({ recipientName: '', creatorName: '', theme: 'birthday', message: '', photoUrl: '', playlistUrl: '', lockDate: '' })
              }}
              className="card-button-primary flex-1"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-bg py-12 px-4">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </Link>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mt-4 mb-1">
          Create your card
        </h1>
        <p className="text-gray-500">Step {step} of 3</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                Who is this card for?
              </h2>
              <p className="text-sm text-gray-500">Let&apos;s start with the basics</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipient&apos;s name *
              </label>
              <input
                className="card-input"
                placeholder="e.g. Sarah, Mom, Dr. Rivera…"
                value={form.recipientName}
                onChange={(e) => update('recipientName', e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your name *
              </label>
              <input
                className="card-input"
                placeholder="e.g. Jamie"
                value={form.creatorName}
                onChange={(e) => update('creatorName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose a theme *
              </label>
              <ThemeSelector
                selected={form.theme}
                onChange={(t) => update('theme', t)}
              />
            </div>

            <button
              className="card-button-primary w-full"
              disabled={!canGoStep2}
              onClick={() => setStep(2)}
            >
              Next: Your message →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                Write your message
              </h2>
              <p className="text-sm text-gray-500">This will be the first note inside the card</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your message to {form.recipientName} *
              </label>
              <textarea
                className="card-textarea"
                rows={5}
                placeholder="Write something heartfelt..."
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">{form.message.length} characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add a photo (optional)
              </label>
              {form.photoUrl ? (
                <div className="relative">
                  <img
                    src={form.photoUrl}
                    alt="Uploaded"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => update('photoUrl', '')}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-all"
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
                  {photoUploading ? (
                    <div className="text-gray-400">Uploading…</div>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-sm text-gray-500">Click to upload a photo</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP · Max 5MB</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button className="card-button-secondary flex-1" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="card-button-primary flex-1"
                disabled={!canGoStep3}
                onClick={() => setStep(3)}
              >
                Next: Extras →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                Optional extras
              </h2>
              <p className="text-sm text-gray-500">Make it even more special</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎵 Spotify or YouTube link (optional)
              </label>
              <input
                className="card-input"
                placeholder="https://open.spotify.com/playlist/... or YouTube URL"
                value={form.playlistUrl}
                onChange={(e) => update('playlistUrl', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Plays softly in the background as they read
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Lock date (optional)
              </label>
              <input
                type="date"
                className="card-input"
                value={form.lockDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => update('lockDate', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                No one can add messages after this date
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button className="card-button-secondary flex-1" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="card-button-primary flex-1"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating…' : '🎉 Create card!'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              No account needed · Free forever
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
