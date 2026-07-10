'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyLog {
  date: string
  durationsShort: number
  durationsLong: number
}

interface WeeklyHistory {
  date: string
  status: 'normal' | 'risk_myopia' | 'risk_fatigue'
}

const mockDailyLog: DailyLog = {
  date: 'Hari Ini (10 Januari 2026)',
  durationsShort: 5,
  durationsLong: 2,
}

const mockWeeklyHistory: WeeklyHistory[] = [
  { date: '10 Januari 2026', status: 'normal' },
  { date: '9 Januari 2026', status: 'risk_myopia' },
  { date: '8 Januari 2026', status: 'risk_myopia' },
  { date: '7 Januari 2026', status: 'normal' },
  { date: '6 Januari 2026', status: 'normal' },
  { date: '5 Januari 2026', status: 'normal' },
  { date: '4 Januari 2026', status: 'risk_fatigue' },
]

export default function LogPage() {
  const [expandedSection, setExpandedSection] = useState<'daily' | 'weekly' | null>('daily')

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-graphite'
      case 'risk_myopia':
      case 'risk_fatigue':
        return 'text-signal-blue'
      default:
        return 'text-ash'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal'
      case 'risk_myopia':
        return 'Risiko Mata Lalah'
      case 'risk_fatigue':
        return 'Kelelahan Mata'
      default:
        return 'Unknown'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Editorial Page Header */}
        <div className="border-b border-mist/40 pb-6">
          <span className="text-xs font-bold font-af text-signal-blue uppercase tracking-widest">
            Catatan Riwayat
          </span>
          <h1 className="font-ppmondwest text-4xl text-graphite font-normal tracking-tight mt-2">
            Log Monitoring
          </h1>
          <p className="font-af text-sm text-ash mt-1">
            Pantau history durasi tatap layar dan status kesehatan mata harian serta mingguan Anda.
          </p>
        </div>

        {/* Daily Log Section */}
        <div className="bg-paper border border-mist shadow-subtle rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
            className="w-full flex items-center justify-between p-6 hover:bg-linen/50 transition-colors"
          >
            <h2 className="font-ppmondwest text-xl text-graphite font-normal tracking-tight">
              Hasil Pantau Hari Ini
            </h2>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-ash transition-transform duration-200",
                expandedSection === 'daily' ? "rotate-180" : ""
              )}
            />
          </button>

          {expandedSection === 'daily' && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-linen border border-mist rounded-lg p-5 text-center">
                  <div className="font-ppmondwest text-5xl text-ink-black leading-none">
                    {mockDailyLog.durationsShort}
                  </div>
                  <div className="text-[10px] text-ash font-semibold uppercase tracking-wider mt-3 font-af">
                    Durasi Tatap Dekat (Sesi)
                  </div>
                </div>
                <div className="bg-linen border border-mist rounded-lg p-5 text-center">
                  <div className="font-ppmondwest text-5xl text-ink-black leading-none">
                    {mockDailyLog.durationsLong}
                  </div>
                  <div className="text-[10px] text-ash font-semibold uppercase tracking-wider mt-3 font-af">
                    Durasi Tatap Jauh (Sesi)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly History Section */}
        <div className="bg-paper border border-mist shadow-subtle rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'weekly' ? null : 'weekly')}
            className="w-full flex items-center justify-between p-6 hover:bg-linen/50 transition-colors"
          >
            <h2 className="font-ppmondwest text-xl text-graphite font-normal tracking-tight">
              History Satu Pekan Terakhir
            </h2>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-ash transition-transform duration-200",
                expandedSection === 'weekly' ? "rotate-180" : ""
              )}
            />
          </button>

          {expandedSection === 'weekly' && (
            <div className="px-6 pb-6">
              <div className="border border-mist rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-linen font-af text-[11px] font-bold text-ash uppercase tracking-wider border-b border-mist">
                  <div className="col-span-1 px-4 py-3">Tanggal</div>
                  <div className="col-span-2 px-4 py-3">Status Deteksi</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-mist/50">
                  {mockWeeklyHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "grid grid-cols-3 font-af text-sm py-3",
                        idx % 2 === 0 ? "bg-paper" : "bg-linen/40"
                      )}
                    >
                      <div className="col-span-1 px-4 text-charcoal font-medium">
                        {item.date}
                      </div>
                      <div className={cn("col-span-2 px-4 font-semibold", getStatusTextColor(item.status))}>
                        {getStatusLabel(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-linen border border-mist rounded-lg p-4 flex gap-3 items-start shadow-sm">
          <Info className="w-5 h-5 text-twilight shrink-0 mt-0.5" />
          <div className="text-sm text-charcoal font-af leading-relaxed">
            Data history akan otomatis diperbarui dan disinkronisasikan saat sistem terhubung dengan backend SocaSob.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
