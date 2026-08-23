'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Shield, AlertTriangle, CheckCircle2, Sparkles, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, eyeStatus, confidence, isConnected } = useSocket()

  const isClose = eyeDistance === 'Dekat'

  const statusColor = () => {
    switch (eyeStatus) {
      case 'normal': return 'text-success'
      case 'risk_myopia': return 'text-warning'
      case 'risk_fatigue': return 'text-error'
      default: return 'text-text-muted'
    }
  }

  const statusLabel = () => {
    switch (eyeStatus) {
      case 'normal': return 'Normal / Sehat'
      case 'risk_myopia': return 'Risiko Jarak Dekat'
      case 'risk_fatigue': return 'Kelelahan Mata'
      default: return 'Tidak Terhubung'
    }
  }

  const statusDesc = () => {
    switch (eyeStatus) {
      case 'normal': return 'Kondisi mata Anda segar dan berkedip dengan sehat.'
      case 'risk_myopia': return 'Jarak layar terlalu dekat terdeteksi terus-menerus.'
      case 'risk_fatigue': return 'Mata Anda lelah. Harap beristirahat 20 detik.'
      default: return 'Hubungkan kamera SocaSob Anda di menu Pengaturan.'
    }
  }

  const confidenceBarColor = () => {
    if (confidence >= 85) return 'bg-success'
    if (confidence >= 65) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
      {/* Card Jarak Layar */}
      <div className={cn(
        'card-sm p-6 flex flex-col justify-between min-h-[200px] transition-all duration-300 relative overflow-hidden',
        isClose && isConnected ? 'border-error/40 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-border'
      )}>
        {/* Latar Belakang Desain Dekoratif */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-signal-blue/5 rounded-full blur-2xl pointer-events-none" />

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
                  ? 'Kurang dari 30 cm — mundur sedikit!'
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
                <Gauge className="w-3.5 h-3.5 text-text-muted/70" />
                CONFIDENCE ML
              </span>
              <span className="font-mono text-text">{confidence}%</span>
            </div>
            <div className="w-full bg-surface-2 border border-border rounded-full h-1.5 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', confidenceBarColor())}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Status Kelelahan */}
      <div className={cn(
        'card-sm p-6 flex flex-col justify-between min-h-[200px] transition-all duration-300 relative overflow-hidden',
        eyeStatus === 'risk_fatigue' && isConnected ? 'border-error/40 shadow-[0_0_20px_rgba(220,38,38,0.08)] animate-pulse-glow-red' :
        eyeStatus === 'risk_myopia' && isConnected ? 'border-warning/40 shadow-[0_0_20px_rgba(217,119,6,0.08)]' : 'border-border'
      )}>
        {/* Latar Belakang Desain Dekoratif */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-active-teal/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Kesehatan Netra
            </span>
            <span className="w-2 h-2 rounded-full shrink-0 bg-border" />
          </div>

          {/* Value Utama */}
          <div>
            <div className={cn('text-3xl font-black tracking-tight leading-none', statusColor())}>
              {statusLabel()}
            </div>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              {statusDesc()}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
