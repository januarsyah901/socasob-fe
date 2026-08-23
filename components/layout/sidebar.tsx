'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Home,
  ClipboardList,
  BarChart3,
  Bot,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  FileText,
  Eye,
  Sparkles,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EyeExerciseModal } from '@/components/exercise/eye-exercise-modal'

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/log', label: 'Log Harian', icon: ClipboardList },
  { href: '/resume', label: 'Resume Analitik', icon: BarChart3 },
  { href: '/reports', label: 'Laporan Medis', icon: FileText },
  { href: '/devices', label: 'Perangkat Robot', icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false)

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
      <aside className="no-print hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-surface border-r border-border z-40">
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-signal-blue/10 flex items-center justify-center">
            <Image
              src="/images/Logo Socasob.png"
              alt="SocaSob"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-figtree text-base font-bold text-text tracking-tight leading-tight">
              SocaSob
            </span>
            <span className="text-[10px] text-text-muted font-semibold tracking-wider uppercase">
              Sobat Mata AI
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi Utama">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-signal-blue/12 text-signal-blue shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-signal-blue' : 'text-text-muted')} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Quick Action: Senam Mata Button */}
          <div className="pt-3 pb-1">
            <button
              onClick={() => setExerciseModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-signal-blue/10 to-active-teal/10 border border-signal-blue/20 text-text hover:shadow-dreamy transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-signal-blue group-hover:scale-110 transition-transform" />
                <div className="text-xs">
                  <p className="font-bold leading-none">Senam Mata</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Aturan 20-20-20</p>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-active-teal" />
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all',
              pathname === '/settings'
                ? 'bg-signal-blue/12 text-signal-blue'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-all w-full cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="no-print md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-surface/90 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <Image
              src="/images/Logo Socasob.png"
              alt="SocaSob"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-figtree text-base font-bold text-text">SocaSob</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExerciseModalOpen(true)}
            className="p-2 rounded-xl bg-signal-blue/10 text-signal-blue text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[11px]">Senam Mata</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="no-print md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div className="absolute top-14 right-0 w-64 max-w-[85vw] bg-surface border-l border-border h-full shadow-dreamy-lg animate-fade-in flex flex-col justify-between pb-16">
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-signal-blue/12 text-signal-blue'
                        : 'text-text-muted hover:text-text hover:bg-surface-2'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <div className="border-t border-border my-2" />

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all',
                  pathname === '/settings'
                    ? 'bg-signal-blue/12 text-signal-blue'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan</span>
              </Link>
              <button
                onClick={() => {
                  toggleTheme()
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-all w-full text-left"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Global Eye Exercise Modal */}
      <EyeExerciseModal open={exerciseModalOpen} onClose={() => setExerciseModalOpen(false)} />
    </>
  )
}
