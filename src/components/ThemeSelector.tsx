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
          className={`theme-card ${selected === key ? 'selected' : ''}`}
          style={{
            background: selected === key
              ? `linear-gradient(135deg, ${theme.envelopeColor}, ${theme.envelopeFlapColor}60)`
              : '#f9fafb',
          }}
        >
          <div className="text-3xl mb-1">{theme.emoji}</div>
          <div className="text-xs font-semibold text-gray-700">{theme.label}</div>
          {selected === key && (
            <div
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
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
