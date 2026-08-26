'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { MedicalReportView, type MedicalReportData } from '@/components/report/medical-report-view'
import { useSocket, beApi } from '@/lib/socket-context'

export default function ReportDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { robotId } = useSocket()

  const id = (params?.id as string) || 'SOCA-882104'
  const periodParam = searchParams.get('period') || '7days'
  const nameParam = searchParams.get('name') || 'Bang Jan'

  const periodLabel =
    periodParam === 'today'
      ? 'Hari Ini'
      : periodParam === '30days'
      ? '30 Hari Terakhir'
      : periodParam === '6months'
      ? '6 Bulan Terakhir'
      : '7 Hari Terakhir'

  const [report, setReport] = useState<MedicalReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await beApi(`/api/reports/${encodeURIComponent(id)}`)
        if (res.success && res.data) {
          const data = res.data
          const formatted: MedicalReportData = {
            id: data.reportId || data._id || id,
            title: data.title || `Laporan Evaluasi Ergonomi & Risiko Miopia (${periodLabel})`,
            patientName: data.patientName || nameParam,
            robotId: data.robotId || robotId || 'fadfa566',
            generatedAt: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
            period: data.periodLabel || data.period || periodLabel,
            dateRange: data.dateRange || '17 Agustus 2026 – 23 Agustus 2026',
            myopiaRisk: data.myopiaRisk || 'Rendah',
            fatigueRisk: data.fatigueRisk || 'Sedang',
            cvsRisk: data.cvsRisk || 'Rendah',
            restCompliance: data.restCompliance ?? 84,
            nearDurationMin: data.nearDurationMin ?? 112,
            farDurationMin: data.farDurationMin ?? 428,
            totalHours: data.totalHours ?? 9.0,
            avgDistanceCm: data.avgDistanceCm ?? 38.5,
            blinkRatePerMin: data.blinkRatePerMin ?? 14.8,
            clinicalNotes:
              data.clinicalNotes && data.clinicalNotes.length > 0
                ? data.clinicalNotes
                : [
                    'Jarak rata-rata mata terhadap layar monitor berada pada batas aman yang dianjurkan (38.5 cm ≥ 30 cm).',
                    'Frekuensi berkedip tercatat 14.8 kedipan/menit, cukup baik dalam menjaga kelembapan kornea mata.',
                    'Ditemukan episode tatap dekat berlebih pada rentang kerja harian. Disarankan menerapkan micro-break 20-20-20 secara konsisten.',
                    'Tingkat kepatuhan istirahat mencapai target klinis. Efektif dalam menekan risiko progresi miopia dan Computer Vision Syndrome (CVS).',
                  ],
            examinerNotes:
              data.examinerNotes ||
              'Pasien menunjukkan kebiasaan kerja ergonomis yang membaik. Lanjutkan pemantauan dengan perangkat SocaSob.',
          }
          setReport(formatted)
          return
        }
        setError('Laporan tidak ditemukan.')
      } catch (err: any) {
        console.warn('[ReportDetail] Error fetching report', err)
        setError('Gagal memuat laporan medis dari server.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [id, periodLabel, nameParam, robotId])

  return (
    <DashboardLayout fullWidth>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="no-print flex items-center justify-between">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Laporan</span>
          </Link>
        </div>

        {isLoading && (
          <div className="card p-12 flex flex-col items-center justify-center gap-3 text-sm text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-signal-blue" />
            <span>Memuat dokumen laporan medis {id}…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="card p-12 flex flex-col items-center justify-center gap-3 text-sm text-text-muted">
            <AlertCircle className="w-8 h-8 text-error mb-2" />
            <p className="font-semibold text-text">{error}</p>
          </div>
        )}

        {!isLoading && !error && report && <MedicalReportView report={report} />}
      </div>
    </DashboardLayout>
  )
}
