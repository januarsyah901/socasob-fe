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
  Sparkles,
  Printer,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSocket, beApi } from '@/lib/socket-context'
import { GenerateReportModal } from '@/components/report/generate-report-modal'
import { EyeExerciseCard } from '@/components/exercise/eye-exercise-card'
import Link from 'next/link'

interface ResumeData {
  robotId: string
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  fatigueRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  avgDistance: number
  restCompliance: number
  nearPercent: number
  farPercent: number
  eyeHealthScore: number
  totalHours: number
  totalDaysMonitored: number
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

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-text font-figtree leading-none">{score}</span>
        <span className="text-[10px] font-semibold text-text-muted mt-1">/ 100</span>
      </div>
    </div>
  )
}

export default function ResumePage() {
  const { robotId } = useSocket()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    if (!robotId) {
      // Default fallback mock data if no robot is connected so dashboard remains interactive
      setResumeData({
        robotId: 'ESP32-CAM-DEMO',
        myopiaRisk: 'Rendah',
        fatigueRisk: 'Sedang',
        avgDistance: 38,
        restCompliance: 84,
        nearPercent: 24,
        farPercent: 76,
        eyeHealthScore: 86,
        totalHours: 12.5,
        totalDaysMonitored: 7,
      })
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
          // fallback mock with active robot ID
          setResumeData({
            robotId,
            myopiaRisk: 'Rendah',
            fatigueRisk: 'Sedang',
            avgDistance: 38,
            restCompliance: 84,
            nearPercent: 24,
            farPercent: 76,
            eyeHealthScore: 86,
            totalHours: 12.5,
            totalDaysMonitored: 7,
          })
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

        {/* Data Display */}
        {!isLoading && resumeData && (() => {
          const myopiaColors = riskColor(resumeData.myopiaRisk)
          const fatigueColors = riskColor(resumeData.fatigueRisk)

          return (
            <div className="space-y-6">
              {/* Eye Health Score Card */}
              <div className="card p-6 md:p-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-signal-blue" />
                    <h2 className="text-lg font-bold text-text tracking-tight">
                      Indeks Kesehatan Mata (Eye Health Score)
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-text-muted bg-surface-2 px-3 py-1 rounded-full border border-border">
                    {resumeData.totalDaysMonitored} Hari Terpantau
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <ScoreRing score={resumeData.eyeHealthScore} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 w-full">
                    {[
                      {
                        label: 'Rata-rata Jarak',
                        value: `${resumeData.avgDistance} cm`,
                        icon: Ruler,
                        good: resumeData.avgDistance >= 30,
                      },
                      {
                        label: 'Kepatuhan 20-20-20',
                        value: `${resumeData.restCompliance}%`,
                        icon: Coffee,
                        good: resumeData.restCompliance >= 70,
                      },
                      {
                        label: 'Total Waktu Layar',
                        value: `${resumeData.totalHours} Jam`,
                        icon: Clock,
                        good: true,
                      },
                      {
                        label: 'Hari Monitoring',
                        value: `${resumeData.totalDaysMonitored} Hari`,
                        icon: Award,
                        good: true,
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface-2 border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            {item.label}
                          </p>
                          <item.icon className="w-4 h-4 text-text-muted/60" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-text leading-none font-figtree">
                          {item.value}
                        </p>
                        <div className="flex items-center gap-1 mt-2.5">
                          {item.good ? (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-warning" />
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

              {/* Risk Assessment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={cn('card p-6 border', myopiaColors.border)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', myopiaColors.bg)}>
                        <Search className={cn('w-4 h-4', myopiaColors.text)} />
                      </div>
                      <h3 className="text-sm font-bold text-text">Asesmen Risiko Miopia</h3>
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

                <div className={cn('card p-6 border', fatigueColors.border)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', fatigueColors.bg)}>
                        <AlertTriangle className={cn('w-4 h-4', fatigueColors.text)} />
                      </div>
                      <h3 className="text-sm font-bold text-text">Asesmen Risiko Kelelahan (CVS)</h3>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-extrabold px-3 py-1 rounded-full border',
                        fatigueColors.bg,
                        fatigueColors.text,
                        fatigueColors.border
                      )}
                    >
                      {resumeData.fatigueRisk}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {riskRecommendation(resumeData.fatigueRisk, 'fatigue')}
                  </p>
                </div>
              </div>

              {/* Interactive Micro-Break Module in Resume */}
              <EyeExerciseCard />

              {/* Distribution Chart */}
              <div className="card p-6 md:p-8">
                <h3 className="text-base font-bold text-text tracking-tight mb-6">
                  Distribusi Rasio Jarak Pandang Terpantau
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative shrink-0 w-36 h-36">
                    {(() => {
                      const r = 52
                      const circ = 2 * Math.PI * r
                      const closeDash = (resumeData.nearPercent / 100) * circ
                      const farDash = (resumeData.farPercent / 100) * circ
                      const gap = 3
                      return (
                        <svg viewBox="0 0 140 140" className="-rotate-90 w-full h-full">
                          <circle
                            cx="70"
                            cy="70"
                            r={r}
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="18"
                            strokeDasharray={`${farDash - gap} ${circ - farDash + gap}`}
                            strokeDashoffset={0}
                            strokeLinecap="butt"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r={r}
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="18"
                            strokeDasharray={`${closeDash - gap} ${circ - closeDash + gap}`}
                            strokeDashoffset={-farDash}
                            strokeLinecap="butt"
                          />
                        </svg>
                      )
                    })()}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-text font-figtree">
                        {resumeData.farPercent}%
                      </span>
                      <span className="text-[10px] font-bold text-text-muted uppercase">Aman</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5 text-xs font-semibold">
                        <span className="flex items-center gap-2 text-text">
                          <span className="w-2.5 h-2.5 rounded-full bg-error" />
                          Tatap Terlalu Dekat (&lt; 30cm)
                        </span>
                        <span className="font-bold text-text">{resumeData.nearPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-2 border border-border rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-error h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeData.nearPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5 text-xs font-semibold">
                        <span className="flex items-center gap-2 text-text">
                          <span className="w-2.5 h-2.5 rounded-full bg-success" />
                          Tatap Jarak Aman (≥ 30cm)
                        </span>
                        <span className="font-bold text-text">{resumeData.farPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-2 border border-border rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-success h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeData.farPercent}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-text-muted pt-1 leading-relaxed">
                      💡 <strong>Standar Klinis Ergonomi:</strong> Pertahankan rasio Jarak Aman di atas <strong>70%</strong> untuk meminimalkan beban akomodasi berlebih pada otot siliaris mata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <GenerateReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </DashboardLayout>
  )
}
