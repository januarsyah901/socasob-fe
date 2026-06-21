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
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 text-white border-r border-slate-800/70 shadow-2xl transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/95">
          <h1 className="text-2xl font-bold text-white">
            SocaSob
          </h1>
          <p className="text-sm text-slate-300">Eye Health Monitor</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-200 hover:bg-slate-800'
              )}
            >
              <span className={cn(
                'transition-colors',
                pathname === item.href ? 'text-white' : 'text-slate-300'
              )}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
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
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-slate-950 dark:to-slate-950 border-b border-cyan-200 dark:border-slate-950">
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
            className="p-2 hover:bg-cyan-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-900 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900 dark:text-gray-300" />
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