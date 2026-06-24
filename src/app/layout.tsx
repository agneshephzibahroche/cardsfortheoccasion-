import type { Metadata } from 'next'
import { Nunito, Pacifico } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pacifico',
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
      <body className={`${nunito.variable} ${pacifico.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
