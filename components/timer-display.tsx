'use client'

import { useSocket } from '@/lib/socket-context'
import { useEffect, useState } from 'react'
import { Clock, Activity, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function TimerDisplay() {
  const { timer, eyeStatus, isConnected, robotId, hardware } = useSocket()
  const [localTimer, setLocalTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (timer && (timer.hours > 0 || timer.minutes > 0 || timer.seconds > 0)) {
      setLocalTimer(timer)
    } else if (hardware.workElapsedSec > 0) {
      const h = Math.floor(hardware.workElapsedSec / 3600)
      const m = Math.floor((hardware.workElapsedSec % 3600) / 60)
      const s = hardware.workElapsedSec % 60
      setLocalTimer({ hours: h, minutes: m, seconds: s })
    }
  }, [timer, hardware.workElapsedSec])

  // Jika socket disconnect atau robot tidak aktif, reset timer display
  useEffect(() => {
    if (!isConnected || !robotId) {
      setLocalTimer({ hours: 0, minutes: 0, seconds: 0 })
    }
  }, [isConnected, robotId])

  const fmt = (n: number) => String(n).padStart(2, '0')

  const totalMinutes = localTimer.hours * 60 + localTimer.minutes

  const statusBadge = () => {
    switch (eyeStatus) {
      case 'normal': return <Badge color="#10b981">Normal / Sehat</Badge>
      case 'risk_myopia': return <Badge color="#f59e0b">Risiko Jarak Dekat</Badge>
      case 'risk_fatigue': return <Badge color="#ef4444">Kelelahan Mata</Badge>
      default: return <Badge>Tidak Terhubung</Badge>
    }
  }

  return (
    <div className="card-sm p-6 md:p-8 flex flex-col h-full justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-signal-blue" />
          <h2 className="text-lg font-semibold text-text tracking-tight">
            Durasi Monitoring Real-Time
          </h2>
        </div>
        {hardware.breakRemainingSec > 0 && (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Istirahat 20s: Sisa {hardware.breakRemainingSec}s
          </span>
        )}
      </div>

      {/* Timer Digits */}
      <div className="flex gap-2 justify-center items-center my-2">
        {[
          { value: fmt(localTimer.hours), label: 'Jam' },
          { value: fmt(localTimer.minutes), label: 'Menit' },
          { value: fmt(localTimer.seconds), label: 'Detik' },
        ].map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className={cn(
              'bg-surface-2 border rounded-2xl px-4 py-3.5 min-w-[68px] flex flex-col items-center transition-all duration-300',
              isConnected ? 'border-signal-blue/20' : 'border-border'
            )}>
              <div className="text-4xl md:text-5xl font-bold text-text tracking-tight leading-none font-figtree tabular-nums">
                {seg.value}
              </div>
              <div className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mt-2">
                {seg.label}
              </div>
            </div>
            {i < 2 && <span className="text-xl text-text-muted select-none mb-4">:</span>}
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div className="bg-surface-2 border border-border rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            <Activity className="w-3 h-3 text-signal-blue" />
            Total Menit
          </div>
          <div className="text-xl font-bold text-text leading-tight">
            {totalMinutes} <span className="text-xs font-normal text-text-muted">mnt</span>
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            Status Mata
          </div>
          <div className="leading-tight">
            {statusBadge()}
          </div>
        </div>
      </div>
    </div>
  )
}
