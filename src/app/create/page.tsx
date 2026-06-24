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
  email: string
}

interface Result {
  shareId: string
  revealId: string
  emailSent: boolean
  emailError: string | null
}

function CircleProgress({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  return (
    <svg width="48" height="48" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke="#ec4899" strokeWidth="3" strokeLinecap="round"
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
      className={`shrink-0 px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-md transition-colors appearance-none ${
        copied ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const [done, setDone] = useState(false)
  if (typeof navigator === 'undefined' || !navigator.share) return null
  const share = async () => {
    try {
      await navigator.share({ title, url })
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch { /* cancelled */ }
  }
  return (
    <button
      onClick={share}
      className={`shrink-0 px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-md transition-colors appearance-none ${
        done ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
      }`}
    >
      {done ? '✓' : '↑ Share'}
    </button>
  )
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    recipientName: '',
    creatorName: '',
    theme: 'birthday',
    accentColor: '#8b5cf6',
    message: '',
    photoUrl: '',
    playlistUrl: '',
    lockDate: '',
    email: '',
  })
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadCancelledRef = useRef(false)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const theme = THEMES[form.theme]
  const update = (field: keyof FormData, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handlePhotoUpload = (file: File) => {
    uploadCancelledRef.current = false
    setError('')
    setPhotoUploading(true)
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
        if (data.url) { update('photoUrl', data.url); setUploadProgress(100) }
        else setError(data.error || 'Upload failed')
      } catch { setError('Upload failed') }
      setPhotoUploading(false)
    }

    xhr.onerror = () => {
      if (!uploadCancelledRef.current) setError('Upload failed')
      setPhotoUploading(false)
    }

    xhr.open('POST', '/api/upload')
    xhr.send(fd)
  }

  const skipPhoto = () => {
    uploadCancelledRef.current = true
    xhrRef.current?.abort()
    xhrRef.current = null
    setPhotoUploading(false)
    setUploadProgress(0)
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
          email: form.email || undefined,
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
  const lockDateLocal = form.lockDate ? new Date(form.lockDate).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

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
              <ShareButton url={shareUrl} title={`Add a message to ${form.recipientName}'s card!`} />
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
              <ShareButton url={revealUrl} title={`Your card is ready, ${form.recipientName}! 🎉`} />
              <CopyButton text={revealUrl} />
            </div>
          </div>

          {form.lockDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
              🔒 Closes {lockDateLocal}
            </div>
          )}

          {form.email && (
            <div className={`rounded-xl p-3 mb-5 text-sm ${result.emailSent ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
              {result.emailSent
                ? `📧 Links sent to ${form.email}`
                : `📧 Email couldn't be sent — save the links above manually${result.emailError ? ` (${result.emailError})` : ''}`}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/" className="card-button-secondary flex-1 text-center">Home</Link>
            <button
              onClick={() => { setResult(null); setStep(1); setForm({ recipientName: '', creatorName: '', theme: 'birthday', accentColor: '#8b5cf6', message: '', photoUrl: '', playlistUrl: '', lockDate: '', email: '' }) }}
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
            className="h-full bg-gradient-to-r from-blue-400 to-violet-500 rounded-full transition-all duration-500"
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
                    className="relative w-9 h-9 rounded-full transition-all duration-150 hover:scale-110 appearance-none"
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
                  <button onClick={() => update('photoUrl', '')} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 appearance-none">×</button>
                </div>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
                  {photoUploading ? (
                    <div className="border-2 border-dashed border-pink-200 rounded-xl p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CircleProgress pct={uploadProgress} />
                        <p className="text-sm text-gray-500">Uploading photo…</p>
                        <button type="button" onClick={skipPhoto} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors appearance-none">
                          Skip photo
                        </button>
                      </div>
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
                <button type="button" onClick={() => setError('')} className="shrink-0 text-red-400 hover:text-red-600 font-bold appearance-none">×</button>
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">🔒 Lock date &amp; time (optional)</label>
              <input
                type="datetime-local"
                className="card-input"
                value={form.lockDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => update('lockDate', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">No messages accepted after this date and time</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">📧 Email me the links (optional)</label>
              <input
                type="email"
                className="card-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">We&apos;ll send both links so you never lose them</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

            <div className="flex gap-3">
              <button className="card-button-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="card-button-primary flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating…' : '🎉 Create card!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
