'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, distanceCm, isConnected, hardware } = useSocket()
  const { breakRemainingSec } = hardware

  const isClose = eyeDistance === 'Dekat'

  return (
    <div className="card-sm p-6 md:p-8 flex flex-col h-full justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-signal-blue" />
          <h2 className="text-lg font-semibold text-text tracking-tight">
            Metrik Penglihatan & Layar
          </h2>
        </div>
        {isClose && isConnected && (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider animate-pulse">
            Terlalu Dekat
          </span>
        )}
      </div>

      {/* 2 Susunan Stat: Jarak Layar & Sisa Waktu Istirahat 20s */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
        {/* Stat 1: Jarak Layar */}
        <div className={cn(
          'p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[110px] min-w-0',
          !isConnected
            ? 'bg-surface-2/60 border-border/60'
            : isClose
              ? 'bg-error/5 border-error/30'
              : 'bg-emerald-500/5 border-emerald-500/30'
        )}>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
              Jarak Layar
            </span>
            <span className={cn(
              'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border',
              !isConnected
                ? 'bg-surface-2 text-text-muted border-border'
                : isClose
                  ? 'bg-error/10 text-error border-error/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            )}>
              {!isConnected ? 'Offline' : (isClose ? 'Dekat' : 'Aman')}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className={cn(
                'text-2xl sm:text-3xl font-bold font-figtree tracking-tight tabular-nums whitespace-nowrap',
                !isConnected
                  ? 'text-text-muted'
                  : isClose
                    ? 'text-error'
                    : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {!isConnected || distanceCm == null
                  ? '--'
                  : distanceCm.toFixed(1)
                }{' '}
                <span className="text-xs font-semibold text-text-muted">cm</span>
              </p>
              <span className={cn(
                'text-xs font-bold whitespace-nowrap',
                !isConnected
                  ? 'text-text-muted'
                  : isClose
                    ? 'text-error'
                    : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {!isConnected ? 'N/A' : (isClose ? 'Terlalu Dekat' : 'Jarak Aman')}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5 leading-snug truncate">
              {!isConnected
                ? 'Hubungkan robot / kirim frame via WebSocket.'
                : isClose
                  ? 'Kurang dari 30 cm, silakan mundur sedikit.'
                  : 'Jarak aman ≥ 30 cm. Pertahankan!'}
            </p>
          </div>
        </div>

        {/* Stat 2: Sisa Waktu Istirahat 20s */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-2/60 border border-border/60 flex flex-col justify-between min-h-[110px] min-w-0 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
              Sisa Istirahat 20s
            </span>
            <Timer className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-figtree tracking-tight tabular-nums font-mono whitespace-nowrap">
              {breakRemainingSec > 0 ? `${breakRemainingSec}s` : '0s (Siap)'}
            </p>
            <p className="text-[11px] text-text-muted mt-1 leading-snug truncate">
              Jeda aturan 20-20-20
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
