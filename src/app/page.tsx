import Link from 'next/link'
import { THEMES } from '@/lib/utils'

const HERO_FLOATS = [
  { emoji: '🎈', x: '4%',  y: '12%', delay: '0s',   size: 'text-4xl sm:text-5xl', opacity: 'opacity-40 sm:opacity-70' },
  { emoji: '✨', x: '88%', y: '8%',  delay: '0.5s',  size: 'text-2xl sm:text-3xl', opacity: 'opacity-30 sm:opacity-60' },
  { emoji: '🎉', x: '82%', y: '52%', delay: '1s',    size: 'text-3xl sm:text-4xl', opacity: 'opacity-30 sm:opacity-55' },
  { emoji: '💌', x: '6%',  y: '62%', delay: '0.3s',  size: 'text-3xl sm:text-4xl', opacity: 'opacity-35 sm:opacity-65' },
  { emoji: '🎁', x: '72%', y: '18%', delay: '0.8s',  size: 'text-2xl sm:text-3xl', opacity: 'opacity-25 sm:opacity-50' },
  { emoji: '🎊', x: '16%', y: '28%', delay: '0.2s',  size: 'text-xl sm:text-2xl',  opacity: 'opacity-20 sm:opacity-40' },
  { emoji: '✉️', x: '90%', y: '72%', delay: '1.2s',  size: 'text-3xl sm:text-4xl', opacity: 'opacity-25 sm:opacity-50' },
  { emoji: '🌟', x: '50%', y: '6%',  delay: '0.6s',  size: 'text-xl sm:text-2xl',  opacity: 'opacity-20 sm:opacity-40' },
]

export default function HomePage() {
  const themes = Object.entries(THEMES)

  return (
    <div className="min-h-screen paper-bg">

      {/* ── Seamless top: nav + hero in one block ── */}
      <div className="relative overflow-hidden pb-16">
        {/* Background floating emojis */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {HERO_FLOATS.map((item, i) => (
            <span
              key={i}
              className={`absolute animate-float-slow ${item.size} ${item.opacity}`}
              style={{ left: item.x, top: item.y, animationDelay: item.delay }}
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Nav */}
        <nav className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <div className="font-heading font-semibold tracking-wide text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
            ✉️ Cards for the Occasion
          </div>
          <Link href="/create" className="card-button-primary !px-5 !py-2.5 text-sm">
            Create a Card
          </Link>
        </nav>

        {/* Hero */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 text-pink-700 dark:text-pink-300 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-5">
            ✨ Not just for birthdays
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-gray-900 dark:text-gray-100 leading-tight mb-5">
            Cards for{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              every
            </span>{' '}
            occasion
          </h1>
          <p className="font-serif text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create a beautiful collaborative card, invite friends to add messages and photos,
            then surprise your someone special with a magical animated reveal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/create" className="card-button-primary text-base sm:text-lg px-8 py-4">
              Create a Card →
            </Link>
            <a href="#how-it-works" className="card-button-secondary text-base sm:text-lg px-8 py-4">
              See how it works
            </a>
          </div>
        </section>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-wide text-center text-gray-900 dark:text-gray-100 mb-3">How it works</h2>
        <p className="font-serif text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto text-sm sm:text-base">Three simple steps to create something truly memorable.</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', emoji: '✍️', title: 'Create your card', desc: 'Pick a theme, colour, and message. Add a photo and a playlist link. Set a lock date so no late additions slip in.', color: 'from-pink-400 to-rose-400' },
            { step: '02', emoji: '📤', title: 'Invite friends', desc: 'Share a link with anyone. They add their own messages and photos — no account needed, just open and write.', color: 'from-purple-400 to-indigo-400' },
            { step: '03', emoji: '🎉', title: 'Magical reveal', desc: 'Send the recipient their reveal link. The envelope dramatically unseals with animations, confetti, and music.', color: 'from-amber-400 to-orange-400' },
          ].map((item) => (
            <div key={item.step} className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl sm:text-2xl mb-4 shadow-md`}>{item.emoji}</div>
              <div className="text-xs font-bold text-gray-300 dark:text-gray-500 tracking-widest mb-1">STEP {item.step}</div>
              <h3 className="font-heading font-semibold text-lg tracking-wide text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
              <p className="font-serif text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Themes ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-wide text-center text-gray-900 dark:text-gray-100 mb-3">Every occasion deserves a card</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto text-sm sm:text-base">Eight beautiful themes, each with its own animations and confetti.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themes.map(([key, theme]) => (
            <Link key={key} href="/create"
              className="group p-4 rounded-2xl border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center"
              style={{ background: `linear-gradient(135deg, ${theme.envelopeColor}, ${theme.envelopeFlapColor}50)` }}
            >
              <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">{theme.emoji}</div>
              <div className="font-bold text-gray-800 text-xs sm:text-sm">{theme.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{theme.decorations.slice(0, 3).join(' ')}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Reveal preview ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/20" style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
          ))}
          <div className="relative z-10">
            <div className="text-5xl sm:text-7xl mb-5 animate-float">✉️</div>
            <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-wide mb-4">A reveal like no other</h2>
            <p className="font-serif text-white/70 text-sm sm:text-lg max-w-lg mx-auto mb-6">
              The recipient clicks their link and watches their envelope dramatically unseal — confetti, music, and every message floating free.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
              {['✨ 3D envelope', '🎊 Confetti', '🎵 Music', '📝 Floating notes', '📸 Photos', '🔒 Lock date'].map((f) => (
                <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-white/80">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center py-16 px-4">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-wide text-gray-900 dark:text-gray-100 mb-3">Ready to make someone&apos;s day?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-7 text-sm sm:text-base">Free, no account needed.</p>
        <Link href="/create" className="card-button-primary text-lg px-10 py-4">Create a Card →</Link>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-gray-400 text-sm">
        Cards for the Occasion · Made with ❤️ for every milestone
      </footer>
    </div>
  )
}
