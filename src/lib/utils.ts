export const THEMES = {
  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    gradient: 'from-pink-400 to-purple-500',
    bg: 'from-pink-50 via-rose-50 to-purple-50',
    cardBg: '#fff0f8',
    envelopeColor: '#fce7f3',
    envelopeFlapColor: '#f9a8d4',
    accent: '#ec4899',
    textColor: '#831843',
    decorations: ['🎈', '🎉', '✨', '🥳', '🎁', '🎀'],
    confettiColors: ['#ec4899', '#a855f7', '#f9a8d4', '#ffd700', '#ff69b4'],
    sealColor: '#c026d3',
  },
  graduation: {
    label: 'Graduation',
    emoji: '🎓',
    gradient: 'from-blue-600 to-yellow-500',
    bg: 'from-blue-50 via-indigo-50 to-yellow-50',
    cardBg: '#f0f7ff',
    envelopeColor: '#dbeafe',
    envelopeFlapColor: '#93c5fd',
    accent: '#1d4ed8',
    textColor: '#1e3a8a',
    decorations: ['🎓', '⭐', '📜', '🏆', '✨', '📚'],
    confettiColors: ['#1d4ed8', '#d97706', '#bfdbfe', '#fef08a', '#60a5fa'],
    sealColor: '#1d4ed8',
  },
  wedding: {
    label: 'Wedding',
    emoji: '💍',
    gradient: 'from-rose-300 to-pink-400',
    bg: 'from-rose-50 via-pink-50 to-white',
    cardBg: '#fff8f8',
    envelopeColor: '#ffe4e6',
    envelopeFlapColor: '#fda4af',
    accent: '#e11d48',
    textColor: '#9f1239',
    decorations: ['💍', '💐', '🥂', '✨', '❤️', '🕊️'],
    confettiColors: ['#fda4af', '#f43f5e', '#ffffff', '#d4af37', '#fce7f3'],
    sealColor: '#be123c',
  },
  baby: {
    label: 'Baby Shower',
    emoji: '👶',
    gradient: 'from-sky-300 to-pink-300',
    bg: 'from-sky-50 via-blue-50 to-pink-50',
    cardBg: '#f0f9ff',
    envelopeColor: '#e0f2fe',
    envelopeFlapColor: '#7dd3fc',
    accent: '#0284c7',
    textColor: '#0c4a6e',
    decorations: ['👶', '🍼', '⭐', '🌈', '💙', '🌙'],
    confettiColors: ['#7dd3fc', '#f9a8d4', '#86efac', '#fde68a', '#c4b5fd'],
    sealColor: '#0284c7',
  },
  anniversary: {
    label: 'Anniversary',
    emoji: '❤️',
    gradient: 'from-red-500 to-rose-400',
    bg: 'from-red-50 via-rose-50 to-pink-50',
    cardBg: '#fff5f5',
    envelopeColor: '#fee2e2',
    envelopeFlapColor: '#fca5a5',
    accent: '#dc2626',
    textColor: '#7f1d1d',
    decorations: ['❤️', '💕', '🥂', '✨', '💝', '🌹'],
    confettiColors: ['#ef4444', '#ec4899', '#fca5a5', '#d4af37', '#fda4af'],
    sealColor: '#dc2626',
  },
  congratulations: {
    label: 'Congratulations',
    emoji: '🎉',
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'from-yellow-50 via-amber-50 to-orange-50',
    cardBg: '#fffbeb',
    envelopeColor: '#fef3c7',
    envelopeFlapColor: '#fcd34d',
    accent: '#d97706',
    textColor: '#78350f',
    decorations: ['🎉', '🏆', '⭐', '✨', '🎊', '🌟'],
    confettiColors: ['#f59e0b', '#f97316', '#fef08a', '#fed7aa', '#fb923c'],
    sealColor: '#d97706',
  },
  thankyou: {
    label: 'Thank You',
    emoji: '🌸',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'from-emerald-50 via-teal-50 to-green-50',
    cardBg: '#f0fdf4',
    envelopeColor: '#d1fae5',
    envelopeFlapColor: '#6ee7b7',
    accent: '#059669',
    textColor: '#064e3b',
    decorations: ['🌸', '💚', '✨', '🌿', '🙏', '🌼'],
    confettiColors: ['#34d399', '#6ee7b7', '#a7f3d0', '#fde68a', '#86efac'],
    sealColor: '#059669',
  },
  getwell: {
    label: 'Get Well Soon',
    emoji: '🌻',
    gradient: 'from-yellow-400 to-green-400',
    bg: 'from-yellow-50 via-lime-50 to-green-50',
    cardBg: '#fefce8',
    envelopeColor: '#fef9c3',
    envelopeFlapColor: '#fde047',
    accent: '#65a30d',
    textColor: '#365314',
    decorations: ['🌻', '💛', '🌿', '✨', '🌈', '🌞'],
    confettiColors: ['#facc15', '#86efac', '#bbf7d0', '#fde68a', '#a3e635'],
    sealColor: '#65a30d',
  },
} as const

export type ThemeKey = keyof typeof THEMES

export const STICKY_COLORS = [
  { bg: '#fef9c3', border: '#fde047', shadow: '#ca8a04' },
  { bg: '#dcfce7', border: '#86efac', shadow: '#16a34a' },
  { bg: '#dbeafe', border: '#93c5fd', shadow: '#2563eb' },
  { bg: '#fce7f3', border: '#f9a8d4', shadow: '#db2777' },
  { bg: '#ede9fe', border: '#c4b5fd', shadow: '#7c3aed' },
  { bg: '#ffedd5', border: '#fed7aa', shadow: '#ea580c' },
  { bg: '#fae8ff', border: '#e879f9', shadow: '#a21caf' },
]

export function getEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    if (url.includes('spotify.com')) {
      const match = url.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/)
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`
      }
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const listMatch = url.match(/[?&]list=([^&]+)/)
      if (listMatch) {
        return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}&autoplay=1`
      }
      const vidMatch = url.match(/(?:youtu\.be\/|[?&]v=)([^&]+)/)
      if (vidMatch) {
        return `https://www.youtube.com/embed/${vidMatch[1]}?autoplay=1`
      }
    }
  } catch {
    return null
  }
  return null
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isCardLocked(lockDate: string | Date | null): boolean {
  if (!lockDate) return false
  return new Date() > new Date(lockDate)
}
