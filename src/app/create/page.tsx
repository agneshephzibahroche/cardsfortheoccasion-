'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import ThemeSelector from '@/components/ThemeSelector'
import { ThemeKey, THEMES, ACCENT_COLORS } from '@/lib/utils'

type Step = 1 | 2 | 3

interface FormData {
  recipientName: string
  creatorName: string
  theme: ThemeKey
  accentColor: string
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
      className={`shrink-0 px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-md transition-colors ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-pink-500 hover:bg-pink-600 text-white'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    recipientName: '',
    creatorName: '',
    theme: 'birthday',
    accentColor: '#ec4899',
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
  const uploadCancelledRef = useRef(false)

  const theme = THEMES[form.theme]
  const update = (field: keyof FormData, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handlePhotoUpload = async (file: File) => {
    uploadCancelledRef.current = false
    setError('')
    setPhotoUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!uploadCancelledRef.current) {
        if (data.url) update('photoUrl', data.url)
        else setError(data.error || 'Upload failed')
      }
    } catch {
      if (!uploadCancelledRef.current) setError('Upload failed')
    } finally {
      setPhotoUploading(false)
    }
  }

  const skipPhoto = () => {
    uploadCancelledRef.current = true
    setPhotoUploading(false)
    update('photoUrl', '')
  }

  const canGoStep2 = form.recipientName.trim() && form.creatorName.trim()
  const canGoStep3 = form.message.trim().length > 0

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
          accentColor: form.accentColor,
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
        <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{theme.emoji}</div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-wide text-gray-900 dark:text-gray-100 mb-1">
              Your card is ready! 🎉
            </h1>
            <p className="text-gray-500 text-sm">Share these two links carefully</p>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📤</span>
              <h3 className="font-heading font-semibold tracking-wide text-gray-800 dark:text-gray-200 uppercase text-sm">Share with friends</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-sans">
              Send to everyone adding a message. <strong>Not</strong> to {form.recipientName}!
            </p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 font-mono">{shareUrl}</span>
              <CopyButton text={shareUrl} />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎁</span>
              <h3 className="font-heading font-semibold tracking-wide text-gray-800 dark:text-gray-200 uppercase text-sm">Reveal link for {form.recipientName}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-sans">
              Send <em>only</em> to {form.recipientName} when ready.
            </p>
            <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 rounded-lg p-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 font-mono">{revealUrl}</span>
              <CopyButton text={revealUrl} />
            </div>
          </div>

          {form.lockDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
              🔒 Closes {new Date(form.lockDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/" className="card-button-secondary flex-1 text-center">Home</Link>
            <button
              onClick={() => { setResult(null); setStep(1); setForm({ recipientName: '', creatorName: '', theme: 'birthday', accentColor: '#ec4899', message: '', photoUrl: '', playlistUrl: '', lockDate: '' }) }}
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
    <div className="min-h-screen paper-bg py-8 px-4">
      <div className="max-w-xl mx-auto mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">← Back</Link>
        <h1 className="font-display text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mt-3 mb-0.5">Create your card</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Step {step} of 3</p>
        <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl shadow-lg p-6 sm:p-8">

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-heading font-semibold text-xl tracking-wide text-gray-900 dark:text-gray-100 mb-0.5">Who is this card for?</h2>
              <p className="text-sm text-gray-500">Let&apos;s start with the basics</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Recipient&apos;s name *</label>
              <input className="card-input" placeholder="e.g. Sarah, Mom, Dr. Rivera…" value={form.recipientName} onChange={(e) => update('recipientName', e.target.value)} autoFocus />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your name *</label>
              <input className="card-input" placeholder="e.g. Jamie" value={form.creatorName} onChange={(e) => update('creatorName', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Occasion *</label>
              <ThemeSelector selected={form.theme} onChange={(t) => update('theme', t)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Card colour</label>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => update('accentColor', color.value)}
                    title={color.label}
                    className="relative w-9 h-9 rounded-full transition-all duration-150 hover:scale-110"
                    style={{ backgroundColor: color.value }}
                  >
                    {form.accentColor === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base leading-none">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Used for the seal, headings, and buttons</p>
            </div>

            <button className="card-button-primary w-full" disabled={!canGoStep2} onClick={() => setStep(2)}>
              Next: Your message →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-heading font-semibold text-xl tracking-wide text-gray-900 dark:text-gray-100 mb-0.5">Write your message</h2>
              <p className="text-sm text-gray-500">The first note inside the card</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Add a photo (optional)</label>
              {form.photoUrl ? (
                <div className="relative">
                  <img src={form.photoUrl} alt="Uploaded" className="w-full max-h-72 object-contain rounded-lg bg-gray-50 dark:bg-gray-900" />
                  <button onClick={() => update('photoUrl', '')} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600">×</button>
                </div>
              ) : (
                <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
                {photoUploading ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <div className="text-gray-400 animate-pulse mb-2">Uploading…</div>
                    <button type="button" onClick={skipPhoto} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">
                      Skip photo
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-all"
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="text-3xl mb-1">📸</div>
                    <p className="text-sm text-gray-500">Tap to upload a photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG, GIF · Max 5MB · Optional</p>
                  </div>
                )}
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center justify-between gap-2">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} className="shrink-0 text-red-400 hover:text-red-600 font-bold">×</button>
              </div>
            )}

            <div className="flex gap-3">
              <button className="card-button-secondary flex-1" onClick={() => { setStep(1); setError('') }}>← Back</button>
              <button className="card-button-primary flex-1" disabled={!canGoStep3} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-heading font-semibold text-xl tracking-wide text-gray-900 dark:text-gray-100 mb-0.5">Optional extras</h2>
              <p className="text-sm text-gray-500">Make it even more special</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">🎵 Playlist link (optional)</label>
              <input className="card-input" placeholder="Spotify or YouTube URL" value={form.playlistUrl} onChange={(e) => update('playlistUrl', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Plays softly as they read</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">🔒 Lock date (optional)</label>
              <input type="date" className="card-input" value={form.lockDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => update('lockDate', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">No messages accepted after this date</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

            <div className="flex gap-3">
              <button className="card-button-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="card-button-primary flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating…' : '🎉 Create card!'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">No account needed · Free forever</p>
          </div>
        )}
      </div>
    </div>
  )
}
