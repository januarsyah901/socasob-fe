'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/layout/avatar'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  ClipboardList,
  LineChart,
  ScrollText,
  MessagesSquare,
  Bot,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log Harian', icon: ClipboardList },
  { href: '/resume', label: 'Tren & Resume', icon: LineChart },
  { href: '/reports', label: 'Laporan Medis', icon: ScrollText },
  { href: '/companion', label: 'Teman Soca', icon: MessagesSquare },
  { href: '/devices', label: 'Perangkat Robot', icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const displayName = user?.fullName || 'Pengguna'

  const handleLogout = () => {
    logout()
    setOpen(false)
    router.push('/login')
  }

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

  const nav = (
    <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
      {NAV.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-ice-tint text-signal-blue dark:bg-(--surface-2) dark:text-white font-bold shadow-sm'
                : 'text-muted hover:text-body hover:bg-(--surface-2)'
            )}
          >
            <item.icon
              className={cn(
                'size-4.5 shrink-0',
                active ? 'text-signal-blue dark:text-white' : 'text-muted'
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const footer = (
    <div className="mt-auto pt-4 space-y-4 border-t border-border/50">
      {/* Profile Section */}
      <div className="px-1">
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 flex-1 min-w-0 group"
          title="Profil & pengaturan"
        >
          <UserAvatar name={displayName} className="size-9 shrink-0 text-sm shadow-sm" />
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-body truncate group-hover:text-signal-blue transition-colors">
              {displayName}
            </span>
            <span className="block text-[11px] font-medium text-muted truncate">
              {user?.email || 'Soca Care Explorer'}
            </span>
          </div>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={toggleTheme}
          aria-label="Ganti Tema"
          className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-(--surface-2) hover:bg-border/40 border border-border/50 text-xs font-bold text-muted hover:text-body transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          {isDark ? 'Terang' : 'Gelap'}
        </button>

        <button
          onClick={handleLogout}
          aria-label="Keluar"
          className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-500 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="no-print lg:hidden sticky top-0 z-40 surface border-b border-border flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md">
        <Link href="/" className="flex items-center px-2 py-1">
          <span className="font-extrabold text-2xl tracking-tighter text-signal-blue lowercase">
            socasob
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="no-print lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 surface border-r border-border p-4 flex flex-col animate-fade-in bg-surface z-10 shadow-dreamy-lg">
            <div className="flex items-center justify-between mb-5">
              <span className="font-extrabold text-2xl tracking-tighter text-signal-blue lowercase px-2">
                socasob
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="p-2 text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="no-print hidden lg:flex w-64 shrink-0 flex-col surface border-r border-base p-4 sticky top-0 h-screen overflow-y-auto z-40">
        <Link href="/" className="flex items-center px-2 mb-6">
          <span className="font-extrabold text-2xl tracking-tighter text-signal-blue lowercase font-figtree">
            socasob
          </span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  )
}
