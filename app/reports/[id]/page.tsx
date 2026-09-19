import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useSocket, beApi } from '@/lib/socket-context'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export default function ReportDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { robotId } = useSocket()

  const id = (params?.id as string) || 'SOCA-UNKNOWN'
  const periodParam = searchParams.get('period') || '7days'
  const nameParam = searchParams.get('name') || 'Pengguna'

  const periodLabel =
    periodParam === 'today'
      ? 'Hari Ini'
      : periodParam === '30days'
      ? '30 Hari Terakhir'
      : periodParam === '6months'
      ? '6 Bulan Terakhir'
      : '7 Hari Terakhir'

  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await beApi(`/api/reports/${encodeURIComponent(id)}`)
        if (res.success && res.data) {
          setReport(res.data)
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

  if (isLoading) {
    return (
      <DashboardLayout fullWidth>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-text-muted">Memuat laporan...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !report) {
    return (
      <DashboardLayout fullWidth>
        <div className="max-w-4xl mx-auto mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Laporan Tidak Ditemukan"
            description={error || 'Laporan yang Anda cari tidak tersedia atau telah dihapus.'}
            action={{
              label: 'Kembali ke Daftar Laporan',
              onClick: () => window.history.back(),
            }}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout fullWidth>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="no-print flex items-center justify-between">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            Cetak / PDF
          </button>
        </div>

        {/* HEADER */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <div className="border-b border-border pb-6 mb-6">
            <h1 className="text-2xl font-bold text-text mb-2">Laporan Pemantauan Risiko (SocaSob)</h1>
            <p className="text-text-muted">Periode: {report.dateRange} ({report.periodLabel})</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-text-muted mb-1">ID Laporan</p>
              <p className="font-medium text-text">{report.reportId}</p>
            </div>
            <div>
              <p className="text-text-muted mb-1">Nama Pasien</p>
              <p className="font-medium text-text">{report.patientName}</p>
            </div>
          </div>
        </div>

        {/* METRIK */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">Ringkasan Metrik</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Screen Time Max</p>
              <p className="text-xl font-bold text-text">{report.screenTimeMinutes || 0} mnt</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Tatap Kontinu Max</p>
              <p className="text-xl font-bold text-text">{report.longestContinuousGazeMinutes || 0} mnt</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Blink Rate Rata-rata</p>
              <p className="text-xl font-bold text-text">{report.blinkRatePerMinute || 0} /mnt</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Kedipan Tak Sempurna</p>
              <p className="text-xl font-bold text-text">{report.incompleteBlinkRatio || 0}%</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Jarak Dominan</p>
              <p className="text-xl font-bold text-text">{report.dominantDistanceCm || report.avgDistanceCm || 0} cm</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <p className="text-xs text-text-muted mb-1">Kepatuhan Istirahat</p>
              <p className="text-xl font-bold text-text">{report.restCompliance || 0}%</p>
            </div>
          </div>
        </div>

        {/* RISIKO */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">Evaluasi Risiko</h2>
          <div className="space-y-6">
            
            {/* Mata Lelah */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text">Risiko Mata Lelah</h3>
                <span className={cn("px-3 py-1 text-xs font-bold rounded-full", report.eyeFatigueRisk?.status === 'YA' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                  {report.eyeFatigueRisk?.status || 'TIDAK'}
                </span>
              </div>
              {report.eyeFatigueRisk?.status === 'YA' && report.eyeFatigueRisk?.reasons?.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                  {report.eyeFatigueRisk.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>

            {/* Mata Kering */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text">Risiko Mata Kering</h3>
                <span className={cn("px-3 py-1 text-xs font-bold rounded-full", report.dryEyeRisk?.status === 'YA' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                  {report.dryEyeRisk?.status || 'TIDAK'}
                </span>
              </div>
              {report.dryEyeRisk?.status === 'YA' && report.dryEyeRisk?.reasons?.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                  {report.dryEyeRisk.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>

            {/* Paparan Risiko Miopia */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text">Paparan Risiko Miopia</h3>
                <span className={cn("px-3 py-1 text-xs font-bold rounded-full", report.myopiaExposureRisk?.status === 'YA' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                  {report.myopiaExposureRisk?.status || 'TIDAK'}
                </span>
              </div>
              {report.myopiaExposureRisk?.status === 'YA' && report.myopiaExposureRisk?.reasons?.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                  {report.myopiaExposureRisk.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
            
          </div>
        </div>

        {/* CLINICAL NOTES */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">Catatan Sistem</h2>
          <div className="space-y-4">
            <div className="bg-background rounded-xl p-4 border border-border">
              <ul className="list-disc pl-4 text-sm text-text-muted space-y-2">
                {report.clinicalNotes?.map((note: string, idx: number) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <h4 className="font-medium text-primary mb-2 text-sm">Rekomendasi</h4>
              <p className="text-sm text-text-muted">{report.examinerNotes}</p>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="text-center">
          <p className="text-xs text-text-muted/60">
            {report.disclaimer || "Semua output bersifat pemantauan risiko kebiasaan visual dan bukan diagnosis medis."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
