'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export function DashboardLayout({ children, fullWidth }: DashboardLayoutProps) {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('socasob-cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setShowConsent(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookie = () => {
    localStorage.setItem('socasob-cookie-consent', 'accepted')
    setShowConsent(false)
  }

  const declineCookie = () => {
    localStorage.setItem('socasob-cookie-consent', 'declined')
    setShowConsent(false)
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col lg:flex-row">
      <Sidebar />

      <main className={cn('flex-1 lg:ml-64 pb-12')}>
        <div
          className={cn(
            fullWidth ? 'px-4 md:px-6 py-6 md:py-8' : 'max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8'
          )}
        >
          {children}
        </div>
      </main>

      {/* Cookie Consent */}
      {showConsent && (
        <div className="fixed bottom-6 right-6 z-50 card p-4 max-w-sm animate-fade-up shadow-dreamy-lg">
          <p className="text-xs text-text-muted font-figtree">
            SocaSob menggunakan cookie & local storage untuk menyimpan riwayat sesi dan preferensi perangkat.
          </p>
          <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-border text-xs font-semibold">
            <button
              onClick={declineCookie}
              className="text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              Tolak
            </button>
            <button
              onClick={acceptCookie}
              className="text-signal-blue hover:text-signal-blue/80 transition-colors font-bold cursor-pointer"
            >
              Terima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
