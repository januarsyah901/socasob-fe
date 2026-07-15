'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { ChevronDown, Info, Loader2 } from 'lucide-react'
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

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${months[monthIdx]} ${year}`;
  }
  return dateStr;
};

export default function LogPage() {
  const [expandedSection, setExpandedSection] = useState<'daily' | 'weekly' | null>('daily')
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null)
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz'

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch Daily
        const dailyRes = await fetch(`${baseUrl}/api/log/today`)
        if (!dailyRes.ok) throw new Error('Gagal mengambil data harian dari backend.')
        const dailyData = await dailyRes.json()

        // Fetch Weekly
        const weeklyRes = await fetch(`${baseUrl}/api/log/weekly`)
        if (!weeklyRes.ok) throw new Error('Gagal mengambil data mingguan dari backend.')
        const weeklyData = await weeklyRes.json()

        if (dailyData.success && dailyData.data) {
          setDailyLog({
            date: `Hari Ini (${formatIndonesianDate(dailyData.data.date)})`,
            durationsShort: Math.round((dailyData.data.nearDuration || 0) / 60),
            durationsLong: Math.round((dailyData.data.farDuration || 0) / 60),
          })
        }

        if (weeklyData.success && Array.isArray(weeklyData.data)) {
          const formatted = weeklyData.data.map((item: any) => ({
            date: formatIndonesianDate(item.date),
            status: item.eyeHealthStatus || 'normal'
          })).reverse()
          setWeeklyHistory(formatted)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Terjadi kesalahan koneksi backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [baseUrl])

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
        return 'Risiko Mata Lelah'
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-paper border border-mist shadow-subtle rounded-xl">
            <Loader2 className="w-8 h-8 text-twilight animate-spin" />
            <p className="text-sm text-ash font-af">Memuat data monitoring...</p>
          </div>
        ) : error ? (
          <div className="bg-linen border border-mist rounded-xl p-8 text-center space-y-3">
            <p className="text-sm text-charcoal font-semibold font-af">Gagal memuat data riwayat</p>
            <p className="text-xs text-ash font-af">{error}</p>
          </div>
        ) : (
          <>
            {/* Daily Log Section */}
            <div className="bg-paper border border-mist shadow-subtle rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
                className="w-full flex items-center justify-between p-6 hover:bg-linen/50 transition-colors"
              >
                <h2 className="font-ppmondwest text-xl text-graphite font-normal tracking-tight">
                  {dailyLog ? dailyLog.date : 'Hasil Pantau Hari Ini'}
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
                        {dailyLog ? dailyLog.durationsShort : 0}
                      </div>
                      <div className="text-[10px] text-ash font-semibold uppercase tracking-wider mt-3 font-af">
                        Durasi Tatap Dekat (Menit)
                      </div>
                    </div>
                    <div className="bg-linen border border-mist rounded-lg p-5 text-center">
                      <div className="font-ppmondwest text-5xl text-ink-black leading-none">
                        {dailyLog ? dailyLog.durationsLong : 0}
                      </div>
                      <div className="text-[10px] text-ash font-semibold uppercase tracking-wider mt-3 font-af">
                        Durasi Tatap Jauh (Menit)
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
                  {weeklyHistory.length === 0 ? (
                    <p className="text-center py-6 text-sm text-ash font-af">Belum ada riwayat pekan ini.</p>
                  ) : (
                    <div className="border border-mist rounded-lg overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 bg-linen font-af text-[11px] font-bold text-ash uppercase tracking-wider border-b border-mist">
                        <div className="col-span-1 px-4 py-3">Tanggal</div>
                        <div className="col-span-2 px-4 py-3">Status Deteksi</div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-mist/50">
                        {weeklyHistory.map((item, idx) => (
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
                  )}
                </div>
              )}
            </div>
          </>
        )}

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
