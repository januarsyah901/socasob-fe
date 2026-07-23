'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Home,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/log', label: 'Log', icon: ClipboardList },
  { href: '/resume', label: 'Resume', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('socasob-theme')
    setIsDark(stored === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('socasob-theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-surface border-r border-border z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0">
          <div className="relative w-8 h-8">
            <Image
              src="/images/Logo Socasob.png"
              alt="SocaSob"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-figtree text-lg font-semibold text-text tracking-tight">
            SocaSob
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-signal-blue/10 text-signal-blue'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'bg-signal-blue/10 text-signal-blue'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            <Settings className="w-4 h-4" />
            Pengaturan
          </Link>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-all w-full"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-surface/80 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7">
            <Image
              src="/images/Logo Socasob.png"
              alt="SocaSob"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-figtree text-base font-semibold text-text">SocaSob</span>
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 text-text-muted hover:text-text transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute top-14 right-0 w-64 max-w-[80vw] bg-surface border-l border-border h-full shadow-dreamy-lg animate-fade-in">
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-signal-blue/10 text-signal-blue'
                      : 'text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                  pathname === '/settings'
                    ? 'bg-signal-blue/10 text-signal-blue'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                <Settings className="w-4 h-4" />
                Pengaturan
              </Link>
              <button
                onClick={() => { toggleTheme(); setOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-all w-full"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
