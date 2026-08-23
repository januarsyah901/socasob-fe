'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { TimerDisplay } from '@/components/timer-display'
import { EyeMetrics } from '@/components/eye-metrics'
import { ConnectionBanner } from '@/components/connection-banner'
import { DesktopAlertBanner } from '@/components/notifications/desktop-alert-banner'
import { EyeExerciseCard } from '@/components/exercise/eye-exercise-card'
import Link from 'next/link'
import {
  FileText,
  ClipboardList,
  BarChart3,
  Bot,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-10 animate-fade-up">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold text-signal-blue uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-signal-blue/10 border border-signal-blue/20">
                Dashboard Monitoring AI
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-active-teal uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-active-teal animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight leading-tight font-figtree">
              Pantau Pandangan, Sayangi Netra.
            </h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              Sistem pencegahan miopia terintegrasi memantau jarak mata, kebiasaan berkedip, dan memandu istirahat ergonomis 20-20-20 secara real-time.
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl bg-signal-blue text-white shadow-sm hover:shadow-md hover:bg-signal-blue/90 transition-all shrink-0 self-start md:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor Laporan Medis (PDF)</span>
          </Link>
        </div>

        {/* Smart Background Notification Banner */}
        <DesktopAlertBanner />

        {/* Connection Banner */}
        <ConnectionBanner />

        {/* Main Monitoring Deck (Timer & Vision Inference Metrics) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TimerDisplay />
          <div className="flex flex-col justify-between gap-6">
            <EyeMetrics />
          </div>
        </section>

        {/* Interactive Micro-Break Module (Senam Mata 20-20-20 & YouTube Embed) */}
        <section>
          <EyeExerciseCard />
        </section>

        {/* Navigation / Analytics Quick Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/reports"
            className="card-sm p-5 flex items-center gap-4 hover:shadow-dreamy-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center shrink-0 group-hover:bg-signal-blue/20 transition-colors">
              <FileText className="w-5 h-5 text-signal-blue" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">Laporan Medis</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">Format siap cetak dokter</p>
            </div>
          </Link>

          <Link
            href="/log"
            className="card-sm p-5 flex items-center gap-4 hover:shadow-dreamy-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-active-teal/10 border border-active-teal/20 flex items-center justify-center shrink-0 group-hover:bg-active-teal/20 transition-colors">
              <ClipboardList className="w-5 h-5 text-active-teal" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">Log Harian</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">Riwayat sesi 7 hari</p>
            </div>
          </Link>

          <Link
            href="/resume"
            className="card-sm p-5 flex items-center gap-4 hover:shadow-dreamy-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">Resume Analitik</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">Tren 6 bulan & skor mata</p>
            </div>
          </Link>

          <Link
            href="/devices"
            className="card-sm p-5 flex items-center gap-4 hover:shadow-dreamy-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">Perangkat Robot</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">Kelola sensor ESP32-CAM</p>
            </div>
          </Link>
        </section>
      </div>
    </DashboardLayout>
  )
}
