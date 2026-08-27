'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Plus,
  Printer,
  Calendar,
  Eye,
  Activity,
  ArrowRight,

  ShieldCheck,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { GenerateReportModal } from '@/components/report/generate-report-modal'
import { useSocket, beApi } from '@/lib/socket-context'

export interface ReportItem {
  id?: string
  _id?: string
  reportId?: string
  title: string
  period: string
  periodLabel?: string
  dateRange?: string
  date?: string
  createdAt?: string
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  fatigueRisk?: 'Rendah' | 'Sedang' | 'Tinggi'
  restCompliance?: number
  compliance?: number
  patientName?: string
  robotId?: string
}

export default function ReportsPage() {
  const { robotId } = useSocket()
  const [modalOpen, setModalOpen] = useState(false)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      if (!robotId) {
        setReports([])
        setIsLoading(false)
        return
      }

      const res = await beApi(`/api/reports?robotId=${encodeURIComponent(robotId)}`)

      if (res.success && Array.isArray(res.data)) {
        setReports(res.data)
      } else {
        setReports([])
      }
    } catch (err: any) {
      console.warn('[Reports] Error fetching reports', err)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }, [robotId])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Apakah Anda yakin ingin menghapus laporan "${id}"?`)) return

    setIsDeleting(id)
    try {
      const res = await beApi(`/api/reports/${id}`, { method: 'DELETE' })
      if (res.success) {
        setReports((prev) => prev.filter((r) => (r.reportId || r.id || r._id) !== id))
      } else {
        // Fallback filter state
        setReports((prev) => prev.filter((r) => (r.reportId || r.id || r._id) !== id))
      }
    } catch {
      setReports((prev) => prev.filter((r) => (r.reportId || r.id || r._id) !== id))
    } finally {
      setIsDeleting(null)
    }
  }

  const riskBadge = (risk: 'Rendah' | 'Sedang' | 'Tinggi') => {
    switch (risk) {
      case 'Rendah':
        return <Badge color="#16a34a">Risiko Miopia Rendah</Badge>
      case 'Sedang':
        return <Badge color="#d97706">Risiko Miopia Sedang</Badge>
      case 'Tinggi':
        return <Badge color="#dc2626">Risiko Miopia Tinggi</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          title="Laporan Medis & Sertifikat Ergonomi"
          subtitle={
            robotId
              ? `Kompilasi analitik klinis kesehatan mata terintegrasi untuk perangkat: ${robotId}`
              : 'Generate resume analitik kesehatan mata formal (PDF) yang siap ditunjukkan kepada dokter spesialis mata atau optometris.'
          }
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchReports}
                disabled={isLoading}
                title="Muat ulang laporan"
                className="p-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setModalOpen(true)}
                className="gap-2 shadow-sm font-semibold text-xs"
              >
                <Plus className="w-4 h-4" />
                Buat Laporan Baru
              </Button>
            </div>
          }
        />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-signal-blue/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-signal-blue" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">Format Standar Medis</p>
              <p className="text-xs text-text-muted mt-0.5">Lengkap dengan rasio tatap & lembar paraf klinis</p>
            </div>
          </div>

          <div className="card-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-active-teal/10 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5 text-active-teal" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">1-Click PDF Export</p>
              <p className="text-xs text-text-muted mt-0.5">Desain print-optimized otomatis tanpa header web</p>
            </div>
          </div>

          <div className="card-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">Data Terverifikasi AI</p>
              <p className="text-xs text-text-muted mt-0.5">Telemetri MediaPipe & formula optik presisi</p>
            </div>
          </div>
        </div>

        {/* Report List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text">Daftar Dokumen Laporan</h2>
            <span className="text-xs font-semibold text-text-muted">
              {reports.length} Dokumen Tersedia
            </span>
          </div>

          {isLoading && reports.length === 0 && (
            <div className="card p-10 flex items-center justify-center gap-3 text-sm text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin text-signal-blue" />
              Mengambil dokumen laporan dari server…
            </div>
          )}

          {!isLoading && reports.length === 0 && (
            <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center border-dashed">
              <FileText className="w-12 h-12 text-text-muted/30 mb-2" />
              <h3 className="text-base font-bold text-text">Belum Ada Laporan Medis</h3>
              <p className="text-sm text-text-muted max-w-sm leading-relaxed">
                Anda belum pernah men-generate dokumen apapun. Silakan klik tombol <strong className="text-text">Buat Laporan Baru</strong> di atas untuk menyusun data Anda menjadi PDF.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {reports.map((rep) => {
              const repId = rep.reportId || rep.id || rep._id || 'SOCA-UNKNOWN'
              
              const periodText = rep.periodLabel || rep.dateRange || rep.period
              const createdDate = rep.createdAt
                ? new Date(rep.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : rep.date || '-'

              return (
                <div
                  key={repId}
                  className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-dreamy-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center shrink-0 group-hover:border-signal-blue/30 transition-colors">
                      <FileText className="w-6 h-6 text-signal-blue" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-text-muted">
                          {repId}
                        </span>
                        {rep.patientName && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-2 text-text border border-border">
                            {rep.patientName}
                          </span>
                        )}
                        {riskBadge(rep.myopiaRisk)}
                      </div>
                      <h3 className="text-base font-bold text-text mt-1">{rep.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{periodText}</span>
                        <span>· Dibuat: {createdDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                    

                    <div className="flex items-center gap-2">
                      <Link href={`/reports/${repId}`}>
                        <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
                          <span>Buka Dokumen</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      <button
                        onClick={(e) => handleDeleteReport(e, repId)}
                        disabled={isDeleting === repId}
                        title="Hapus laporan"
                        className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                      >
                        {isDeleting === repId ? (
                          <Loader2 className="w-4 h-4 animate-spin text-error" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <GenerateReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchReports}
      />
    </DashboardLayout>
  )
}
