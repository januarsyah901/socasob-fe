'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Eye, Search, Ruler, Coffee, Clock, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResumeData {
  myopiaRisk: string
  fatigueRisk: string
  avgDistance: number
  restCompliance: number
  nearPercent: number
  farPercent: number
  eyeHealthScore: number
  totalHours: number
}

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz'

  useEffect(() => {
    async function fetchResume() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${baseUrl}/api/resume`)
        if (!res.ok) throw new Error('Gagal mengambil data resume dari server.')
        const json = await res.json()
        if (json.success && json.data) {
          setResumeData(json.data)
        } else {
          throw new Error('Format respon tidak sesuai.')
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Terjadi kesalahan koneksi backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchResume()
  }, [baseUrl])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Editorial Page Header */}
        <div className="border-b border-mist/40 pb-6">
          <span className="text-xs font-bold font-af text-signal-blue uppercase tracking-widest">
            Ikhtisar Data
          </span>
          <h1 className="font-ppmondwest text-4xl text-graphite font-normal tracking-tight mt-2">
            Resume Kesehatan Mata
          </h1>
          <p className="font-af text-sm text-ash mt-1">
            Ringkasan data pemantauan dan analisis kebiasaan menatap layar selama 6 bulan terakhir.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-paper border border-mist shadow-subtle rounded-xl">
            <Loader2 className="w-8 h-8 text-twilight animate-spin" />
            <p className="text-sm text-ash font-af">Menganalisis data kesehatan mata...</p>
          </div>
        ) : error ? (
          <div className="bg-linen border border-mist rounded-xl p-8 text-center space-y-3">
            <p className="text-sm text-charcoal font-semibold font-af">Gagal memuat resume</p>
            <p className="text-xs text-ash font-af">{error}</p>
          </div>
        ) : resumeData ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Main Grid */}
            <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
              <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight mb-6">
                Ringkasan 6 Bulan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Eye Health Score */}
                <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Eye Health Score</p>
                    <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">
                      {resumeData.eyeHealthScore}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-twilight" />
                </div>

                {/* Risiko Miopia */}
                <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Risiko Miopia</p>
                    <p className="font-ppmondwest text-3xl text-graphite mt-2.5 font-normal leading-none">
                      {resumeData.myopiaRisk}
                    </p>
                  </div>
                  <Search className="w-8 h-8 text-twilight" />
                </div>

                {/* Rata-rata Jarak Mata */}
                <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Rata-rata Jarak Mata</p>
                    <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">
                      {resumeData.avgDistance} cm
                    </p>
                  </div>
                  <Ruler className="w-8 h-8 text-twilight" />
                </div>

                {/* Kepatuhan Istirahat */}
                <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Kepatuhan Istirahat</p>
                    <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">
                      {resumeData.restCompliance}%
                    </p>
                  </div>
                  <Coffee className="w-8 h-8 text-twilight" />
                </div>

                {/* Total Jam Monitoring */}
                <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between md:col-span-2">
                  <div>
                    <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Total Jam Monitoring</p>
                    <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">
                      {resumeData.totalHours} Jam
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-twilight" />
                </div>
              </div>
            </div>

            {/* Breakdown Chart Card */}
            <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
              <h3 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight mb-6">
                Distribusi Monitoring
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 font-af text-sm">
                    <span className="text-charcoal font-medium">Tatap Dekat</span>
                    <span className="text-ink-black font-bold">{resumeData.nearPercent}%</span>
                  </div>
                  <div className="w-full bg-linen border border-mist rounded-full h-3 overflow-hidden">
                    <div className="bg-twilight h-full transition-all duration-500" style={{ width: `${resumeData.nearPercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2 font-af text-sm">
                    <span className="text-charcoal font-medium">Tatap Jauh</span>
                    <span className="text-ink-black font-bold">{resumeData.farPercent}%</span>
                  </div>
                  <div className="w-full bg-linen border border-mist rounded-full h-3 overflow-hidden">
                    <div className="bg-mist h-full transition-all duration-500" style={{ width: `${resumeData.farPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Info Box */}
        <div className="bg-linen border border-mist rounded-lg p-4 flex gap-3 items-start shadow-sm">
          <div className="text-sm text-charcoal font-af leading-relaxed">
            💡 Data resume dihitung secara otomatis berdasarkan histori harian Anda selama periode 6 bulan terakhir.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
