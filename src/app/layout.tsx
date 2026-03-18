import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Alejandro Stein',
  description: 'Artist portfolio — Buenos Aires · Tel Aviv · Berlin',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read locale forwarded by middleware so html[lang] reflects the current language
  const headersList = await headers()
  const lang = headersList.get('x-locale') ?? 'en'

  return (
    <html lang={lang} className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
