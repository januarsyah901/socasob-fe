/** @jsxRuntime classic */
'use client'

import Image from 'next/image'
import * as React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Eye, Search, AlertTriangle, Ruler, Coffee, Clock } from 'lucide-react'

interface ResumeMetric {
  label: string
  value: string | number
  unit?: string
  color: string
}

const resumeMetrics: ResumeMetric[] = [
  {
    label: 'Ringkasan 6 Bulan',
    value: 'Eye Health Score',
    color: 'cyan',
  },
]

export default function ResumePage() {
  return (
    <DashboardLayout>
      <div className="relative z-0 min-h-[calc(100vh-80px)] overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-100/50 to-blue-50/30 z-[-20] pointer-events-none" />
        <div className="absolute inset-0 z-[-15] pointer-events-none flex items-center justify-center opacity-10">
          <Image
            src="/images/Logo Socasob.png"
            alt="Socasob Logo Watermark"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl z-[-10] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
        {/* Metrics Grid */}
        <div className="space-y-6">
          {/* Ringkasan 6 Bulan */}
          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Ringkasan 6 Bulan</h2>

            <div className="space-y-4">
              {/* Eye Health Score */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-cyan-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Eye Health Score</p>
                    <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">84</p>
                  </div>
                  <Eye className="w-12 h-12 text-cyan-500" />
                </div>
              </div>

              {/* Risiko Miopia */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Risiko Miopia</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">Rendah</p>
                  </div>
                  <Search className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              {/* Risiko Ketidakamananan Mata */}
              {/* <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Risiko Ketidakamananan Mata</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">Sedang</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div> */}

              {/* Rata-rata Jarak Mata */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Rata-rata Jarak Mata</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">57 cm</p>
                  </div>
                  <Ruler className="w-12 h-12 text-green-500" />
                </div>
              </div>

              {/* Kepatuhan Istirahat */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Kepatuhan Istirahat</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">89%</p>
                  </div>
                  <Coffee className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              {/* Total Jam Monitoring */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Jam Monitoring</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">245 jam</p>
                  </div>
                  <Clock className="w-12 h-12 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Distribusi Monitoring</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Tatap Dekat</span>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Tatap Jauh</span>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-300">
            💡 Data resume akan di-fetch dari backend dan diupdate secara berkala.
          </p>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
