import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Quicksand } from 'next/font/google'

import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Be My Valentine?',
  description: 'A heartfelt digital love letter and scavenger hunt for your special someone',
}

export const viewport: Viewport = {
  themeColor: '#e84a7a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
