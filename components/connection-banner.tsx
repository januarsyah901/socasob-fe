'use client'

import { useSocket } from '@/lib/socket-context'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function ConnectionBanner() {
  const { isConnected, eyeStatus, robotId } = useSocket()

  // Robot aktif mengirim data (socketio connected + ada robot room)
  const isRobotActive = isConnected && robotId && eyeStatus !== 'disconnected'

  if (!robotId) {
    return (
      <div className="flex items-center justify-between bg-warning/5 border border-warning/25 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
          <span className="text-sm font-semibold text-warning">
            Perangkat Belum Dipilih
          </span>
        </div>
        <Link
          href="/devices"
          className="text-xs font-semibold text-signal-blue hover:underline"
        >
          Pilih Perangkat →
        </Link>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-between bg-error/5 border border-error/25 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
          <span className="text-sm font-semibold text-error">
            Backend Tidak Terhubung
          </span>
        </div>
        <span className="text-xs text-text-muted font-mono">{robotId}</span>
      </div>
    )
  }

  if (eyeStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-between bg-surface-2 border border-border rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
          <span className="text-sm font-semibold text-text-muted">
            Menunggu data dari Robot
          </span>
        </div>
        <span className="text-xs text-text-muted font-mono">{robotId}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-success/5 border border-success/25 rounded-2xl px-5 py-3.5 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
        </span>
        <span className="text-sm font-semibold text-success">
          Robot Aktif — Data Real-time
        </span>
      </div>
      <span className="text-xs text-text-muted font-mono">{robotId}</span>
    </div>
  )
}
