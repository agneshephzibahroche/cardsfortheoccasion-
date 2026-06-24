import type { Metadata } from 'next'
import { Bebas_Neue, Oswald, Merriweather, Noto_Serif } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-oswald',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
})

export const metadata: Metadata = {
  title: 'Cards for the Occasion',
  description: 'Beautiful collaborative cards for every occasion — birthdays, graduations, weddings, and more.',
  openGraph: {
    title: 'Cards for the Occasion',
    description: 'Create beautiful collaborative cards for any occasion.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebas.variable} ${oswald.variable} ${merriweather.variable} ${notoSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
