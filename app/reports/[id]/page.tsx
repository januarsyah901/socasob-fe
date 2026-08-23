'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { MedicalReportView, type MedicalReportData } from '@/components/report/medical-report-view'
import { useSocket } from '@/lib/socket-context'

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

  const mockReport: MedicalReportData = {
    id,
    title: `Laporan Evaluasi Ergonomi & Risiko Miopia (${periodLabel})`,
    patientName: nameParam,
    robotId: robotId || 'ESP32-CAM-SOCA01',
    generatedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    period: periodLabel,
    dateRange: '17 Agustus 2026 – 23 Agustus 2026',
    eyeHealthScore: 86,
    myopiaRisk: 'Rendah',
    fatigueRisk: 'Sedang',
    cvsRisk: 'Rendah',
    restCompliance: 84,
    nearDurationMin: 112,
    farDurationMin: 428,
    totalHours: 9.0,
    avgDistanceCm: 38.5,
    blinkRatePerMin: 14.8,
    clinicalNotes: [
      'Jarak rata-rata mata terhadap layar monitor berada pada batas aman yang dianjurkan (38.5 cm ≥ 30 cm).',
      'Frekuensi berkedip tercatat 14.8 kedipan/menit, cukup baik dalam menjaga kelembapan kornea mata.',
      'Ditemukan 2 episode tatap dekat berlebih pada rentang kerja sore hari. Disarankan menerapkan micro-break 20-20-20 secara konsisten.',
      'Tingkat kepatuhan istirahat mencapai 84%. Sangat efektif dalam menekan risiko progresi miopia dan Computer Vision Syndrome (CVS).',
    ],
    examinerNotes: 'Pasien menunjukkan kebiasaan kerja ergonomis yang membaik. Lanjutkan pemantauan dengan perangkat SocaSob.',
  }

  return (
    <DashboardLayout fullWidth>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="no-print">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Laporan</span>
          </Link>
        </div>

        <MedicalReportView report={mockReport} />
      </div>
    </DashboardLayout>
  )
}
