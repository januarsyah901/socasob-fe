import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'

const geistSans = Inter({ variable: '--font-geist-sans', subsets: ['latin'] })
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <SocketProvider>
          {children}
        </SocketProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
