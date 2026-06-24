'use client'

import { THEMES, ThemeKey } from '@/lib/utils'

interface ThemeSelectorProps {
  selected: ThemeKey
  onChange: (theme: ThemeKey) => void
}

const CARD_COLORS: Record<string, string> = {
  birthday:      '#f472b6',
  graduation:    '#60a5fa',
  wedding:       '#c084fc',
  baby:          '#38bdf8',
  anniversary:   '#fb7185',
  congratulations: '#fbbf24',
  thankyou:      '#34d399',
  getwell:       '#fb923c',
}

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, theme]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`theme-card ${selected === key ? 'selected' : ''}`}
          style={{ backgroundColor: CARD_COLORS[key] ?? theme.accent }}
        >
          <div className="text-3xl mb-1">{theme.emoji}</div>
          <div className="text-xs font-semibold text-white drop-shadow">{theme.label}</div>
          {selected === key && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
