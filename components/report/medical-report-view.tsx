'use client'

import React from 'react'
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Shield,
  Activity,
  Eye,
  Clock,
  User,
  Bot,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MedicalReportData {
  id: string
  title: string
  patientName: string
  robotId: string
  generatedAt: string
  period: string
  dateRange: string
  totalHours: number
  avgDistanceCm: number
  blinkRatePerMin: number
  safeDistanceRatio: number
  riskDistanceRatio: number
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  cvsRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  restCompliance: number
  clinicalNotes: string[]
  examinerNotes?: string
}

interface MedicalReportViewProps {
  report: MedicalReportData
}

export function MedicalReportView({ report }: MedicalReportViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const riskBadge = (level: 'Rendah' | 'Sedang' | 'Tinggi') => {
    switch (level) {
      case 'Rendah':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300'
      case 'Sedang':
        return 'bg-amber-50 text-amber-700 border-amber-300'
      case 'Tinggi':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
    }
  }

  const farPct = Math.round(report.safeDistanceRatio * 100)
  const nearPct = Math.round(report.riskDistanceRatio * 100)

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-border shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-signal-blue" />
          <span className="text-sm font-semibold text-text">Pratinjau Laporan Medis Siap Cetak</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()} className="gap-1.5 text-xs">
            Perbarui
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 text-xs shadow-sm">
            <Printer className="size-3.5" /> Cetak / Unduh PDF
          </Button>
        </div>
      </div>

      {/* Official Medical Document Paper Container */}
      <article
        id="medical-document"
        className="mx-auto max-w-[210mm] min-h-[297mm] bg-white text-slate-900 border border-slate-300 rounded-lg shadow-xl print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none overflow-hidden relative font-sans leading-normal"
        style={{ colorScheme: 'light' }}
      >
        {/* Subtle Watermark for Authenticity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
          <span className="text-9xl font-black rotate-[-35deg] uppercase tracking-widest text-slate-950">
            SOCASOB
          </span>
        </div>

        <div className="p-8 md:p-12 relative z-10">
          {/* System Header */}
          <header className="border-b-[3px] border-slate-900 pb-6 mb-8 flex items-center gap-4">
            <div className="size-14 shrink-0 flex items-center justify-center">
              <img src="/images/logo-socasob.png" alt="SocaSob Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase" style={{ fontFamily: 'var(--font-figtree)' }}>
                LAPORAN DETEKSI SOCASOB
              </h1>
              <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase mt-0.5">Sistem Monitoring & Evaluasi Ergonomi Visual</p>
            </div>
          </header>

          {/* Title & Patient Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 text-center uppercase tracking-wider mb-6 border-b border-slate-300 pb-4" style={{ fontFamily: 'var(--font-figtree)' }}>
              Hasil Evaluasi Ergonomi Visual
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Nama Pasien:</span>
                <span className="font-bold text-slate-900">{report.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Tanggal Cetak:</span>
                <span className="font-bold text-slate-900">{report.generatedAt}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">ID Perangkat Sensor:</span>
                <span className="font-mono font-bold text-slate-900">{report.robotId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Periode Analisis:</span>
                <span className="font-bold text-slate-900">{report.dateRange}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Diagnostic Summary */}
          <section className="mb-8 border-2 border-slate-900 rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Activity className="size-4" /> 1. Parameter Utama
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50">
              
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Risiko Miopia</span>
                <span className={cn('px-3 py-1 rounded-md text-xs font-bold border uppercase', riskBadge(report.myopiaRisk))}>
                  {report.myopiaRisk}
                </span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Risiko Mata Lelah & Kering</span>
                <span className={cn('px-3 py-1 rounded-md text-xs font-bold border uppercase', riskBadge(report.cvsRisk))}>
                  {report.cvsRisk}
                </span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Kepatuhan 20-20-20</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-figtree">{report.restCompliance}</span>
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Detailed Quantitative Ergonomic Metrics */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wide">
              2. Data Visual
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Jarak Pandang Rata-rata</span>
                  <span className="text-lg font-black text-slate-900">{report.avgDistanceCm} cm</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div className="bg-signal-blue h-full" style={{ width: `${Math.min(100, (report.avgDistanceCm / 50) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 italic">Batas aman yang direkomendasikan: &ge; 30 cm</p>
              </div>

              <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Frekuensi Kedipan</span>
                  <span className="text-lg font-black text-slate-900">{report.blinkRatePerMin} / mnt</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (report.blinkRatePerMin / 20) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 italic">Nilai normal: 12&ndash;18 kedipan per menit</p>
              </div>
            </div>

            {/* Visual Ratio */}
            <div className="border border-slate-200 p-5 rounded-lg bg-white shadow-sm">
              <p className="text-xs font-bold text-slate-600 uppercase mb-3 text-center">Distribusi Jarak Layar (Total: {report.totalHours} Jam)</p>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-500"/> Jarak Aman (&ge; 30cm) : {farPct}%</span>
                <span className="flex items-center gap-1.5">Jarak Bahaya (&lt; 30cm) : {nearPct}% <div className="size-2.5 rounded-full bg-rose-500"/></span>
              </div>
              <div className="w-full h-4 rounded bg-slate-100 overflow-hidden flex border border-slate-300">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${farPct}%` }} />
                <div className="bg-rose-500 h-full transition-all" style={{ width: `${nearPct}%` }} />
              </div>
            </div>
          </section>

          {/* Section 3: Clinical Ergonomic Recommendations */}
          <section className="mb-10">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wide">
              3. Kesimpulan & Rekomendasi
            </h3>
            <ul className="space-y-3 text-sm text-slate-800">
              {report.clinicalNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="size-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Disclaimer */}
          <section className="border-t-[2px] border-slate-900 pt-6 mt-10">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-700">
              <p className="font-bold text-slate-900 uppercase text-xs mb-1.5 flex items-center gap-2">
                <AlertCircle className="size-4 text-slate-700" />
                Catatan & Batasan Hasil Deteksi:
              </p>
              <p className="text-xs leading-relaxed">
                Laporan ini merupakan hasil deteksi kasar berbasis sensor dan visi komputer SocaSob untuk pemantauan kebiasaan ergonomi visual secara mandiri. Hasil ini bukan merupakan diagnosis medis klinis. Apabila Anda mengalami keluhan penglihatan seperti mata buram berlanjut, nyeri mata, atau pusing berulang, silakan berkonsultasi langsung ke dokter spesialis mata.
              </p>
            </div>

            <footer className="mt-8 pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              <span>Dicetak otomatis oleh SocaSob System v2.0</span>
              <span>Halaman 1 dari 1</span>
            </footer>
          </section>
        </div>
      </article>
    </div>
  )
}
