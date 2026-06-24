'use client'

import { motion } from 'framer-motion'
import { STICKY_COLORS } from '@/lib/utils'

interface StickyNoteProps {
  contributorName: string
  message: string
  index: number
  delay?: number
}

export default function StickyNote({ contributorName, message, index, delay = 0 }: StickyNoteProps) {
  const color = STICKY_COLORS[index % STICKY_COLORS.length]
  const rotations = [-3, 1.5, -1, 2.5, -2, 1, -1.5]
  const rotation = rotations[index % rotations.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: rotation - 10, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ rotate: 0, scale: 1.05, zIndex: 20 }}
      className="sticky-note"
      style={{
        '--rotation': `${rotation}deg`,
        backgroundColor: color.bg,
        borderTop: `3px solid ${color.border}`,
        boxShadow: `2px 3px 12px rgba(0,0,0,0.1), 0 0 0 1px ${color.border}40`,
      } as React.CSSProperties}
    >
      <div className="pt-3">
        <p className="text-sm font-bold mb-2" style={{ color: color.shadow }}>
          {contributorName}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </motion.div>
  )
}
