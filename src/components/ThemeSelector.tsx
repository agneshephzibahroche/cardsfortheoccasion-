'use client'

import { THEMES, ThemeKey } from '@/lib/utils'

interface ThemeSelectorProps {
  selected: ThemeKey
  onChange: (theme: ThemeKey) => void
}

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, theme]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`theme-card overflow-hidden ${selected === key ? 'selected' : ''}`}
          style={{ background: `linear-gradient(135deg, ${theme.envelopeColor}, ${theme.envelopeFlapColor})` }}
        >
          <div className="absolute inset-0 hidden dark:block bg-black/50 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-3xl mb-1">{theme.emoji}</div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-100">{theme.label}</div>
          </div>
          {selected === key && (
            <div
              className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: theme.accent }}
            >
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
