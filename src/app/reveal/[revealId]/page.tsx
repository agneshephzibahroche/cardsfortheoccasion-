'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EnvelopeReveal from '@/components/EnvelopeReveal'

interface Card {
  id: string
  creatorName: string
  recipientName: string
  theme: string
  message: string
  photoUrl: string | null
  playlistUrl: string | null
  lockDate: string | null
  accentColor: string | null
  reaction: string | null
  createdAt: string
  contributions: {
    id: string
    contributorName: string
    message: string
    photoUrl: string | null
    createdAt: string
  }[]
}

export default function RevealPage({ params }: { params: { revealId: string } }) {
  const [card, setCard] = useState<Card | null>(null)
  const [isFirstReveal, setIsFirstReveal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/reveal/${params.revealId}`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setNotFound(true)
          setError(data.error)
        } else {
          setCard(data.card)
          setIsFirstReveal(data.isFirstReveal)
        }
      })
      .catch(() => {
        setNotFound(true)
        setError('Something went wrong')
      })
      .finally(() => setLoading(false))
  }, [params.revealId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">✉️</div>
          <p className="text-white/60 animate-pulse">Preparing your card…</p>
        </div>
      </div>
    )
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-serif text-2xl font-bold text-gray-800 mb-2">Card not found</h1>
          <p className="text-gray-500 mb-6">{error || 'This link may be invalid.'}</p>
          <Link href="/" className="card-button-primary">Create your own card</Link>
        </div>
      </div>
    )
  }

  return <EnvelopeReveal card={card} isFirstReveal={isFirstReveal} revealId={params.revealId} />
}
