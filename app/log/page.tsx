'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Loader2,
  Bot,
  Ruler,
  AlertTriangle,
  Droplets,
  Eye,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  History
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Modal } from '@/components/ui/modal'
import { useSocket, beApi } from '@/lib/socket-context'

interface RiskDetail {
  status: 'YA' | 'TIDAK'
  reasons: string[]
}

interface RiskEvaluation {
  eyeFatigueRisk?: RiskDetail
  dryEyeRisk?: RiskDetail
  myopiaExposureRisk?: RiskDetail
}

interface SessionItem {
  startTime: string
  endTime?: string
  peakDistance: 'Dekat' | 'Jauh'
  _id?: string
}

interface DailyLogItem {
  _id?: string
  robotId?: string
  date: string
  screenTimeMinutes: number
  longestContinuousGazeMinutes: number
  dominantDistanceCm: number
  blinkRatePerMinute: number
  incompleteBlinkRatio: number
  distanceBelow20CmDetected: boolean
  distanceBelow50CmForAtLeast10Seconds?: boolean
  nearDuration?: number
  farDuration?: number
  blinkCount?: number
  restCompliance?: number
  eyeHealthStatus?: string
  sessions?: SessionItem[]
  risks?: RiskEvaluation
}

// Data patokan 12 September (sesuai pengujian)
const LOG_12_SEP_BENCHMARK: DailyLogItem = {
  date: '2026-09-12',
  screenTimeMinutes: 380, // 6 jam 20 menit
  longestContinuousGazeMinutes: 52,
  dominantDistanceCm: 42,
  blinkRatePerMinute: 16,
  incompleteBlinkRatio: 45,
  distanceBelow20CmDetected: false,
  distanceBelow50CmForAtLeast10Seconds: true,
  nearDuration: 14400,
  farDuration: 8400,
  blinkCount: 6080,
  restCompliance: 35,
  eyeHealthStatus: 'risk_fatigue',
  sessions: [
    { startTime: '2026-09-12T08:15:00.000Z', endTime: '2026-09-12T09:07:00.000Z', peakDistance: 'Dekat' },
    { startTime: '2026-09-12T09:12:00.000Z', endTime: '2026-09-12T10:04:00.000Z', peakDistance: 'Dekat' },
    { startTime: '2026-09-12T10:10:00.000Z', endTime: '2026-09-12T11:30:00.000Z', peakDistance: 'Jauh' },
    { startTime: '2026-09-12T13:00:00.000Z', endTime: '2026-09-12T13:52:00.000Z', peakDistance: 'Dekat' },
    { startTime: '2026-09-12T14:00:00.000Z', endTime: '2026-09-12T14:40:00.000Z', peakDistance: 'Jauh' },
    { startTime: '2026-09-12T15:00:00.000Z', endTime: '2026-09-12T16:40:00.000Z', peakDistance: 'Dekat' }
  ],
  risks: {
    eyeFatigueRisk: {
      status: 'YA',
      reasons: [
        'Screen time >6 jam (>360 menit)',
        'Durasi tatap kontinu >20 menit tanpa jeda',
        'Jarak mata ke layar <50 cm selama minimal 10 detik'
      ]
    },
    dryEyeRisk: {
      status: 'YA',
      reasons: [
        'Screen time >6 jam (>360 menit)',
        'Kedipan tidak sempurna tinggi (≥40%)'
      ]
    },
    myopiaExposureRisk: {
      status: 'YA',
      reasons: [
        'Screen time ≥4 jam (≥240 menit)',
        'Kerja dekat atau tatap kontinu >20 menit tanpa jeda'
      ]
    }
  }
}

