'use client'

import { motion } from 'framer-motion'

interface PolaroidProps {
  src: string
  caption?: string
  index: number
  delay?: number
}

export default function Polaroid({ src, caption, index, delay = 0 }: PolaroidProps) {
  const rotations = [3, -2, 4, -3, 2, -4, 1]
  const rotation = rotations[index % rotations.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation + 10, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 180,
        damping: 18,
      }}
      whileHover={{ rotate: 0, scale: 1.08, zIndex: 20 }}
      className="polaroid"
      style={{
        '--rotation': `${rotation}deg`,
      } as React.CSSProperties}
    >
      <div className="w-full aspect-square overflow-hidden bg-gray-100">
        <img
          src={src}
          alt={caption || 'Photo'}
          className="w-full h-full object-cover"
        />
      </div>
      {caption && (
        <p className="text-center text-xs text-gray-500 mt-1 font-handwriting truncate">
          {caption}
        </p>
      )}
    </motion.div>
  )
}
