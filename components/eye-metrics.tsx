'use client'

import { useSocket } from '@/lib/socket-context'
import { Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, confidence, isConnected } = useSocket()

  const isClose = eyeDistance === 'Dekat'

  const confidenceBarColor = () => {
    if (confidence >= 85) return 'bg-success'
    if (confidence >= 65) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Card Jarak Layar */}
      <div className={cn(
        'card-sm p-6 flex-1 flex flex-col justify-between min-h-[200px] transition-all duration-300 relative overflow-hidden',
        isClose && isConnected ? 'border-error/40 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-border'
      )}>
        {/* Latar Belakang Desain Dekoratif */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-signal-blue/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Jarak Layar
            </span>
            {isConnected ? (
              <span className={cn(
                'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                isClose ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
              )}>
                {isClose ? 'Dekat' : 'Aman'}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-2 text-text-muted">
                Offline
              </span>
            )}
          </div>

          {/* Value Utama */}
          <div>
            <div className={cn(
              'text-3xl font-black tracking-tight leading-none',
              isClose && isConnected ? 'text-error' : isConnected ? 'text-success' : 'text-text-muted'
            )}>
              {!isConnected
                ? 'N/A'
                : isClose
                  ? 'Terlalu Dekat'
                  : 'Jarak Aman'
              }
            </div>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              {!isConnected
                ? 'Hubungkan kamera sensor di Pengaturan.'
                : isClose
                  ? 'Kurang dari 30 cm, mundur sedikit!'
                  : 'Jarak aman ≥ 30 cm. Pertahankan!'
              }
            </p>
          </div>
        </div>

        {/* Meter ML Confidence */}
        {isConnected && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between text-[10px] font-bold text-text-muted mb-1.5">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-text-muted/70" aria-hidden />
                CONFIDENCE ML
              </span>
              <span className="font-mono text-text">{confidence}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Tingkat kepercayaan inferensi machine learning"
              aria-valuenow={confidence}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full bg-surface-2 border border-border rounded-full h-1.5 overflow-hidden"
            >
              <div
                className={cn('h-full rounded-full transition-all duration-500', confidenceBarColor())}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
