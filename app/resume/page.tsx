'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { Eye, Search, Ruler, Coffee, Clock, Award, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import { useSocket, beApi } from '@/lib/socket-context'

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
    case 'Rendah': return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' }
    case 'Sedang': return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' }
    case 'Tinggi': return { text: 'text-error', bg: 'bg-error/10', border: 'border-error/30' }
  }
}

const riskRecommendation = (level: 'Rendah' | 'Sedang' | 'Tinggi', type: 'myopia' | 'fatigue') => {
  if (type === 'myopia') {
    if (level === 'Rendah') return 'Jarak rata-rata aman. Pertahankan kebiasaan ini.'
    if (level === 'Sedang') return 'Perhatikan jarak layar. Pastikan minimal 30 cm.'
    return 'Segera kurangi waktu tatap dekat. Konsultasi dokter mata.'
  }
  if (level === 'Rendah') return 'Istirahat mata Anda sudah cukup dan teratur.'
  if (level === 'Sedang') return 'Tingkatkan frekuensi istirahat. Terapkan aturan 20-20-20.'
  return 'Kelelahan tinggi terdeteksi. Segera istirahkan mata Anda.'
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-text leading-none">{score}</span>
        <span className="text-xs text-text-muted mt-1">/ 100</span>
      </div>
    </div>
  )
}

