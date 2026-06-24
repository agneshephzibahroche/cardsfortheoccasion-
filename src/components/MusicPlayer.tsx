'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEmbedUrl } from '@/lib/utils'

interface MusicPlayerProps {
  playlistUrl: string
}

export default function MusicPlayer({ playlistUrl }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const embedUrl = getEmbedUrl(playlistUrl)

  if (!embedUrl) return null

  const isSpotify = playlistUrl.includes('spotify.com')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: isSpotify ? 300 : 280, height: isSpotify ? 152 : 158 }}
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Music Player"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-200 hover:scale-105"
        title={isExpanded ? 'Minimize player' : 'Open music player'}
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg"
        >
          🎵
        </motion.span>
        <span className="text-sm font-medium text-gray-700">
          {isExpanded ? 'Hide player' : 'Play music'}
        </span>
        <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▲'}</span>
      </button>
    </motion.div>
  )
}
