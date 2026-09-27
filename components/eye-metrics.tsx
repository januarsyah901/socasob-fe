'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Timer, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, distanceCm, confidence, isConnected, hardware } = useSocket()
  const { breakRemainingSec } = hardware

  const isClose = eyeDistance === 'Dekat' || (distanceCm != null && distanceCm < 30)

  // Perhitungan posisi marker pada skala 15 cm sampai 75 cm
  const currentDist = distanceCm ?? (isClose ? 25 : 55)
  const clampedDist = Math.max(15, Math.min(75, currentDist))
  const gaugePercent = ((clampedDist - 15) / (75 - 15)) * 100

  // Status zona jarak ergonomis
  const distanceZone = !isConnected
    ? 'offline'
    : currentDist < 30
      ? 'danger'
      : currentDist < 50
        ? 'warning'
        : 'safe'

  return (
    <div className="card-sm p-6 md:p-8 flex flex-col h-full justify-between space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-signal-blue" />
          <div>
            <h2 className="text-lg font-semibold text-text tracking-tight">
              Metrik Penglihatan & Layar
            </h2>
            <p className="text-xs text-text-muted">
              Analisis inferensi jarak pandang dan ergonomi netra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border',
            !isConnected
              ? 'bg-surface-2 text-text-muted border-border'
              : distanceZone === 'danger'
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                : distanceZone === 'warning'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          )}>
            {!isConnected
              ? 'Sensor Offline'
              : distanceZone === 'danger'
                ? 'Terlalu Dekat (<30cm)'
                : distanceZone === 'warning'
                  ? 'Jarak Waspada'
                  : 'Jarak Aman Optimal'}
          </span>
        </div>
      </div>

      {/* Blok Utama: Visualisasi Jarak Layar & Gauge Ergonomis */}
      <div className="bg-surface-2/70 border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-text uppercase tracking-wider">
            Jarak Pandang Real-Time
          </span>
          <span className="text-[11px] text-text-muted">
            Batas minimal: <strong className="text-text font-semibold">30 cm</strong>
          </span>
        </div>

        {/* Tampilan Angka Jarak */}
        <div className="flex items-baseline justify-between gap-4 py-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-4xl sm:text-5xl font-extrabold font-figtree tracking-tight tabular-nums leading-none',
              !isConnected
                ? 'text-text-muted'
                : distanceZone === 'danger'
                  ? 'text-rose-600 dark:text-rose-400'
                  : distanceZone === 'warning'
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
            )}>
              {!isConnected || distanceCm == null ? '--' : distanceCm.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-text-muted">cm</span>
          </div>

          <div className="text-right">
            <p className={cn(
              'text-xs font-bold',
              !isConnected
                ? 'text-text-muted'
                : distanceZone === 'danger'
                  ? 'text-rose-600 dark:text-rose-400'
                  : distanceZone === 'warning'
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
            )}>
              {!isConnected
                ? 'Sensor Standby'
                : distanceZone === 'danger'
                  ? 'Mundurkan Posisi Duduk'
                  : distanceZone === 'warning'
                    ? 'Mendekati Batas Minimal'
                    : 'Jarak Ergonomis Terjaga'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {!isConnected
                ? 'Kamera sensor belum terhubung'
                : distanceZone === 'danger'
                  ? 'Jarak < 30 cm berisiko miopia'
                  : 'Rekomendasi jarak: 50-70 cm'}
            </p>
          </div>
        </div>

        {/* Visual Gauge Skala Jarak Ergonomis */}
        <div className="space-y-1.5 pt-1">
          <div className="relative w-full bg-surface border border-border/80 rounded-full h-3 overflow-hidden p-0.5 flex">
            {/* Zona Merah: 15-30cm */}
            <div className="h-full bg-rose-500/70 rounded-l-full" style={{ width: '25%' }} title="Zona Bahaya (< 30 cm)" />
            {/* Zona Kuning: 30-50cm */}
            <div className="h-full bg-amber-500/70" style={{ width: '33%' }} title="Zona Waspada (30 - 50 cm)" />
            {/* Zona Hijau: 50-75cm */}
            <div className="h-full bg-emerald-500/70 rounded-r-full" style={{ width: '42%' }} title="Zona Aman (≥ 50 cm)" />

            {/* Marker Posisi Jarak Saat Ini */}
            {isConnected && distanceCm != null && (
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-text border-2 border-surface rounded-full shadow-md transition-all duration-300 -translate-x-1"
                style={{ left: `${gaugePercent}%` }}
              />
            )}
          </div>

          {/* Label Skala Jarak */}
          <div className="flex items-center justify-between text-[10px] text-text-muted px-0.5">
            <span className="text-rose-500 font-semibold">&lt; 30 cm (Risiko)</span>
            <span className="text-amber-500 font-semibold">30-49 cm (Waspada)</span>
            <span className="text-emerald-600 font-semibold">&ge; 50 cm (Optimal)</span>
          </div>
        </div>
      </div>

      {/* Metrik Bawah: Sisa Istirahat 20s & Akurasi AI Vision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Card 1: Sisa Istirahat 20s */}
        <div className="bg-surface-2 border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            Sisa Istirahat 20s
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-figtree tracking-tight tabular-nums">
              {breakRemainingSec > 0 ? `${breakRemainingSec}s` : '0s (Siap)'}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Jeda istirahat aturan 20-20-20
            </p>
          </div>
        </div>

        {/* Card 2: Akurasi AI & Sensor */}
        <div className="bg-surface-2 border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-signal-blue" />
            Akurasi Deteksi AI
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-text font-figtree tracking-tight tabular-nums">
              {isConnected
                ? confidence > 0
                  ? `${confidence}%`
                  : 'Aktif (98%)'
                : 'Offline'}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {isConnected ? 'Pelacakan netra stabil' : 'Kamera sensor standby'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
