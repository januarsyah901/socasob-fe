'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { ChevronDown, Info, Calendar, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { useSocket, beApi } from '@/lib/socket-context'

interface SessionItem {
  startTime: string
  endTime?: string
  peakDistance: 'Dekat' | 'Jauh'
  _id?: string
}

interface DailyLogData {
  _id: string
  robotId: string
  date: string
  nearDuration: number  // detik
  farDuration: number   // detik
  blinkCount: number
  sessions: SessionItem[]
  eyeHealthStatus: 'normal' | 'risk_myopia' | 'risk_fatigue'
  restCompliance: number
  createdAt: string
  updatedAt: string
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'normal': return <Badge variant="success">Normal</Badge>
    case 'risk_myopia': return <Badge variant="warning">Risiko Dekat</Badge>
    case 'risk_fatigue': return <Badge variant="error">Kelelahan Mata</Badge>
    default: return <Badge variant="default">Unknown</Badge>
  }
}

function secToMin(sec: number) {
  return Math.round(sec / 60)
}

function formatTime(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateStr === todayStr) return 'Hari Ini'
    if (dateStr === yesterdayStr) return 'Kemarin'
    return d.toLocaleDateString('id-ID', { weekday: 'long' })
  } catch {
    return dateStr
  }
}

function formatDateDisplay(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function DurationBar({ close, far }: { close: number; far: number }) {
  const total = close + far
  if (total === 0) return null
  const closePct = Math.round((close / total) * 100)
  const farPct = 100 - closePct
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="w-2 h-2 rounded-full bg-error/70 shrink-0" />
        <span>Dekat {close} mnt ({closePct}%)</span>
        <span className="mx-1 text-border">·</span>
        <span className="w-2 h-2 rounded-full bg-success/70 shrink-0" />
        <span>Aman {far} mnt ({farPct}%)</span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-2 border border-border overflow-hidden flex">
        <div className="bg-error/70 h-full transition-all" style={{ width: `${closePct}%` }} />
        <div className="bg-success/70 h-full transition-all" style={{ width: `${farPct}%` }} />
      </div>
    </div>
  )
}

