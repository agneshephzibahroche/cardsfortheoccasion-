import Link from 'next/link'
import { THEMES } from '@/lib/utils'

export default function HomePage() {
  const themes = Object.entries(THEMES)

  return (
    <div className="min-h-screen paper-bg">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="font-serif text-xl font-bold text-gray-800">
          ✉️ Cards for the Occasion
        </div>
        <Link
          href="/create"
          className="card-button-primary text-sm"
        >
          Create a Card
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          ✨ Not just for birthdays
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Cards for{' '}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            every
          </span>{' '}
          occasion
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create a beautiful collaborative card, invite friends to add messages and photos,
          then surprise your someone special with a magical animated reveal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create" className="card-button-primary text-lg px-10 py-4">
            Create a Card →
          </Link>
          <a href="#how-it-works" className="card-button-secondary text-lg px-10 py-4">
            See how it works
          </a>
        </div>

        {/* Floating decorations */}
        <div className="relative mt-16 h-48 pointer-events-none select-none">
          {[
            { emoji: '🎈', x: '5%', delay: '0s', size: 'text-5xl' },
            { emoji: '✨', x: '18%', delay: '0.5s', size: 'text-3xl' },
            { emoji: '🎉', x: '35%', delay: '1s', size: 'text-4xl' },
            { emoji: '✉️', x: '52%', delay: '0.3s', size: 'text-6xl' },
            { emoji: '🎁', x: '70%', delay: '0.8s', size: 'text-4xl' },
            { emoji: '💌', x: '85%', delay: '0.2s', size: 'text-3xl' },
            { emoji: '🎊', x: '95%', delay: '1.2s', size: 'text-3xl' },
          ].map((item, i) => (
            <span
              key={i}
              className={`absolute animate-float ${item.size}`}
              style={{
                left: item.x,
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: item.delay,
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl font-bold text-center text-gray-900 mb-4">
          How it works
        </h2>
        <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
          Three simple steps to create something truly memorable.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              emoji: '✍️',
              title: 'Create your card',
              desc: 'Pick a theme, write your message, add a photo, and optionally include a Spotify or YouTube playlist. Set a lock date so no late additions slip in.',
              color: 'from-pink-400 to-rose-400',
            },
            {
              step: '02',
              emoji: '📤',
              title: 'Invite friends',
              desc: "Share a link with friends, family, or colleagues. They add their own messages and photos — no account needed, just open and write.",
              color: 'from-purple-400 to-indigo-400',
            },
            {
              step: '03',
              emoji: '🎉',
              title: 'Magical reveal',
              desc: 'Send the recipient their special reveal link. The envelope dramatically unseals with animations, confetti, and music playing in the background.',
              color: 'from-amber-400 to-orange-400',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-5 shadow-md`}>
                {item.emoji}
              </div>
              <div className="text-xs font-bold text-gray-300 tracking-widest mb-2">STEP {item.step}</div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Themes */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl font-bold text-center text-gray-900 mb-4">
          Every occasion deserves a card
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Eight beautiful themes, each with its own animations, colors, and confetti.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {themes.map(([key, theme]) => (
            <Link
              key={key}
              href="/create"
              className="group p-5 rounded-2xl border-2 border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center"
              style={{ background: `linear-gradient(135deg, ${theme.envelopeColor}, ${theme.envelopeFlapColor}50)` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {theme.emoji}
              </div>
              <div className="font-semibold text-gray-800 text-sm">{theme.label}</div>
              <div className="text-xs text-gray-400 mt-1">{theme.decorations.slice(0, 3).join(' ')}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reveal preview */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Stars */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
          <div className="relative z-10">
            <div className="text-7xl mb-6 animate-float">✉️</div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              A reveal like no other
            </h2>
            <p className="text-white/70 text-lg max-w-lg mx-auto mb-8">
              The recipient clicks their link and watches their envelope dramatically unseal —
              complete with confetti, music, and every message tucked inside like a card stuffed with love.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {['✨ 3D envelope animation', '🎊 Confetti burst', '🎵 Music player', '📝 Sticky notes', '📸 Polaroid photos', '🔒 Lock date'].map((f) => (
                <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-white/80 backdrop-blur-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
          Ready to make someone&apos;s day?
        </h2>
        <p className="text-gray-500 text-lg mb-8">Free, no account needed.</p>
        <Link href="/create" className="card-button-primary text-xl px-14 py-5">
          Create a Card →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>Cards for the Occasion · Made with ❤️ for every milestone</p>
      </footer>
    </div>
  )
}
