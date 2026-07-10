'use client'

import { useSocket } from '@/lib/socket-context'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function TimerDisplay() {
  const { timer, eyeStatus } = useSocket()
  const [localTimer, setLocalTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (timer) {
      setLocalTimer(timer)
    }
  }, [timer])

  // Local countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTimer((prev) => {
        let { hours, minutes, seconds } = prev

        seconds++
        if (seconds >= 60) {
          seconds = 0
          minutes++
        }
        if (minutes >= 60) {
          minutes = 0
          hours++
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (num: number) => String(num).padStart(2, '0')

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal'
      case 'risk_myopia':
        return 'Risiko Miopia'
      case 'risk_fatigue':
        return 'Kelelahan'
      default:
        return 'Kelelahan'
    }
  }

  return (
    <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight">
          Monitoring Berlangsung
        </h2>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-linen border border-mist rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-medium text-ash uppercase tracking-wider">Aktif</span>
        </div>
      </div>

      {/* Timer display */}
      <div className="flex gap-3 justify-center items-center my-6">
        {/* Hours */}
        <div className="bg-linen border border-mist rounded-lg px-4 py-3 min-w-[70px] flex flex-col items-center">
          <div className="font-ppmondwest text-4xl text-ink-black tracking-tight leading-none">
            {formatTime(localTimer.hours)}
          </div>
          <div className="text-[10px] text-ash font-medium uppercase tracking-wider mt-1.5 font-af">
            Jam
          </div>
        </div>
        
        <div className="text-xl font-normal text-fog leading-none select-none">:</div>
        
        {/* Minutes */}
        <div className="bg-linen border border-mist rounded-lg px-4 py-3 min-w-[70px] flex flex-col items-center">
          <div className="font-ppmondwest text-4xl text-ink-black tracking-tight leading-none">
            {formatTime(localTimer.minutes)}
          </div>
          <div className="text-[10px] text-ash font-medium uppercase tracking-wider mt-1.5 font-af">
            Menit
          </div>
        </div>
        
        <div className="text-xl font-normal text-fog leading-none select-none">:</div>
        
        {/* Seconds */}
        <div className="bg-linen border border-mist rounded-lg px-4 py-3 min-w-[70px] flex flex-col items-center">
          <div className="font-ppmondwest text-4xl text-ink-black tracking-tight leading-none">
            {formatTime(localTimer.seconds)}
          </div>
          <div className="text-[10px] text-ash font-medium uppercase tracking-wider mt-1.5 font-af">
            Detik
          </div>
        </div>
      </div>

      {/* Status information */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-linen border border-mist rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-ash uppercase tracking-wider mb-1 font-af">
            Sesi Monitor
          </div>
          <div className="font-ppmondwest text-lg text-graphite font-normal leading-tight">
            Berjalan
          </div>
        </div>
        <div className="bg-linen border border-mist rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-ash uppercase tracking-wider mb-1 font-af">
            Status Mata
          </div>
          <div className={cn(
            "font-ppmondwest text-lg font-normal leading-tight",
            eyeStatus === 'normal' ? "text-graphite" : "text-signal-blue"
          )}>
            {getStatusText(eyeStatus)}
          </div>
        </div>
      </div>
    </div>
  )
}
