import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'

const fontPpmondwest = Fraunces({
  variable: '--font-ppmondwest',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const fontAf = Inter({
  variable: '--font-af',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const geistMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SocaSob - Eye Health Monitoring',
  description: 'Smart eye health monitoring system with real-time analytics',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'images/Logo SocaSob.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'images/Logo SocaSob Dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'images/Logo SocaSob.png',
        type: 'image/svg+xml',
      },
    ],
    apple: 'images/Logo SocaSob.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontPpmondwest.variable} ${fontAf.variable} ${geistMono.variable}`}>
      <body className="font-af antialiased bg-parchment text-charcoal">
        <SocketProvider>
          {children}
        </SocketProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
