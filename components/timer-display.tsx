'use client'

import { useSocket, beApi } from '@/lib/socket-context'
import { useEffect, useState, useRef } from 'react'
import {
  Clock,
  Activity,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Calendar,
  Sparkles,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EyeExerciseModal } from '@/components/exercise/eye-exercise-modal'
import { playGentleChime, sendDesktopNotification } from '@/lib/desktop-notifications'

const SESSION_MAX_SEC = 20 * 60 // 20 Menit = 1200 detik

export function TimerDisplay() {
  const { timer, eyeStatus, isConnected, robotId, hardware } = useSocket()
  const effectiveRobotId = robotId || 'ROBOT-01'

  // Timer real-time sesi continuous dari sensor/backend
  const [localTimer, setLocalTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Timer sesi 20 menit untuk user (Aturan 20-20-20)
  const [sessionSecLeft, setSessionSecLeft] = useState<number>(SESSION_MAX_SEC)
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(true)
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false)

  // Total durasi hari ini (dalam detik)
  const [todayTotalSec, setTodayTotalSec] = useState<number>(0)
  const [todayDateStr, setTodayDateStr] = useState<string>('')

  // Modal senam mata interaktif saat sesi 20 menit selesai
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false)

  const initialFetchDone = useRef<boolean>(false)

  // Inisialisasi tanggal dan storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setTodayDateStr(today)

    // Load sisa timer 20 menit
    const savedSession = localStorage.getItem('socasob-20m-left')
    if (savedSession !== null) {
      const parsed = parseInt(savedSession, 10)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= SESSION_MAX_SEC) {
        setSessionSecLeft(parsed)
        if (parsed === 0) {
          setSessionCompleted(true)
          setIsSessionRunning(false)
        }
      }
    }

    // Load akumulasi total hari ini dari localStorage
    const savedToday = localStorage.getItem(`socasob-today-sec-${today}`)
    if (savedToday !== null) {
      const parsed = parseInt(savedToday, 10)
      if (!isNaN(parsed) && parsed >= 0) {
        setTodayTotalSec(parsed)
      }
    }
  }, [])

  // Sinkronisasi data log hari ini dari backend API
  useEffect(() => {
    if (!todayDateStr) return

    const fetchTodayLog = async () => {
      try {
        const res = await beApi(`/api/log/today?robotId=${encodeURIComponent(effectiveRobotId)}`)
        if (res.success && res.data) {
          const apiSec = (res.data.nearDuration || 0) + (res.data.farDuration || 0)
          setTodayTotalSec((prev) => {
            const finalVal = Math.max(prev, apiSec)
            localStorage.setItem(`socasob-today-sec-${todayDateStr}`, String(finalVal))
            return finalVal
          })
        }
      } catch (err) {
        console.warn('[TimerDisplay] Menggunakan data lokal hari ini:', err)
      } finally {
        initialFetchDone.current = true
      }
    }

    fetchTodayLog()
  }, [effectiveRobotId, todayDateStr])

  // Timer real-time dari backend socket / hardware
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

  // Reset timer sensor saat socket disconnect
  useEffect(() => {
    if (!isConnected || !robotId) {
      setLocalTimer({ hours: 0, minutes: 0, seconds: 0 })
    }
  }, [isConnected, robotId])

  // Countdown timer 20 menit sesi
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isSessionRunning && sessionSecLeft > 0) {
      interval = setInterval(() => {
        setSessionSecLeft((prev) => {
          if (prev <= 1) {
            setSessionCompleted(true)
            setIsSessionRunning(false)
            playGentleChime('relax')
            sendDesktopNotification({
              title: '🌿 Sesi 20 Menit Selesai (Aturan 20-20-20)',
              body: 'Saatnya mengistirahatkan mata Anda selama 20 detik. Alihkan pandangan sejauh 6 meter.',
              tag: 'socasob-session-20m',
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionRunning, sessionSecLeft])

  // Simpan sisa waktu 20 menit ke localStorage
  useEffect(() => {
    localStorage.setItem('socasob-20m-left', String(sessionSecLeft))
  }, [sessionSecLeft])

  // Akumulasi total durasi hari ini secara dinamis (bertambah saat sesi aktif berjalan)
  useEffect(() => {
    let ticker: NodeJS.Timeout | null = null

    if (isSessionRunning && todayDateStr) {
      ticker = setInterval(() => {
        setTodayTotalSec((prev) => {
          const nextVal = prev + 1
          localStorage.setItem(`socasob-today-sec-${todayDateStr}`, String(nextVal))
          return nextVal
        })
      }, 1000)
    }

    return () => {
      if (ticker) clearInterval(ticker)
    }
  }, [isSessionRunning, todayDateStr])

  // Reset timer 20 menit kembali ke awal
  const handleResetSessionTimer = () => {
    setSessionSecLeft(SESSION_MAX_SEC)
    setSessionCompleted(false)
    setIsSessionRunning(true)
    localStorage.setItem('socasob-20m-left', String(SESSION_MAX_SEC))
  }

  // Toggle jeda / lanjutkan timer 20 menit
  const handleToggleSessionRunning = () => {
    if (sessionCompleted) {
      handleResetSessionTimer()
      return
    }
    setIsSessionRunning((prev) => !prev)
  }

  // Reset total durasi hari ini
  const handleResetTodayDuration = () => {
    const confirm = window.confirm('Reset total durasi hari ini kembali ke 0 detik?')
    if (!confirm) return
    setTodayTotalSec(0)
    if (todayDateStr) {
      localStorage.setItem(`socasob-today-sec-${todayDateStr}`, '0')
    }
  }

  const fmt = (n: number) => String(n).padStart(2, '0')

  // Format countdown 20 menit
  const sessionMin = Math.floor(sessionSecLeft / 60)
  const sessionSec = sessionSecLeft % 60
  const sessionProgressPercent = Math.min(100, Math.max(0, ((SESSION_MAX_SEC - sessionSecLeft) / SESSION_MAX_SEC) * 100))

  // Format durasi total hari ini
  const formatTodayDisplay = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60

    if (h > 0) {
      return `${h} jam ${m} mnt`
    }
    if (m > 0) {
      return `${m} mnt ${s} dtk`
    }
    return `${s} dtk`
  }

  const statusBadge = () => {
    switch (eyeStatus) {
      case 'normal': return <Badge color="#10b981">Normal / Sehat</Badge>
      case 'risk_myopia': return <Badge color="#f59e0b">Risiko Jarak Dekat</Badge>
      case 'risk_fatigue': return <Badge color="#ef4444">Kelelahan Mata</Badge>
      default: return <Badge>Tidak Terhubung</Badge>
    }
  }

  return (
    <>
      <div className="card-sm p-6 md:p-8 flex flex-col h-full justify-between space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-signal-blue" />
            <div>
              <h2 className="text-lg font-semibold text-text tracking-tight">
                Sesi Layar & Timer 20 Menit
              </h2>
              <p className="text-xs text-text-muted">
                Pencegahan ketegangan mata berbasis aturan 20-20-20
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hardware.breakRemainingSec > 0 && (
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Istirahat 20s: Sisa {hardware.breakRemainingSec}s
              </span>
            )}
            {statusBadge()}
          </div>
        </div>

        {/* Blok Utama: Timer 20 Menit Sesi */}
        <div className="bg-surface-2/70 border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                Timer Sesi 20 Menit
              </span>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                sessionCompleted
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  : isSessionRunning
                    ? 'bg-signal-blue/10 text-signal-blue border-signal-blue/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              )}>
                {sessionCompleted ? 'Selesai' : isSessionRunning ? 'Berjalan' : 'Dijeda'}
              </span>
            </div>

            {/* Tombol Kontrol: Pause/Play & Reset Timer 20 Menit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSessionRunning}
                title={isSessionRunning ? 'Jeda sesi 20 menit' : 'Lanjutkan sesi 20 menit'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border text-text hover:bg-surface-3 transition-colors cursor-pointer"
              >
                {isSessionRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-500" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-signal-blue fill-current" />
                    <span>Mulai</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetSessionTimer}
                title="Reset timer 20 menit kembali ke 20:00"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-signal-blue/10 border border-signal-blue/20 text-signal-blue hover:bg-signal-blue/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset 20 Mnt</span>
              </button>
            </div>
          </div>

          {/* Angka Countdown 20 Menit */}
          <div className="flex items-center justify-center gap-3 py-1">
            <div className="flex items-center gap-2">
              <div className="bg-surface border border-border rounded-2xl px-5 py-3.5 min-w-[76px] flex flex-col items-center shadow-xs">
                <div className="text-4xl sm:text-5xl font-extrabold text-text font-figtree tabular-nums leading-none">
                  {fmt(sessionMin)}
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mt-2">
                  Menit
                </span>
              </div>
              <span className="text-2xl font-bold text-text-muted select-none mb-3">:</span>
              <div className="bg-surface border border-border rounded-2xl px-5 py-3.5 min-w-[76px] flex flex-col items-center shadow-xs">
                <div className="text-4xl sm:text-5xl font-extrabold text-text font-figtree tabular-nums leading-none">
                  {fmt(sessionSec)}
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mt-2">
                  Detik
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar 20 Menit */}
          <div className="space-y-1.5">
            <div className="w-full bg-surface border border-border/80 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  sessionCompleted
                    ? 'bg-rose-500'
                    : sessionSecLeft <= 120
                      ? 'bg-amber-500'
                      : 'bg-signal-blue'
                )}
                style={{ width: `${sessionProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted px-0.5">
              <span>Sisa: {sessionMin} menit {sessionSec} detik</span>
              <span>Target: 20 menit</span>
            </div>
          </div>

          {/* Banner Notifikasi saat 20 Menit Selesai */}
          {sessionCompleted && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Sesi 20 menit selesai! Istirahatkan mata selama 20 detik (Aturan 20-20-20).
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsExerciseModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Senam Mata (20s)
                </button>
                <button
                  type="button"
                  onClick={handleResetSessionTimer}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  Ulang Sesi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metrik Bawah: Total Durasi Hari Ini & Sesi Real-Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Card 1: Total Durasi Hari Ini */}
          <div className="bg-surface-2 border border-border rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-signal-blue" />
                Total Durasi Hari Ini
              </div>
              <button
                type="button"
                onClick={handleResetTodayDuration}
                title="Reset total durasi hari ini ke 0"
                className="p-1 rounded-md text-text-muted hover:text-rose-500 hover:bg-surface transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold text-text font-figtree tracking-tight tabular-nums">
                {formatTodayDisplay(todayTotalSec)}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Akumulasi durasi layar hari ini
              </p>
            </div>
          </div>

          {/* Card 2: Durasi Sesi Real-Time Sensor */}
          <div className="bg-surface-2 border border-border rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Sesi Aktif Real-Time
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold text-text font-figtree tracking-tight tabular-nums">
                {fmt(localTimer.hours)}:{fmt(localTimer.minutes)}:{fmt(localTimer.seconds)}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isConnected ? 'Sensor aktif memantau' : 'Sensor offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Senam Mata Interaktif */}
      <EyeExerciseModal
        open={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
      />
    </>
  )
}
