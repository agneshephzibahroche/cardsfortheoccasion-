'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import StickyNote from './StickyNote'
import Polaroid from './Polaroid'
import MusicPlayer from './MusicPlayer'
import { THEMES, ThemeKey, formatDate } from '@/lib/utils'

interface Contribution {
  id: string
  contributorName: string
  message: string
  photoUrl: string | null
  createdAt: string
}

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
  createdAt: string
  contributions: Contribution[]
}

interface EnvelopeRevealProps {
  card: Card
  isFirstReveal: boolean
}

type Phase = 'sealed' | 'hinting' | 'opening' | 'open'

function fireConfetti(colors: string[]) {
  const fire = (ratio: number, opts: confetti.Options) =>
    confetti({ ...opts, origin: { y: 0.55 }, colors, particleCount: Math.floor(200 * ratio) })
  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

export default function EnvelopeReveal({ card, isFirstReveal }: EnvelopeRevealProps) {
  const theme = THEMES[card.theme as ThemeKey] ?? THEMES.birthday
  const accent = card.accentColor || theme.sealColor
  const [phase, setPhase] = useState<Phase>(isFirstReveal ? 'sealed' : 'open')

  const handleOpen = useCallback(() => {
    if (phase !== 'sealed' && phase !== 'hinting') return
    setPhase('opening')
    setTimeout(() => {
      setPhase('open')
      fireConfetti([...theme.confettiColors])
    }, 1400)
  }, [phase, theme.confettiColors])

  useEffect(() => {
    if (!isFirstReveal) return
    const hint = setTimeout(() => setPhase('hinting'), 1200)
    return () => clearTimeout(hint)
  }, [isFirstReveal])

  const photos = [
    ...(card.photoUrl ? [{ src: card.photoUrl, caption: card.creatorName }] : []),
    ...card.contributions.filter((c) => c.photoUrl).map((c) => ({ src: c.photoUrl!, caption: c.contributorName })),
  ]

  const allMessages = [
    { contributorName: card.creatorName, message: card.message, id: 'creator' },
    ...card.contributions.map((c) => ({ contributorName: c.contributorName, message: c.message, id: c.id })),
  ]

  // ── Open state: full card view ──────────────────────────────────
  if (phase === 'open') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} paper-bg`}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="text-5xl sm:text-6xl mb-3">{theme.emoji}</div>
            <h1 className="font-display text-3xl sm:text-5xl mb-2" style={{ color: accent }}>
              For {card.recipientName}
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">
              with love from {card.creatorName}
              {card.contributions.length > 0 && ` & ${card.contributions.length} friend${card.contributions.length > 1 ? 's' : ''}`}
            </p>
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {theme.decorations.map((d, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="text-xl sm:text-2xl animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                  {d}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {allMessages.length > 0 && (
            <div className="mb-10">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Messages inside
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allMessages.map((msg, i) => (
                  <StickyNote key={msg.id} contributorName={msg.contributorName} message={msg.message} index={i} delay={0.4 + i * 0.12} />
                ))}
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mb-10">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                Photos
              </motion.h2>
              <div className="flex flex-wrap justify-center gap-6">
                {photos.map((photo, i) => (
                  <div key={i} style={{ width: 160 }}>
                    <Polaroid src={photo.src} caption={photo.caption} index={i} delay={0.6 + i * 0.15} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center text-gray-400 text-xs">
            Created {formatDate(card.createdAt)} · Cards for the Occasion
          </motion.div>
        </div>

        {card.playlistUrl && <MusicPlayer playlistUrl={card.playlistUrl} />}
      </div>
    )
  }

  // ── Sealed / opening state: envelope animation ──────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-50" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring', stiffness: 100 }} className="relative z-10 flex flex-col items-center w-full">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-white/60 text-xs sm:text-sm tracking-widest uppercase mb-5">
          Something special for {card.recipientName}
        </motion.p>

        {/* Envelope */}
        <div className="envelope-scene">
          <div className="envelope-wrapper cursor-pointer" onClick={handleOpen} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {/* Base */}
            <div className="absolute inset-0 rounded-lg" style={{ background: theme.envelopeColor }} />

            {/* Side folds */}
            <div className="envelope-left-fold" style={{ background: `${theme.envelopeFlapColor}bb` }} />
            <div className="envelope-right-fold" style={{ background: `${theme.envelopeFlapColor}bb` }} />

            {/* Bottom fold */}
            <div className="envelope-bottom-fold" style={{ background: `${theme.envelopeColor}ee` }} />

            {/* Flap */}
            <motion.div
              className="envelope-flap"
              style={{ background: theme.envelopeFlapColor, transformOrigin: 'top center' }}
              animate={{ rotateX: phase === 'opening' ? -180 : 0 }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Wax seal */}
            <AnimatePresence>
              {phase !== 'opening' && (
                <motion.div exit={{ scale: 0, opacity: 0 }} className="wax-seal animate-seal-pulse" style={{ background: accent }}>
                  <span>{theme.emoji}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card peek when opening */}
            <AnimatePresence>
              {phase === 'opening' && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: '-40%', opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
                  className="absolute left-4 right-4 bottom-4 rounded-xl p-4 text-center z-30"
                  style={{ background: theme.cardBg, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                >
                  <div className="text-2xl mb-1">{theme.emoji}</div>
                  <p className="font-display text-lg" style={{ color: accent }}>For {card.recipientName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">with love</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Open button */}
        <AnimatePresence>
          {(phase === 'sealed' || phase === 'hinting') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.8 }} className="mt-8 text-center">
              <motion.button
                animate={phase === 'hinting' ? { scale: [1, 1.06, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.4 }}
                onClick={handleOpen}
                className="px-7 py-3.5 text-white font-bold rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-base sm:text-lg"
              >
                Open your card ✉️
              </motion.button>
              <p className="text-white/40 text-xs sm:text-sm mt-2">Tap to unseal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
