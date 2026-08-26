import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { ThemeApplier } from '@/components/layout/theme-applier'
import { PwaRegistrar } from '@/components/layout/pwa-registrar'
import { SocketProvider } from '@/lib/socket-context'
import { ToastProvider } from '@/components/ui/toast'
import { SplashScreen } from '@/components/layout/splash-screen'
import { AuthProvider } from '@/lib/auth-context'

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
    icon: '/images/logo-socasob.png',
    apple: '/images/logo-socasob.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontFigtree.variable} suppressHydrationWarning>
      <body className="font-figtree antialiased bg-bg text-text">
        <SplashScreen />
        <PwaRegistrar />
        <ThemeApplier />
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>{children}</SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

