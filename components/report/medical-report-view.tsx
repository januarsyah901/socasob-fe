'use client'

import React from 'react'
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Activity,
  Eye,
  Clock,
  User,
  Bot,
  Calendar,
  Sparkles,
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
  eyeHealthScore: number
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  fatigueRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  cvsRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  restCompliance: number // %
  nearDurationMin: number
  farDurationMin: number
  totalHours: number
  avgDistanceCm: number
  blinkRatePerMin: number
  clinicalNotes: string[]
  examinerNotes?: string
}

export function MedicalReportView({ report }: { report: MedicalReportData }) {
  const totalMin = report.nearDurationMin + report.farDurationMin
  const nearPct = totalMin > 0 ? Math.round((report.nearDurationMin / totalMin) * 100) : 0
  const farPct = 100 - nearPct

  const riskBadge = (level: 'Rendah' | 'Sedang' | 'Tinggi') => {
    switch (level) {
      case 'Rendah':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300'
      case 'Sedang':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300'
      case 'Tinggi':
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-border shadow-dreamy">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <FileText className="w-4 h-4 text-signal-blue" />
          <span>Laporan Medis Terverifikasi SocaSob</span>
          <span className="text-border">·</span>
          <span className="font-mono text-xs">{report.id}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Ekspor PDF
          </Button>
        </div>
      </div>

      {/* Formal Printable Document Area */}
      <article className="card p-8 md:p-12 print-area bg-white text-slate-900 shadow-dreamy-lg max-w-4xl mx-auto rounded-3xl border border-slate-200">
        {/* Clinic & System Header */}
        <header className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-xs tracking-wider uppercase">
                  SOCASOB CLINICAL
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Smart Eye Health Ecosystem
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 font-figtree tracking-tight">
                Laporan Evaluasi Ergonomi & Risiko Miopia
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen komplementer pra-diagnostik untuk konsultasi Dokter Spesialis Mata / Optometris.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">NO. DOKUMEN: {report.id}</p>
              <p>Diterbitkan: {report.generatedAt}</p>
              <p>Periode: {report.period}</p>
            </div>
          </div>

          {/* Patient & Device Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Nama Pengguna / Pasien</span>
              <span className="font-bold text-slate-900">{report.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Identitas Sensor Robot</span>
              <span className="font-bold text-slate-900">{report.robotId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Rentang Analisis</span>
              <span className="font-bold text-slate-900">{report.dateRange}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Durasi Layar</span>
              <span className="font-bold text-slate-900">{report.totalHours} Jam Terpantau</span>
            </div>
          </div>
        </header>

        {/* Section 1: Executive Diagnostic Summary */}
        <section className="mb-8">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            1. Ringkasan Diagnostik & Skor Kesehatan Mata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Health Score Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Eye Health Score</span>
              <div className="text-4xl font-black text-slate-900 my-1 font-figtree">
                {report.eyeHealthScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">
                {report.eyeHealthScore >= 80 ? 'Kondisi Prima' : report.eyeHealthScore >= 60 ? 'Perlu Perhatian' : 'Risiko Tinggi'}
              </span>
            </div>

            {/* Myopia Risk */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Risiko Miopia (Jarak Dekat)</span>
              <div className="my-1">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-extrabold border', riskBadge(report.myopiaRisk))}>
                  {report.myopiaRisk}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Berdasarkan rasio durasi tatap &lt;30 cm.</p>
            </div>

            {/* CVS Risk */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Computer Vision Syndrome</span>
              <div className="my-1">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-extrabold border', riskBadge(report.cvsRisk))}>
                  {report.cvsRisk}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Tingkat ketegangan dan kelelahan mata.</p>
            </div>

            {/* 20-20-20 Compliance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kepatuhan Aturan 20-20-20</span>
              <div className="text-2xl font-black text-slate-900 my-1 font-figtree">
                {report.restCompliance}%
              </div>
              <p className="text-[10px] text-slate-500">Frekuensi istirahat 20 detik tiap 20 menit.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Detailed Quantitative Ergonomic Metrics */}
        <section className="mb-8 border-t border-slate-200 pt-6">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            2. Analisis Kuantitatif Kebiasaan Layar (Vision Metrics)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata Jarak Pandang</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{report.avgDistanceCm} cm</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Standar ideal: ≥ 35–45 cm</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Frekuensi Kedipan (Blink Rate)</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{report.blinkRatePerMin} kali / menit</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Standar normal: 12–18 kali / mnt</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Distribusi Jarak Layar</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {farPct}% Aman <span className="text-xs font-normal text-slate-400">/ {nearPct}% Dekat</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Maksimum batas dekat: 30%</p>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Distribusi Tatap Jauh (Aman ≥30cm): {report.farDurationMin} mnt ({farPct}%)</span>
              <span>Tatap Terlalu Dekat (&lt;30cm): {report.nearDurationMin} mnt ({nearPct}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${farPct}%` }} />
              <div className="bg-rose-500 h-full" style={{ width: `${nearPct}%` }} />
            </div>
          </div>
        </section>

        {/* Section 3: Clinical Ergonomic Recommendations */}
        <section className="mb-8 border-t border-slate-200 pt-6">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            3. Rekomendasi Klinis & Intervensi Kebiasaan
          </h2>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {report.clinicalNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  {idx + 1}
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Doctor / Specialist Validation Field */}
        <section className="border-t-2 border-slate-900 pt-6 mt-10">
          <div className="grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[10px]">Catatan Tambahan Dokter / Klinisi:</p>
              <div className="h-20 border border-dashed border-slate-300 rounded-xl mt-2 p-2 text-slate-400 italic">
                {report.examinerNotes || 'Tulis catatan pemeriksaan klinis di sini...'}
              </div>
            </div>

            <div className="flex flex-col items-center text-center justify-between">
              <p className="font-semibold text-slate-600">Verifikasi Dokter Spesialis Mata / Optometris</p>
              <div className="w-44 border-b border-slate-400 h-14" />
              <p className="text-slate-500 text-[11px] mt-1">( Tanda Tangan & Cap Medis )</p>
            </div>
          </div>

          <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Generated automatically by SocaSob AI Vision & IoT Telemetry Architecture · Hak Cipta PKM Tim SocaSob
          </footer>
        </section>
      </article>
    </div>
  )
}
