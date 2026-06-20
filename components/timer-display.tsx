'use client'

import { useSocket } from '@/lib/socket-context'
import { useEffect, useState } from 'react'

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

  return (
    <div className="bg-white/40 backdrop-blur-lg border bg-cyan-100 rounded-[40px] p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Monitoring Berlangsung</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-green-700">Aktif</span>
        </div>
      </div>

      {/* Timer display */}
      <div className="flex gap-4 justify-center mb-8">
        <div className="bg-gradient-to-b from-yellow-400 to-amber-500 rounded-2xl px-6 py-4 shadow-lg min-w-24 border border-yellow-300/30">
          <div className="text-4xl font-extrabold text-white text-center tracking-tight">{formatTime(localTimer.hours)}</div>
          <div className="text-xs text-yellow-950/85 text-center font-bold uppercase tracking-wider mt-1">hours</div>
        </div>
        <div className="flex items-center text-3xl font-extrabold text-gray-400">:</div>
        <div className="bg-gradient-to-b from-purple-500 to-indigo-600 rounded-2xl px-6 py-4 shadow-lg min-w-24 border border-purple-400/30">
          <div className="text-4xl font-extrabold text-white text-center tracking-tight">{formatTime(localTimer.minutes)}</div>
          <div className="text-xs text-purple-950/85 text-center font-bold uppercase tracking-wider mt-1">minutes</div>
        </div>
        <div className="flex items-center text-3xl font-extrabold text-gray-400">:</div>
        <div className="bg-gradient-to-b from-emerald-500 to-teal-600 rounded-2xl px-6 py-4 shadow-lg min-w-24 border border-emerald-400/30">
          <div className="text-4xl font-extrabold text-white text-center tracking-tight">{formatTime(localTimer.seconds)}</div>
          <div className="text-xs text-emerald-950/85 text-center font-bold uppercase tracking-wider mt-1">seconds</div>
        </div>
      </div>

      {/* Status information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Timer Status</div>
          <div className="text-lg font-bold text-blue-600">Berjalan</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Status Mata</div>
          <div className={`text-lg font-bold ${
            eyeStatus === 'normal' 
              ? 'text-green-600'
              : eyeStatus === 'risk_myopia'
              ? 'text-orange-600'
              : 'text-red-650'
          }`}>
            {eyeStatus === 'normal' ? 'Normal' : eyeStatus === 'risk_myopia' ? 'Risiko Miopia' : 'Kelelahan'}
          </div>
        </div>
      </div>
    </div>
  )
}
