'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 dark:text-green-400'
      case 'risk_myopia':
        return 'text-orange-600 dark:text-orange-400'
      case 'risk_fatigue':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
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
      <div className="relative z-0 min-h-[calc(100vh-80px)] overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-100/50 to-blue-50/30 z-[-20] pointer-events-none" />
        <div className="absolute inset-0 z-[-15] pointer-events-none flex items-center justify-center opacity-10">
          <Image
            src="/images/Logo Socasob.png"
            alt="Socasob Logo Watermark"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl z-[-10] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Log Monitoring</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-1">Lihat history monitoring harian dan mingguan</p>
        </div>

        {/* Daily Log Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl overflow-hidden shadow-lg border-2 border-yellow-200 dark:border-slate-600">
          <button
            onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
            className="w-full flex items-center justify-between p-6 hover:bg-yellow-100 dark:hover:bg-slate-600 transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hasil Pantau Hari Ini</h2>
            <ChevronDown
              className={`w-6 h-6 transition-transform ${
                expandedSection === 'daily' ? 'rotate-180' : ''
              } text-gray-700 dark:text-gray-300`}
            />
          </button>

          {expandedSection === 'daily' && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-700 rounded-xl p-4 text-center shadow-md">
                  <div className="text-4xl font-bold text-red-500">{mockDailyLog.durationsShort}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Durasi Tatap Dekat</div>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-xl p-4 text-center shadow-md">
                  <div className="text-4xl font-bold text-green-500">{mockDailyLog.durationsLong}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Durasi Tatap Jauh</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly History Section */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-200 dark:border-slate-600">
          <button
            onClick={() => setExpandedSection(expandedSection === 'weekly' ? null : 'weekly')}
            className="w-full flex items-center justify-between p-6 hover:bg-cyan-100 dark:hover:bg-slate-600 transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">History Satu Pekan Terakhir</h2>
            <ChevronDown
              className={`w-6 h-6 transition-transform ${
                expandedSection === 'weekly' ? 'rotate-180' : ''
              } text-gray-700 dark:text-gray-300`}
            />
          </button>

          {expandedSection === 'weekly' && (
            <div className="px-6 pb-6">
              <div className="space-y-0 rounded-xl overflow-hidden border-2 border-cyan-200 dark:border-slate-600">
                {/* Header */}
                <div className="grid grid-cols-3 bg-cyan-200 dark:bg-slate-600 font-bold text-gray-800 dark:text-white">
                  <div className="col-span-1 px-4 py-3">Tanggal</div>
                  <div className="col-span-2 px-4 py-3">Status Deteksi</div>
                </div>

                {/* Rows */}
                {mockWeeklyHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-3 border-t border-cyan-200 dark:border-slate-600 ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-700'
                        : 'bg-cyan-50 dark:bg-slate-750'
                    }`}
                  >
                    <div className="col-span-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                      {item.date}
                    </div>
                    <div className={`col-span-2 px-4 py-3 font-bold ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Data history akan otomatis diperbarui saat terhubung dengan backend.
          </p>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
