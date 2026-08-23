'use client'

import { useState } from 'react'
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
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { GenerateReportModal } from '@/components/report/generate-report-modal'

interface ReportSummaryItem {
  id: string
  title: string
  period: string
  date: string
  score: number
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  compliance: number
}

const INITIAL_REPORTS: ReportSummaryItem[] = [
  {
    id: 'SOCA-882104',
    title: 'Evaluasi Mingguan Kesehatan Penglihatan',
    period: '7 Hari Terakhir (17 Agu – 23 Agu 2026)',
    date: '23 Agustus 2026',
    score: 86,
    myopiaRisk: 'Rendah',
    compliance: 82,
  },
  {
    id: 'SOCA-771902',
    title: 'Ringkasan Bulanan Kebiasaan Layar & Jarak Pandang',
    period: 'Juli 2026 (1 Jul – 31 Jul 2026)',
    date: '1 Agustus 2026',
    score: 78,
    myopiaRisk: 'Sedang',
    compliance: 74,
  },
  {
    id: 'SOCA-650412',
    title: 'Audit Ergonomi & Evaluasi Awal Miopia',
    period: 'Juni 2026 (1 Jun – 30 Jun 2026)',
    date: '1 Juli 2026',
    score: 72,
    myopiaRisk: 'Sedang',
    compliance: 68,
  },
]

export default function ReportsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [reports] = useState<ReportSummaryItem[]>(INITIAL_REPORTS)

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
          subtitle="Generate resume analitik kesehatan mata formal (PDF) yang siap ditunjukkan kepada dokter spesialis mata atau optometris."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalOpen(true)}
              className="gap-2 shadow-sm font-semibold text-xs"
            >
              <Plus className="w-4 h-4" />
              Buat Laporan Baru
            </Button>
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
          <h2 className="text-base font-bold text-text">Daftar Dokumen Laporan</h2>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-dreamy-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-signal-blue" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-text-muted">{rep.id}</span>
                      {riskBadge(rep.myopiaRisk)}
                    </div>
                    <h3 className="text-base font-bold text-text mt-1">{rep.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{rep.period}</span>
                      <span>· Dibuat: {rep.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-text">{rep.score}/100</div>
                    <div className="text-[10px] text-text-muted font-medium">Eye Health Score</div>
                  </div>

                  <Link href={`/reports/${rep.id}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
                      <span>Buka Dokumen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GenerateReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  )
}
