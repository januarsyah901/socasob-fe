'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: { (type: ToastType, message: string): void; success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  error: <AlertCircle className="w-4 h-4 text-error" />,
  info: <Info className="w-4 h-4 text-signal-blue" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
}

const bgStyles: Record<ToastType, string> = {
  success: 'border-success/20',
  error: 'border-error/20',
  info: 'border-signal-blue/20',
  warning: 'border-warning/20',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => { setMounted(true) }, [])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = Object.assign(addToast, {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  })

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && createPortal(
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 p-4 bg-surface border rounded-2xl shadow-dreamy-lg animate-fade-up',
                bgStyles[t.type]
              )}
            >
              <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
              <p className="text-sm text-text flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
