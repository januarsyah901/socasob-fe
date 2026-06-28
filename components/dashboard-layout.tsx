'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, FileText, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { 
    href: '/', 
    label: 'Homepage', 
    icon: <Home className="w-5 h-5" /> 
  },
  { 
    href: '/log', 
    label: 'Log', 
    icon: <FileText className="w-5 h-5" /> 
  },
  { 
    href: '/resume', 
    label: 'Resume', 
    icon: <BarChart3 className="w-5 h-5" /> 
  },
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: <Settings className="w-5 h-5" /> 
  },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-white/20 bg-gradient-to-b from-sky-400/90 via-cyan-500/90 to-blue-600/95 text-white shadow-[0_20px_60px_-15px_rgba(14,116,144,0.35)] backdrop-blur-xl transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_45%)]" />

        {/* Sidebar Header */}
        <div className="relative p-6 border-b border-white/20">
          <div className="rounded-2xl border border-white/25 bg-white/15 p-4 shadow-lg backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white">SocaSob</h1>
            <p className="text-sm text-cyan-50/90">Eye Health Monitor</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'border-transparent text-white/90 hover:border-white/20 hover:bg-white/10 hover:shadow-sm'
                )}
              >
                <span className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-cyan-50'
                )}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300',
        sidebarOpen ? 'lg:pl-64' : ''
      )}>
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/90 bg-gradient-to-r from-sky-400/80 via-cyan-200/70 to-blue-200/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(56,189,248,0.15)]">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Logo Socasob.png"
              alt="SocaSob Logo"
              width={40}
              height={5}
              className="object-contain"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-cyan-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}