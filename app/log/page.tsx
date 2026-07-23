'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState } from 'react'
import { ChevronDown, Info, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'

interface SessionDetail {
  start: string
  end: string
  durationClose: number   // menit
  durationFar: number     // menit
  compliance: number      // % kepatuhan istirahat
}

interface DailyLog {
  date: string
  startTime: string
  endTime: string
  durationClose: number   // menit
  durationFar: number     // menit
  compliancePercent: number
}

interface WeeklyHistory {
  date: string
  dayLabel: string
  status: 'normal' | 'risk_myopia' | 'risk_fatigue'
  startTime: string
  endTime: string
  durationClose: number
  durationFar: number
  compliancePercent: number
}

const mockDailyLog: DailyLog = {
  date: 'Hari Ini (10 Januari 2026)',
  startTime: '08:15',
  endTime: '16:40',
  durationClose: 82,
  durationFar: 198,
  compliancePercent: 78,
}

const mockWeeklyHistory: WeeklyHistory[] = [
  { date: '10 Jan 2026', dayLabel: 'Hari Ini', status: 'normal', startTime: '08:15', endTime: '16:40', durationClose: 82, durationFar: 198, compliancePercent: 78 },
  { date: '9 Jan 2026', dayLabel: 'Kemarin', status: 'risk_myopia', startTime: '09:00', endTime: '18:20', durationClose: 210, durationFar: 110, compliancePercent: 42 },
  { date: '8 Jan 2026', dayLabel: 'Rabu', status: 'risk_myopia', startTime: '08:30', endTime: '17:00', durationClose: 185, durationFar: 125, compliancePercent: 38 },
  { date: '7 Jan 2026', dayLabel: 'Selasa', status: 'normal', startTime: '08:45', endTime: '15:30', durationClose: 95, durationFar: 225, compliancePercent: 84 },
  { date: '6 Jan 2026', dayLabel: 'Senin', status: 'normal', startTime: '08:00', endTime: '16:15', durationClose: 68, durationFar: 247, compliancePercent: 91 },
  { date: '5 Jan 2026', dayLabel: 'Minggu', status: 'normal', startTime: '10:20', endTime: '14:00', durationClose: 40, durationFar: 140, compliancePercent: 89 },
  { date: '4 Jan 2026', dayLabel: 'Sabtu', status: 'risk_fatigue', startTime: '07:30', endTime: '22:00', durationClose: 340, durationFar: 170, compliancePercent: 21 },
]

const statusBadge = (status: string) => {
  switch (status) {
    case 'normal': return <Badge variant="success">Normal</Badge>
    case 'risk_myopia': return <Badge variant="warning">Risiko Dekat</Badge>
    case 'risk_fatigue': return <Badge variant="error">Kelelahan Mata</Badge>
    default: return <Badge variant="default">Unknown</Badge>
  }
}

function DurationBar({ close, far }: { close: number; far: number }) {
  const total = close + far
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
  const [expandedSection, setExpandedSection] = useState<'daily' | 'weekly' | null>('daily')
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          eyebrow="Catatan Riwayat"
          title="Log Monitoring"
          description="Pantau histori durasi tatap layar dan status kesehatan mata harian serta mingguan Anda."
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
              {/* Jam Monitoring */}
              <div className="flex items-center gap-6 pt-4 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span>Mulai: <strong className="text-text">{mockDailyLog.startTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error/60" />
                  <span>Selesai: <strong className="text-text">{mockDailyLog.endTime}</strong></span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Tatap Dekat</span>
                  <div className="text-4xl font-bold text-error leading-none">{mockDailyLog.durationClose}</div>
                  <p className="text-xs text-text-muted mt-2">menit (&lt; 30cm)</p>
                </div>
                <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Tatap Aman</span>
                  <div className="text-4xl font-bold text-success leading-none">{mockDailyLog.durationFar}</div>
                  <p className="text-xs text-text-muted mt-2">menit (≥ 30cm)</p>
                </div>
                <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-2">Kepatuhan Istirahat</span>
                  <div className={cn('text-4xl font-bold leading-none', mockDailyLog.compliancePercent >= 70 ? 'text-success' : 'text-warning')}>
                    {mockDailyLog.compliancePercent}%
                  </div>
                  <p className="text-xs text-text-muted mt-2">target ≥ 70%</p>
                </div>
              </div>

              {/* Distribusi Bar */}
              <DurationBar close={mockDailyLog.durationClose} far={mockDailyLog.durationFar} />
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
              <div className="space-y-2 pt-4">
                {mockWeeklyHistory.map((item, idx) => (
                  <div key={idx} className="border border-border rounded-2xl overflow-hidden">
                    {/* Row header — clickable to expand */}
                    <button
                      onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                      className="w-full grid grid-cols-12 items-center text-sm py-3.5 px-5 hover:bg-surface-2/30 transition-colors text-left"
                    >
                      <div className="col-span-4">
                        <p className="font-semibold text-text">{item.dayLabel}</p>
                        <p className="text-xs text-text-muted">{item.date}</p>
                      </div>
                      <div className="col-span-3 text-xs text-text-muted">
                        {item.startTime} – {item.endTime}
                      </div>
                      <div className="col-span-3">
                        {statusBadge(item.status)}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform duration-200', expandedDay === idx && 'rotate-180')} />
                      </div>
                    </button>

                    {/* Expandable Detail */}
                    {expandedDay === idx && (
                      <div className="px-5 pb-4 pt-2 bg-surface-2/30 border-t border-border animate-fade-in">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Tatap Dekat</p>
                            <p className="text-xl font-bold text-error">{item.durationClose} <span className="text-xs font-normal">mnt</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Tatap Aman</p>
                            <p className="text-xl font-bold text-success">{item.durationFar} <span className="text-xs font-normal">mnt</span></p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Kepatuhan</p>
                            <p className={cn('text-xl font-bold', item.compliancePercent >= 70 ? 'text-success' : 'text-warning')}>
                              {item.compliancePercent}%
                            </p>
                          </div>
                        </div>
                        <DurationBar close={item.durationClose} far={item.durationFar} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
