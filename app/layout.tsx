import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { ThemeApplier } from '@/components/layout/theme-applier'
import { SocketProvider } from '@/lib/socket-context'
import { ToastProvider } from '@/components/ui/toast'

const fontFigtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SocaSob — Smart Eye Health Monitoring & Myopia Prevention',
  description:
    'Sistem monitoring kesehatan mata cerdas terintegrasi IoT, AI Computer Vision, evaluasi risiko miopia, dan panduan relaksasi 20-20-20.',
  manifest: '/manifest.json',
  themeColor: '#4e9ad9',
  icons: {
    icon: '/images/Logo Socasob.png',
    apple: '/images/Logo Socasob.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontFigtree.variable} suppressHydrationWarning>
      <body className="font-figtree antialiased bg-bg text-text">
        <ThemeApplier />
        <ToastProvider>
          <SocketProvider>{children}</SocketProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
