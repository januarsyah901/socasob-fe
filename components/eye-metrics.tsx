'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Clock, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, isConnected, hardware } = useSocket()
  const { breakRemainingSec, workElapsedSec } = hardware

  const isClose = eyeDistance === 'Dekat'

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m === 0) return `${s}s`
    return `${m}m ${s}s`
  }

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

      {/* 3 Susunan Stat: Jarak Layar, Total Tatap Layar, Sisa Waktu Istirahat 20s */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
        {/* Stat 1: Jarak Layar */}
        <div className={cn(
          'p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[110px] min-w-0',
          isClose && isConnected
            ? 'bg-error/5 border-error/30'
            : 'bg-surface-2/60 border-border/60'
        )}>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
              Jarak Layar
            </span>
            <Eye className={cn('w-4 h-4 shrink-0', isClose && isConnected ? 'text-error' : 'text-signal-blue')} />
          </div>
          <div className="mt-2">
            <p className={cn(
              'text-lg sm:text-xl font-bold font-figtree tracking-tight tabular-nums whitespace-nowrap',
              !isConnected
                ? 'text-text-muted'
                : isClose
                  ? 'text-error'
                  : 'text-text'
            )}>
              {!isConnected
                ? 'N/A'
                : isClose
                  ? '< 30 cm'
                  : '≥ 30 cm'
              }
            </p>
            <p className="text-[11px] text-text-muted mt-1 leading-snug truncate">
              {!isConnected
                ? 'Sensor offline'
                : isClose
                  ? 'Mundurkan posisi duduk'
                  : 'Jarak terjaga'
              }
            </p>
          </div>
        </div>

        {/* Stat 2: Total Tatap Layar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-2/60 border border-border/60 flex flex-col justify-between min-h-[110px] min-w-0 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
              Total Tatap Layar
            </span>
            <Clock className="w-4 h-4 text-signal-blue shrink-0" />
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-xl font-bold text-text font-figtree tracking-tight tabular-nums font-mono whitespace-nowrap">
              {formatSec(workElapsedSec)}
            </p>
            <p className="text-[11px] text-text-muted mt-1 leading-snug truncate">
              Waktu aktif di monitor
            </p>
          </div>
        </div>

        {/* Stat 3: Sisa Waktu Istirahat 20s */}
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
