'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocket } from '@/lib/socket-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { isConnected } = useSocket()
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show cookie consent after a brief delay if not accepted yet
  useEffect(() => {
    const consent = localStorage.getItem('socasob-cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptCookie = () => {
    localStorage.setItem('socasob-cookie-consent', 'accepted')
    setShowCookieConsent(false)
  }

  const handleDeclineCookie = () => {
    localStorage.setItem('socasob-cookie-consent', 'declined')
    setShowCookieConsent(false)
  }

  return (
    <div className="min-h-screen bg-parchment text-charcoal flex flex-col font-af selection:bg-signal-blue/10 selection:text-ink-black">
      {/* Floating Navigation Pill */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl">
        <div className="bg-white/40 backdrop-blur-md border border-twilight/15 rounded-nav px-4 py-2.5 flex items-center justify-between shadow-sm">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 pl-2">
            <div className="relative w-9 h-9">
              <Image
                src="/images/Logo Socasob.png"
                alt="Logo SocaSob"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-ppmondwest text-lg tracking-tight text-ink-black">SocaSob</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={cn(
                "text-[15px] font-medium transition-colors hover:text-ink-black",
                pathname === '/' ? "text-ink-black" : "text-ash"
              )}
            >
              Beranda
            </Link>
            <Link
              href="/log"
              className={cn(
                "text-[15px] font-medium transition-colors hover:text-ink-black",
                pathname === '/log' ? "text-ink-black" : "text-ash"
              )}
            >
              Log
            </Link>
            <Link
              href="/resume"
              className={cn(
                "text-[15px] font-medium transition-colors hover:text-ink-black",
                pathname === '/resume' ? "text-ink-black" : "text-ash"
              )}
            >
              Resume
            </Link>
          </nav>

          {/* Right Action / CTA */}
          <div className="hidden md:block">
            {pathname === '/settings' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-linen border border-mist rounded-lg text-xs font-medium text-ash">
                <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-red-400")} />
                {isConnected ? "Connected" : "Offline"}
              </div>
            ) : (
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-signal-blue border border-signal-blue rounded-lg px-3 py-1 hover:bg-signal-blue/5 transition-all"
              >
                <span>Pengaturan</span>
                <span className="w-4 h-4 rounded-full border border-signal-blue flex items-center justify-center text-[10px]">
                  →
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-ash hover:text-ink-black transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 mx-2 bg-white/95 backdrop-blur-md border border-twilight/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3 md:hidden">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-[15px] font-medium py-1 px-2 rounded-lg transition-colors",
                pathname === '/' ? "bg-linen text-ink-black font-semibold" : "text-ash hover:bg-linen/50"
              )}
            >
              Beranda
            </Link>
            <Link
              href="/log"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-[15px] font-medium py-1 px-2 rounded-lg transition-colors",
                pathname === '/log' ? "bg-linen text-ink-black font-semibold" : "text-ash hover:bg-linen/50"
              )}
            >
              Log
            </Link>
            <Link
              href="/resume"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-[15px] font-medium py-1 px-2 rounded-lg transition-colors",
                pathname === '/resume' ? "bg-linen text-ink-black font-semibold" : "text-ash hover:bg-linen/50"
              )}
            >
              Resume
            </Link>
            <div className="border-t border-mist/50 pt-2 mt-1">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-[15px] font-medium text-signal-blue py-1.5 px-2 rounded-lg hover:bg-signal-blue/5 transition-colors"
              >
                <span>Pengaturan</span>
                <span className="w-4.5 h-4.5 rounded-full border border-signal-blue flex items-center justify-center text-[10px]">
                  →
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-28 pb-16">
        {children}
      </main>

      {/* Book-like Footer */}
      <footer className="bg-paper border-t border-mist py-12 md:py-16 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-ppmondwest text-2xl md:text-3xl text-graphite font-normal max-w-xl leading-tight">
              Mata yang sehat adalah jendela bagi jiwa yang tenang. Terus pantau dan jaga keharmonisan interaksi Anda dengan layar.
            </h2>
            <p className="font-af text-xs text-ash tracking-wide uppercase">
              SocaSob colophon — Karya editorial kesehatan mata digital
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-between h-full gap-4">
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-ash hover:text-ink-black transition-colors font-medium">Beranda</Link>
              <Link href="/log" className="text-ash hover:text-ink-black transition-colors font-medium">Log</Link>
              <Link href="/resume" className="text-ash hover:text-ink-black transition-colors font-medium">Resume</Link>
              <Link href="/settings" className="text-ash hover:text-ink-black transition-colors font-medium">Pengaturan</Link>
            </div>
            <p className="text-xs text-ash font-mono mt-auto">
              © {new Date().getFullYear()} SocaSob. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-6 right-6 z-50 bg-paper border border-mist shadow-sm rounded-lg p-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-xs text-charcoal leading-relaxed font-af">
            SocaSob menggunakan cookie untuk meningkatkan pengalaman Anda memantau kesehatan mata.
          </div>
          <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-mist/30 text-xs font-medium font-af">
            <button
              onClick={handleDeclineCookie}
              className="text-ash hover:text-ink-black transition-colors py-0.5 px-1.5"
            >
              Tolak
            </button>
            <span className="text-fog">|</span>
            <button
              onClick={handleAcceptCookie}
              className="text-twilight hover:text-ink-black transition-colors py-0.5 px-1.5 font-semibold"
            >
              Terima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}