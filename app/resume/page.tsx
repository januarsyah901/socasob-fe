'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import {
  Eye,
  Search,
  Ruler,
  Coffee,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  FileText,
  Printer,
  Info,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSocket, beApi } from '@/lib/socket-context'
import { GenerateReportModal } from '@/components/report/generate-report-modal'
import { EyeExerciseCard } from '@/components/exercise/eye-exercise-card'
import { EmptyState } from '@/components/ui/empty-state'
import { TrendLineChart, type TrendPoint } from '@/components/resume/trend-line-chart'
import Link from 'next/link'

interface ResumeData {
  robotId: string
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  fatigueRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  avgDistance: number
  restCompliance: number
  nearPercent: number
  farPercent: number
  totalHours: number
  totalDaysMonitored: number
  trend?: TrendPoint[]
}

const riskColor = (level: 'Rendah' | 'Sedang' | 'Tinggi') => {
  switch (level) {
    case 'Rendah':
      return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' }
    case 'Sedang':
      return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' }
    case 'Tinggi':
      return { text: 'text-error', bg: 'bg-error/10', border: 'border-error/30' }
  }
}

const riskRecommendation = (level: 'Rendah' | 'Sedang' | 'Tinggi', type: 'myopia' | 'fatigue') => {
  if (type === 'myopia') {
    if (level === 'Rendah') return 'Jarak rata-rata aman (≥30 cm). Kebiasaan ergonomis sangat baik.'
    if (level === 'Sedang') return 'Terapkan peringatan jarak. Jaga posisi monitor minimal 35-45 cm.'
    return 'Segera kurangi waktu tatap dekat terus menerus. Konsultasikan dengan dokter spesialis mata.'
  }
  if (level === 'Rendah') return 'Pola istirahat 20-20-20 terpelihara dengan teratur.'
  if (level === 'Sedang') return 'Tingkatkan frekuensi jeda istirahat mata setiap 20 menit kerja.'
  return 'Kelelahan ekstrem terdeteksi. Lakukan senam mata dan relaksasi palming segera.'
}

