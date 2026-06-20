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
    <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-3xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Monitoring Berlangsung</h2>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Timer display */}
      <div className="flex gap-4 justify-center mb-8">
        <div className="bg-yellow-400 dark:bg-yellow-500 rounded-2xl px-6 py-4 shadow-md">
          <div className="text-4xl font-bold text-white text-center">{formatTime(localTimer.hours)}</div>
          <div className="text-sm text-yellow-900 dark:text-yellow-200 text-center mt-2">hours</div>
        </div>
        <div className="flex items-center text-3xl font-bold text-gray-700 dark:text-gray-300">:</div>
        <div className="bg-purple-400 dark:bg-purple-500 rounded-2xl px-6 py-4 shadow-md">
          <div className="text-4xl font-bold text-white text-center">{formatTime(localTimer.minutes)}</div>
          <div className="text-sm text-purple-900 dark:text-purple-200 text-center mt-2">minutes</div>
        </div>
        <div className="flex items-center text-3xl font-bold text-gray-700 dark:text-gray-300">:</div>
        <div className="bg-green-400 dark:bg-green-500 rounded-2xl px-6 py-4 shadow-md">
          <div className="text-4xl font-bold text-white text-center">{formatTime(localTimer.seconds)}</div>
          <div className="text-sm text-green-900 dark:text-green-200 text-center mt-2">seconds</div>
        </div>
      </div>

      {/* Status information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-600 rounded-xl p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Timer Status</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">Berjalan</div>
        </div>
        <div className="bg-white dark:bg-slate-600 rounded-xl p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Status Mata</div>
          <div className={`text-lg font-bold ${
            eyeStatus === 'normal' 
              ? 'text-green-600 dark:text-green-400'
              : eyeStatus === 'risk_myopia'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {eyeStatus === 'normal' ? 'Normal' : eyeStatus === 'risk_myopia' ? 'Risiko Miopia' : 'Kelelahan'}
          </div>
        </div>
      </div>
    </div>
  )
}