export default function ResumePage() {
  const { robotId } = useSocket()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!robotId) return
    const fetchResume = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await beApi(`/api/resume?robotId=${encodeURIComponent(robotId)}`)
        if (data.success) {
          setResumeData(data.data)
        } else {
          setResumeData(null)
          setError(data.error || 'Belum ada data resume')
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
          eyebrow="Ikhtisar Data"
          title="Resume Kesehatan Mata"
          description={robotId
            ? `Ringkasan 6 bulan terakhir untuk robot: ${robotId}`
            : 'Ringkasan data pemantauan dan analisis kebiasaan menatap layar selama 6 bulan terakhir.'}
        />

        {/* No robot selected */}
        {!robotId && (
          <div className="card-sm p-10 text-center text-sm text-text-muted">
            <p className="font-semibold text-text mb-2">Belum ada robot yang dipilih</p>
            <p>Atur Robot ID di halaman <a href="/settings" className="text-signal-blue font-medium hover:underline">Pengaturan</a> terlebih dahulu.</p>
          </div>
        )}

        {/* Loading */}
        {robotId && isLoading && (
          <div className="card-sm p-10 flex items-center justify-center gap-3 text-sm text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Mengambil data resume dari server…
          </div>
        )}

        {/* Error / No data */}
        {robotId && !isLoading && error && (
          <div className="card-sm p-10 text-center text-sm text-text-muted">
            <p className="font-semibold text-text mb-2">Data belum tersedia</p>
            <p>{error}</p>
            <p className="text-xs mt-2 text-text-muted/70">Data akan muncul setelah robot mengirim monitoring selama beberapa waktu.</p>
          </div>
        )}

        {/* Real data */}
        {robotId && !isLoading && resumeData && (() => {
          const myopiaColors = riskColor(resumeData.myopiaRisk)
          const fatigueColors = riskColor(resumeData.fatigueRisk)

          return (
            <>
              {/* Eye Health Score */}
              <div className="card-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <Award className="w-5 h-5 text-signal-blue" />
                  <h2 className="text-lg font-semibold text-text tracking-tight">Eye Health Score</h2>
                  <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <span>{resumeData.totalDaysMonitored} hari dipantau</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative shrink-0">
                    <ScoreRing score={resumeData.eyeHealthScore} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                    {[
                      { label: 'Rata-rata Jarak Mata', value: `${resumeData.avgDistance} cm`, icon: Ruler, good: resumeData.avgDistance >= 30 },
                      { label: 'Kepatuhan Istirahat', value: `${resumeData.restCompliance}%`, icon: Coffee, good: resumeData.restCompliance >= 70 },
                      { label: 'Total Monitoring', value: `${resumeData.totalHours} Jam`, icon: Clock, good: true },
                      { label: 'Hari Dipantau', value: `${resumeData.totalDaysMonitored} Hari`, icon: Award, good: true },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface-2 border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{item.label}</p>
                          <item.icon className="w-4 h-4 text-text-muted/60" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-text leading-none">{item.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {item.good
                            ? <CheckCircle2 className="w-3 h-3 text-success" />
                            : <AlertTriangle className="w-3 h-3 text-warning" />
                          }
                          <span className={cn('text-[10px] font-semibold', item.good ? 'text-success' : 'text-warning')}>
                            {item.good ? 'Baik' : 'Perlu Perhatian'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={cn('card-sm p-6 border', myopiaColors.border)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', myopiaColors.bg)}>
                        <Search className={cn('w-4 h-4', myopiaColors.text)} />
                      </div>
                      <h3 className="text-sm font-semibold text-text">Risiko Miopia</h3>
                    </div>
                    <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full', myopiaColors.bg, myopiaColors.text)}>
                      {resumeData.myopiaRisk}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {riskRecommendation(resumeData.myopiaRisk, 'myopia')}
                  </p>
                </div>

                <div className={cn('card-sm p-6 border', fatigueColors.border)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', fatigueColors.bg)}>
                        <AlertTriangle className={cn('w-4 h-4', fatigueColors.text)} />
                      </div>
                      <h3 className="text-sm font-semibold text-text">Risiko Kelelahan</h3>
                    </div>
                    <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full', fatigueColors.bg, fatigueColors.text)}>
                      {resumeData.fatigueRisk}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {riskRecommendation(resumeData.fatigueRisk, 'fatigue')}
                  </p>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="card-sm p-6 md:p-8">
                <h3 className="text-lg font-semibold text-text tracking-tight mb-6">
                  Distribusi Waktu Tatap (6 Bulan)
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative shrink-0 w-36 h-36">
                    {(() => {
                      const r = 52
                      const circ = 2 * Math.PI * r
                      const closeDash = (resumeData.nearPercent / 100) * circ
                      const farDash = (resumeData.farPercent / 100) * circ
                      const gap = 4
                      return (
                        <svg viewBox="0 0 140 140" className="-rotate-90 w-full h-full">
                          <circle cx="70" cy="70" r={r} fill="none" stroke="#16a34a" strokeWidth="20"
                            strokeDasharray={`${farDash - gap} ${circ - farDash + gap}`}
                            strokeDashoffset={0} strokeLinecap="butt" />
                          <circle cx="70" cy="70" r={r} fill="none" stroke="#dc2626" strokeWidth="20"
                            strokeDasharray={`${closeDash - gap} ${circ - closeDash + gap}`}
                            strokeDashoffset={-(farDash)} strokeLinecap="butt" />
                        </svg>
                      )
                    })()}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-text">{resumeData.farPercent}%</span>
                      <span className="text-[10px] text-text-muted">Aman</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="flex items-center gap-2 text-text font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-error" />
                          Tatap Dekat (&lt; 30cm)
                        </span>
                        <span className="font-bold text-text">{resumeData.nearPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-2 border border-border rounded-full h-3 overflow-hidden">
                        <div className="bg-error h-full rounded-full transition-all duration-700" style={{ width: `${resumeData.nearPercent}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="flex items-center gap-2 text-text font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-success" />
                          Tatap Aman (≥ 30cm)
                        </span>
                        <span className="font-bold text-text">{resumeData.farPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-2 border border-border rounded-full h-3 overflow-hidden">
                        <div className="bg-success h-full rounded-full transition-all duration-700" style={{ width: `${resumeData.farPercent}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-text-muted pt-1">
                      * Idealnya, pertahankan persentase Jarak Aman di atas <strong>60%</strong> untuk mengurangi beban mata.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expert Recommendation */}
              <div className="bg-signal-blue/5 border border-signal-blue/20 rounded-2xl p-5">
                <p className="text-sm text-text-muted leading-relaxed">
                  <strong className="text-text">Rekomendasi Ahli:</strong> Lakukan aturan 20-20-20 (setiap 20 menit menatap layar, tataplah objek berjarak 20 kaki selama 20 detik) untuk menjaga kelembapan alami mata Anda.
                </p>
              </div>
            </>
          )
        })()}
      </div>
    </DashboardLayout>
  )
}