export default function ResumePage() {
  const { robotId } = useSocket()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  useEffect(() => {
    const handleDismiss = () => setActiveTooltip(null)
    if (activeTooltip) {
      window.addEventListener('click', handleDismiss)
      return () => window.removeEventListener('click', handleDismiss)
    }
  }, [activeTooltip])

  useEffect(() => {
    if (!robotId) {
      setError('Belum ada robot yang terhubung. Pilih robot di halaman Pengaturan.')
      return
    }

    const fetchResume = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await beApi(`/api/resume?robotId=${encodeURIComponent(robotId)}`)
        if (data.success && data.data) {
          setResumeData(data.data)
        } else {
          setError(data.error || 'Belum ada data monitoring 6 bulan terakhir untuk robot ini.')
        }
      } catch {
        setError('Gagal mengambil data dari server backend')
      } finally {
        setIsLoading(false)
      }
    }
    fetchResume()
  }, [robotId])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          title="Resume & Evaluasi Kesehatan Netra"
          subtitle={
            robotId
              ? `Analisis akumulatif kebiasaan menatap layar untuk perangkat: ${robotId}`
              : 'Ringkasan komprehensif metrik penglihatan, estimasi risiko miopia, dan kepatuhan 20-20-20.'
          }
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReportModalOpen(true)}
                className="gap-2 font-semibold text-xs shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Ekspor Laporan Medis (PDF)</span>
              </Button>
            </div>
          }
        />

        {/* Loading state */}
        {isLoading && (
          <div className="card-sm p-10 flex items-center justify-center gap-3 text-sm text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-signal-blue" />
            Mengambil data resume analitik dari server…
          </div>
        )}

        {/* Error / Empty state */}
        {!isLoading && error && (
          <EmptyState
            variant="dashed"
            icon={AlertTriangle}
            title="Resume Data Belum Tersedia"
            description={error}
          />
        )}

        {/* Data Display */}
        {!isLoading && !error && resumeData && (() => {
          const myopiaColors = riskColor(resumeData.myopiaRisk)

          return (
            <div className="space-y-6">
              {/* Eye Health Score Card */}
              <div className="card p-6 md:p-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-signal-blue" />
                    <h2 className="text-lg font-bold text-text tracking-tight">
                      Ringkasan Kesehatan Mata
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-text-muted bg-surface-2 px-3 py-1 rounded-full border border-border">
                    {resumeData.totalDaysMonitored} Hari Terpantau
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 w-full">
                    {[
                      {
                        id: 'avgDistance',
                        label: 'Rata-rata Jarak',
                        value: `${resumeData.avgDistance} cm`,
                        good: resumeData.avgDistance >= 30,
                        tooltipTitle: 'Rata-rata Jarak Layar',
                        tooltipDesc:
                          'Estimasi jarak pandang ke monitor berdasarkan pembobotan durasi tatap dekat (< 30 cm) dan aman (≥ 30 cm). Batas optimal adalah ≥ 30 cm.',
                      },
                      {
                        id: 'restCompliance',
                        label: 'Kepatuhan 20-20-20',
                        value: `${resumeData.restCompliance}%`,
                        good: resumeData.restCompliance >= 70,
                        tooltipTitle: 'Kepatuhan Aturan 20-20-20',
                        tooltipDesc:
                          'Persentase kedisiplinan jeda 20 detik setiap 20 menit menatap layar. Dihitung dari rasio slot kerja harian yang dipatuhi. Nilai optimal adalah ≥ 70%.',
                      },
                      {
                        id: 'totalHours',
                        label: 'Total Waktu Layar',
                        value: `${resumeData.totalHours} Jam`,
                        good: true,
                        tooltipTitle: 'Total Waktu Layar',
                        tooltipDesc:
                          'Akumulasi jam kerja aktif di depan monitor yang tercatat oleh kamera sensor SocaSob selama periode pemantauan.',
                      },
                      {
                        id: 'daysMonitored',
                        label: 'Hari Monitoring',
                        value: `${resumeData.totalDaysMonitored} Hari`,
                        good: true,
                        tooltipTitle: 'Hari Monitoring Aktif',
                        tooltipDesc:
                          'Jumlah hari kalender unik saat perangkat SocaSob aktif memantau dan merekam kebiasaan visual pengguna.',
                      },
                    ].map((item) => (
                      <div key={item.id} className="bg-surface-2 border border-border rounded-2xl p-4 relative min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider truncate">
                            {item.label}
                          </p>

                          {/* Info Button with Hover & Click Tooltip */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveTooltip(activeTooltip === item.id ? null : item.id)
                              }}
                              onMouseEnter={() => setActiveTooltip(item.id)}
                              onMouseLeave={() => setActiveTooltip(null)}
                              className="rounded-full p-1 text-text-muted hover:text-signal-blue hover:bg-surface transition-colors cursor-pointer focus:outline-none"
                              aria-label={`Informasi ${item.label}`}
                            >
                              <Info className="w-3.5 h-3.5 text-text-muted/70 hover:text-signal-blue transition-colors" />
                            </button>

                            {/* Floating Tooltip Card */}
                            {activeTooltip === item.id && (
                              <div
                                role="tooltip"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-7 z-30 w-56 sm:w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-white/10 animate-fade-in pointer-events-auto"
                              >
                                <div className="absolute right-2.5 -top-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-white/10" />
                                <p className="font-bold text-active-teal text-[11px] mb-1">
                                  {item.tooltipTitle}
                                </p>
                                <p className="text-[10px] text-slate-200 leading-relaxed font-normal">
                                  {item.tooltipDesc}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xl md:text-2xl font-black text-text leading-none font-figtree">
                          {item.value}
                        </p>
                        <div className="flex items-center gap-1 mt-2.5">
                          {item.good ? (
                            <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-[10px] font-bold',
                              item.good ? 'text-success' : 'text-warning'
                            )}
                          >
                            {item.good ? 'Optimal' : 'Perlu Perhatian'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Assessment Card */}
              <div className={cn('card p-6 border', myopiaColors.border)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', myopiaColors.bg)}>
                      <Search className={cn('w-4 h-4', myopiaColors.text)} />
                    </div>
                    <h3 className="text-sm font-bold text-text">Risiko Miopia</h3>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-extrabold px-3 py-1 rounded-full border',
                      myopiaColors.bg,
                      myopiaColors.text,
                      myopiaColors.border
                    )}
                  >
                    {resumeData.myopiaRisk}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {riskRecommendation(resumeData.myopiaRisk, 'myopia')}
                </p>
              </div>

              {/* Interactive Micro-Break Module in Resume */}
              <EyeExerciseCard />

              {/* Line Chart Tren Longitudinal */}
              <TrendLineChart
                trend={resumeData.trend || []}
                robotId={resumeData.robotId}
              />
            </div>
          )
        })()}
      </div>

      <GenerateReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </DashboardLayout>
  )
}