const ITEMS_PER_PAGE = 6

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h} jam ${m} menit`
  if (h > 0) return `${h} jam`
  return `${m} menit`
}

function formatTime(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

function formatDateIndo(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function formatDateWeekday(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      weekday: 'long'
    })
  } catch {
    return ''
  }
}

export default function LogPage() {
  const { robotId } = useSocket()
  const effectiveRobotId = robotId || 'ROBOT-01'

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-12')
  const [activeLog, setActiveLog] = useState<DailyLogItem>(LOG_12_SEP_BENCHMARK)
  const [historyLogs, setHistoryLogs] = useState<DailyLogItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // State Modal Linimasa Sesi
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState<boolean>(false)

  // State Pagination Riwayat (6 hari per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Ambil daftar riwayat log harian
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const res = await beApi(`/api/log/history?robotId=${encodeURIComponent(effectiveRobotId)}&limit=60`)
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHistoryLogs(res.data)

          // Sinkronisasi tanggal aktif
          const foundSelected = res.data.find((l: DailyLogItem) => l.date === selectedDate)
          if (foundSelected) {
            setActiveLog(foundSelected)
          } else {
            setActiveLog(LOG_12_SEP_BENCHMARK)
          }
        } else {
          setHistoryLogs([LOG_12_SEP_BENCHMARK])
          setActiveLog(LOG_12_SEP_BENCHMARK)
        }
      } catch {
        setHistoryLogs([LOG_12_SEP_BENCHMARK])
        setActiveLog(LOG_12_SEP_BENCHMARK)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [effectiveRobotId])

  // Ganti tanggal aktif saat pengguna memilih riwayat lain
  const handleSelectDate = (item: DailyLogItem) => {
    setSelectedDate(item.date)
    setActiveLog(item)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Perhitungan pagination
  const totalPages = Math.max(1, Math.ceil(historyLogs.length / ITEMS_PER_PAGE))
  const paginatedLogs = historyLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Evaluasi risiko untuk log yang sedang aktif
  const fatigueRisk = activeLog.risks?.eyeFatigueRisk
  const dryEyeRisk = activeLog.risks?.dryEyeRisk
  const myopiaRisk = activeLog.risks?.myopiaExposureRisk

  const hasAnyDetectedRisk =
    fatigueRisk?.status === 'YA' ||
    dryEyeRisk?.status === 'YA' ||
    myopiaRisk?.status === 'YA'

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          eyebrow="Catatan Harian"
          title="Log Monitoring Harian"
          description={`Histori telemetri pemantauan kebiasaan visual untuk perangkat ${effectiveRobotId}.`}
        />

        {/* Banner Tanggal Aktif & Tombol Linimasa */}
        <div className="bg-gradient-to-r from-signal-blue/10 via-active-teal/10 to-transparent border border-signal-blue/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-signal-blue flex items-center justify-center text-white shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-signal-blue">
                  {formatDateWeekday(activeLog.date)}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-signal-blue/40" />
                <span className="text-xs font-mono text-text-muted">{activeLog.date}</span>
                {activeLog.date === '2026-09-12' && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-signal-blue/20 text-signal-blue">
                    Data Pengujian
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-text tracking-tight">
                {formatDateIndo(activeLog.date)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Tombol Lihat Linimasa Modal */}
            <button
              onClick={() => setIsTimelineModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-signal-blue text-white hover:bg-signal-blue/90 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Lihat Linimasa Sesi</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {activeLog.sessions?.length || 0}
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-surface-1/80 backdrop-blur px-3.5 py-2 rounded-full border border-border">
              <Bot className="w-3.5 h-3.5 text-signal-blue" />
              <span>Perangkat: <strong className="font-mono text-text">{effectiveRobotId}</strong></span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-signal-blue" />
            <p className="text-sm">Memuat catatan log harian...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ============================================================ */}
            {/* SEKSI 1: HASIL METRIK PEMANTAUAN (6 PARAMETER) */}
            {/* ============================================================ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-signal-blue" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text">
                    Hasil Pemantauan ({formatDateIndo(activeLog.date)})
                  </h3>
                </div>
                <span className="text-xs text-text-muted font-medium">6 Parameter Terukur</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Screen time */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Screen time</span>
                    <span className="w-7 h-7 rounded-lg bg-signal-blue/10 flex items-center justify-center text-signal-blue">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-text tracking-tight">
                    {formatDuration(activeLog.screenTimeMinutes)}
                  </div>
                </div>

                {/* 2. Durasi tatap kontinu terpanjang */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tatap Kontinu Terpanjang</span>
                    <span className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-text tracking-tight">
                    {activeLog.longestContinuousGazeMinutes} menit
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Sesi menatap tanpa jeda terlama (ambang batas wajar: 20 menit)
                  </p>
                </div>

                {/* 3. Jarak dominan */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Jarak Dominan</span>
                    <span className="w-7 h-7 rounded-lg bg-signal-blue/10 flex items-center justify-center text-signal-blue">
                      <Ruler className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-text tracking-tight">
                    {activeLog.dominantDistanceCm} cm
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Jarak kerja mata ke layar monitor pada mayoritas sesi
                  </p>
                </div>

                {/* 4. Blink rate harian (TOTAL KEDIPAN DIHAPUS) */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Blink Rate Harian</span>
                    <span className="w-7 h-7 rounded-lg bg-active-teal/10 flex items-center justify-center text-active-teal">
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-text tracking-tight">
                    {activeLog.blinkRatePerMinute} kedip/menit
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Rata-rata frekuensi kedipan mata per menit
                  </p>
                </div>

                {/* 5. Incomplete blink harian */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Incomplete Blink Harian</span>
                    <span className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center text-error">
                      <Droplets className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-error tracking-tight">
                    {activeLog.incompleteBlinkRatio}%
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Rasio kelopak mata tidak menutup sempurna saat berkedip
                  </p>
                </div>

                {/* 6. Jarak <20 cm */}
                <div className="card-sm p-5 border border-border bg-surface-1 hover:border-signal-blue/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Jarak &lt;20 cm</span>
                    <span className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center',
                      activeLog.distanceBelow20CmDetected ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                    )}>
                      {activeLog.distanceBelow20CmDetected ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div className={cn(
                    'text-2xl font-bold tracking-tight mt-1',
                    activeLog.distanceBelow20CmDetected ? 'text-error' : 'text-success'
                  )}>
                    {activeLog.distanceBelow20CmDetected ? 'Terdeteksi' : 'Tidak terdeteksi'}
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    Peringatan deviasi jarak sangat dekat ke lensa sensor
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SEKSI 2: OUTPUT DETEKSI RISIKO (HANYA TAMPIL JIKA TERDETEKSI) */}
            {/* ============================================================ */}
            <div className="card-sm p-6 border border-border bg-surface-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-signal-blue" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text">Output Deteksi Risiko</h3>
                </div>
                <span className="text-xs text-text-muted font-medium">Evaluasi Ambang Batas Medis</span>
              </div>

              {!hasAnyDetectedRisk ? (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 text-success">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">
                    Tidak ada risiko kesehatan mata yang terdeteksi pada tanggal ini.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Deretan Badge: format 'Terdeteksi Risiko ...' */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {/* Badge 1: Risiko Mata Lelah */}
                    {fatigueRisk?.status === 'YA' && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30 shadow-sm animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                        Terdeteksi Risiko Mata Lelah
                      </span>
                    )}

                    {/* Badge 2: Risiko Mata Kering */}
                    {dryEyeRisk?.status === 'YA' && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-warning/15 text-warning-dark dark:text-warning border border-warning/30 shadow-sm animate-fade-in">
                        <Droplets className="w-3.5 h-3.5 text-warning" />
                        Terdeteksi Risiko Mata Kering
                      </span>
                    )}

                    {/* Badge 3: Risiko Miopia */}
                    {myopiaRisk?.status === 'YA' && (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-sm animate-fade-in">
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                        Terdeteksi Risiko Miopia
                      </span>
                    )}
                  </div>

                  {/* Rincian Pemicu Risiko */}
                  <div className="mt-4 pt-4 border-t border-border space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Rincian Faktor Pemicu Risiko:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {fatigueRisk?.status === 'YA' && (
                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1.5">
                          <span className="font-semibold text-error flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-error" />
                            Kelelahan Mata
                          </span>
                          <ul className="text-text-muted list-disc list-inside space-y-1">
                            {fatigueRisk.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dryEyeRisk?.status === 'YA' && (
                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1.5">
                          <span className="font-semibold text-warning-dark dark:text-warning flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5" />
                            Risiko Mata Kering
                          </span>
                          <ul className="text-text-muted list-disc list-inside space-y-1">
                            {dryEyeRisk.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {myopiaRisk?.status === 'YA' && (
                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1.5">
                          <span className="font-semibold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Paparan Risiko Miopia
                          </span>
                          <ul className="text-text-muted list-disc list-inside space-y-1">
                            {myopiaRisk.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SEKSI 3: RIWAYAT LOG DENGAN PAGINATION (6 HARI SEBELUMNYA) */}
            {/* ============================================================ */}
            <div className="card-sm p-6 border border-border bg-surface-1 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-signal-blue" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text">
                    Riwayat Log Harian Lainnya
                  </h3>
                </div>
                <div className="text-xs text-text-muted font-medium bg-surface-2 px-3 py-1 rounded-full border border-border">
                  Halaman {currentPage} dari {totalPages} ({historyLogs.length} Total Hari)
                </div>
              </div>

              <p className="text-xs text-text-muted">
                Pilih salah satu rekaman harian di bawah untuk beralih melihat 6 metrik dan status risiko pada tanggal tersebut:
              </p>

              {/* Daftar 6 Hari per Halaman */}
              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden shadow-sm">
                {paginatedLogs.map((item, idx) => {
                  const isSelected = item.date === activeLog.date
                  const itemFatigue = item.risks?.eyeFatigueRisk?.status === 'YA'
                  const itemDry = item.risks?.dryEyeRisk?.status === 'YA'
                  const itemMyopia = item.risks?.myopiaExposureRisk?.status === 'YA'
                  const itemHasRisk = itemFatigue || itemDry || itemMyopia
                  const itemIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1

                  return (
                    <button
                      key={item._id || item.date || idx}
                      onClick={() => handleSelectDate(item)}
                      className={cn(
                        'w-full p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left transition-all cursor-pointer',
                        isSelected
                          ? 'bg-signal-blue/10 border-l-4 border-signal-blue'
                          : 'hover:bg-surface-2/60 bg-surface-1'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                          isSelected ? 'bg-signal-blue text-white shadow-sm' : 'bg-surface-2 text-text-muted border border-border'
                        )}>
                          {itemIndex}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-text">
                              {formatDateIndo(item.date)}
                            </span>
                            <span className="text-xs text-text-muted font-mono">
                              ({formatDateWeekday(item.date)})
                            </span>
                            {item.date === '2026-09-12' && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-signal-blue/20 text-signal-blue">
                                12 Sep
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                            <span>Screen time: <strong className="text-text font-semibold">{formatDuration(item.screenTimeMinutes)}</strong></span>
                            <span>Jarak: <strong className="text-text font-semibold">{item.dominantDistanceCm} cm</strong></span>
                            <span>Blink: <strong className="text-text font-semibold">{item.blinkRatePerMinute}/mnt</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {itemFatigue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-error/15 text-error border border-error/30">
                            Lelah
                          </span>
                        )}
                        {itemDry && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/15 text-warning-dark dark:text-warning border border-warning/30">
                            Kering
                          </span>
                        )}
                        {itemMyopia && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                            Miopia
                          </span>
                        )}
                        {!itemHasRisk && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30">
                            Normal
                          </span>
                        )}
                        <ChevronRight className={cn(
                          'w-4 h-4 ml-1 transition-transform',
                          isSelected ? 'text-signal-blue translate-x-0.5' : 'text-text-muted'
                        )} />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Kontrol Navigasi Pagination */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-2 border border-border text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  ).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                        currentPage === page
                          ? 'bg-signal-blue text-white'
                          : 'bg-surface-2 text-text-muted hover:bg-surface-3 border border-border'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-2 border border-border text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>6 Hari Sebelumnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL LINIMASA SESI PEMANTAUAN */}
        {/* ============================================================ */}
        <Modal
          open={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          title={`Linimasa Sesi Pemantauan (${formatDateIndo(activeLog.date)})`}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-text-muted pb-2 border-b border-border">
              <span>Rincian pergantian jarak tatap layar per sesi pada tanggal {activeLog.date}</span>
              <span className="font-semibold text-text">{activeLog.sessions?.length || 0} Sesi</span>
            </div>

            {(!activeLog.sessions || activeLog.sessions.length === 0) ? (
              <div className="py-12 text-center text-xs text-text-muted">
                Tidak ada data linimasa sesi untuk tanggal ini.
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto pr-1 divide-y divide-border border border-border rounded-xl">
                {activeLog.sessions.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-2/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        s.peakDistance === 'Dekat' ? 'bg-error' : 'bg-success'
                      )} />
                      <div>
                        <p className="font-semibold text-text">Sesi {idx + 1}</p>
                        <p className="text-[11px] text-text-muted font-mono mt-0.5">
                          {formatTime(s.startTime)} s.d. {s.endTime ? formatTime(s.endTime) : 'Selesai'}
                        </p>
                      </div>
                    </div>

                    <span className={cn(
                      'font-semibold px-2.5 py-1 rounded-full text-[11px]',
                      s.peakDistance === 'Dekat' ? 'bg-error/15 text-error border border-error/20' : 'bg-success/15 text-success border border-success/20'
                    )}>
                      Jarak {s.peakDistance}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTimelineModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface-3 text-text transition-colors border border-border cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>

        {/* Info Box */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            Data log harian disinkronisasi dari sensor perangkat SocaSob. Evaluasi ambang batas risiko diuji berdasarkan rekomendasi medis pencegahan miopia dan kelelahan visual digital. Untuk tinjauan longitudinal akumulatif, kunjungi halaman{' '}
            <Link href="/resume" className="text-signal-blue font-medium hover:underline">Resume</Link> atau terbitkan laporan klinis di{' '}
            <Link href="/reports" className="text-signal-blue font-medium hover:underline">Reports</Link>.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