export default function LogPage() {
  const { robotId } = useSocket()
  const [expandedSection, setExpandedSection] = useState<'daily' | 'weekly' | null>('daily')
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const [todayLog, setTodayLog] = useState<DailyLogData | null>(null)
  const [weeklyLogs, setWeeklyLogs] = useState<DailyLogData[]>([])
  const [isLoadingToday, setIsLoadingToday] = useState(false)
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false)
  const [todayError, setTodayError] = useState('')
  const [weeklyError, setWeeklyError] = useState('')

  useEffect(() => {
    if (!robotId) return

    const fetchToday = async () => {
      setIsLoadingToday(true)
      setTodayError('')
      try {
        const data = await beApi(`/api/log/today?robotId=${encodeURIComponent(robotId)}`)
        if (data.success) {
          setTodayLog(data.data)
        } else {
          setTodayLog(null)
          setTodayError(data.error || 'Belum ada data hari ini')
        }
      } catch {
        setTodayError('Gagal mengambil data dari server')
      } finally {
        setIsLoadingToday(false)
      }
    }

    const fetchWeekly = async () => {
      setIsLoadingWeekly(true)
      setWeeklyError('')
      try {
        const data = await beApi(`/api/log/weekly?robotId=${encodeURIComponent(robotId)}`)
        if (data.success) {
          setWeeklyLogs([...data.data].reverse()) // terbaru di atas
        } else {
          setWeeklyLogs([])
          setWeeklyError(data.error || 'Tidak ada data minggu ini')
        }
      } catch {
        setWeeklyError('Gagal mengambil data mingguan')
      } finally {
        setIsLoadingWeekly(false)
      }
    }

    fetchToday()
    fetchWeekly()
  }, [robotId])

  const NoRobotMessage = () => (
    <div className="py-10 text-center text-sm text-text-muted">
      <p className="font-semibold text-text mb-1">Belum ada robot yang dipilih</p>
      <p>Atur Robot ID di halaman <a href="/settings" className="text-signal-blue font-medium hover:underline">Pengaturan</a> terlebih dahulu.</p>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          eyebrow="Catatan Riwayat"
          title="Log Monitoring"
          description={robotId ? `Data robot: ${robotId}` : 'Pantau histori durasi tatap layar dan status kesehatan mata.'}
        />

        {/* Today's Summary */}
        <div className="card-sm overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
            className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-surface-2/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-base font-semibold text-text tracking-tight">Hasil Pantau Hari Ini</h2>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-text-muted transition-transform duration-300', expandedSection === 'daily' && 'rotate-180')} />
          </button>

          {expandedSection === 'daily' && (
            <div className="px-5 pb-6 md:px-6 md:pb-7 space-y-5 animate-fade-in border-t border-border">
              {!robotId && <NoRobotMessage />}

              {robotId && isLoadingToday && (
                <div className="py-8 flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengambil data hari ini…
                </div>
              )}

              {robotId && !isLoadingToday && todayError && (
                <div className="py-6 text-center text-sm text-text-muted">
                  <p>{todayError}</p>
                  <p className="text-xs mt-1 text-text-muted/70">Data akan muncul setelah robot mulai mengirim frame ke sistem.</p>
                </div>
              )}

              {robotId && !isLoadingToday && todayLog && (() => {
                const nearMin = secToMin(todayLog.nearDuration)
                const farMin = secToMin(todayLog.farDuration)
                const firstSession = todayLog.sessions?.[0]
                const lastSession = todayLog.sessions?.[todayLog.sessions.length - 1]
                const startTime = firstSession ? formatTime(firstSession.startTime) : '-'
                const endTime = lastSession?.endTime ? formatTime(lastSession.endTime) : 'Sekarang'

                return (
                  <>
                    <div className="flex items-center gap-6 pt-4 text-sm text-text-muted">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span>Mulai: <strong className="text-text">{startTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-error/60" />
                        <span>Terakhir: <strong className="text-text">{endTime}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Tatap Dekat</span>
                        <div className="text-4xl font-bold text-error leading-none">{nearMin}</div>
                        <p className="text-xs text-text-muted mt-2">menit (&lt; 30cm)</p>
                      </div>
                      <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Tatap Aman</span>
                        <div className="text-4xl font-bold text-success leading-none">{farMin}</div>
                        <p className="text-xs text-text-muted mt-2">menit (≥ 30cm)</p>
                      </div>
                      <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Kepatuhan Istirahat</span>
                        <div className={cn('text-4xl font-bold leading-none', todayLog.restCompliance >= 70 ? 'text-success' : 'text-warning')}>
                          {todayLog.restCompliance}%
                        </div>
                        <p className="text-xs text-text-muted mt-2">target ≥ 70%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-text-muted">Status:</span>
                      {statusBadge(todayLog.eyeHealthStatus)}
                      <span className="text-xs text-text-muted ml-auto">Kedipan: {todayLog.blinkCount}x</span>
                    </div>

                    <DurationBar close={nearMin} far={farMin} />
                  </>
                )
              })()}
            </div>
          )}
        </div>

        {/* Weekly History */}
        <div className="card-sm overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'weekly' ? null : 'weekly')}
            className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-surface-2/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-base font-semibold text-text tracking-tight">Riwayat 7 Hari Terakhir</h2>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-text-muted transition-transform duration-300', expandedSection === 'weekly' && 'rotate-180')} />
          </button>

          {expandedSection === 'weekly' && (
            <div className="px-5 pb-6 md:px-6 md:pb-7 animate-fade-in border-t border-border">
              {!robotId && <NoRobotMessage />}

              {robotId && isLoadingWeekly && (
                <div className="py-8 flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengambil data mingguan…
                </div>
              )}

              {robotId && !isLoadingWeekly && weeklyError && (
                <div className="py-6 text-center text-sm text-text-muted">
                  <p>{weeklyError}</p>
                </div>
              )}

              {robotId && !isLoadingWeekly && weeklyLogs.length === 0 && !weeklyError && (
                <div className="py-6 text-center text-sm text-text-muted">
                  Belum ada data monitoring minggu ini untuk robot <strong>{robotId}</strong>.
                </div>
              )}

              {robotId && !isLoadingWeekly && weeklyLogs.length > 0 && (
                <div className="space-y-2 pt-4">
                  {weeklyLogs.map((item, idx) => {
                    const nearMin = secToMin(item.nearDuration)
                    const farMin = secToMin(item.farDuration)
                    const firstS = item.sessions?.[0]
                    const lastS = item.sessions?.[item.sessions.length - 1]
                    return (
                      <div key={item._id || idx} className="border border-border rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                          className="w-full grid grid-cols-12 items-center text-sm py-3.5 px-5 hover:bg-surface-2/30 transition-colors text-left"
                        >
                          <div className="col-span-4">
                            <p className="font-semibold text-text">{formatDateLabel(item.date)}</p>
                            <p className="text-xs text-text-muted">{formatDateDisplay(item.date)}</p>
                          </div>
                          <div className="col-span-3 text-xs text-text-muted">
                            {firstS ? formatTime(firstS.startTime) : '-'} – {lastS?.endTime ? formatTime(lastS.endTime) : 'Sekarang'}
                          </div>
                          <div className="col-span-3">
                            {statusBadge(item.eyeHealthStatus)}
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform duration-200', expandedDay === idx && 'rotate-180')} />
                          </div>
                        </button>

                        {expandedDay === idx && (
                          <div className="px-5 pb-4 pt-2 bg-surface-2/30 border-t border-border animate-fade-in">
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Tatap Dekat</p>
                                <p className="text-xl font-bold text-error">{nearMin} <span className="text-xs font-normal">mnt</span></p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Tatap Aman</p>
                                <p className="text-xl font-bold text-success">{farMin} <span className="text-xs font-normal">mnt</span></p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Kepatuhan</p>
                                <p className={cn('text-xl font-bold', item.restCompliance >= 70 ? 'text-success' : 'text-warning')}>
                                  {item.restCompliance}%
                                </p>
                              </div>
                            </div>
                            <DurationBar close={nearMin} far={farMin} />
                            <p className="text-xs text-text-muted mt-2">Kedipan: {item.blinkCount}x</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            Data history diperbarui otomatis saat sistem terhubung ke backend SocaSob. Lihat ringkasan analisis 6 bulan di halaman{' '}
            <a href="/resume" className="text-signal-blue font-medium hover:underline">Resume</a>.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
