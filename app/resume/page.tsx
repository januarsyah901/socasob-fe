/** @jsxRuntime classic */
'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'

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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                  <div className="text-5xl">👁️</div>
                </div>
              </div>

              {/* Risiko Miopia */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Risiko Miopia</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">Rendah</p>
                  </div>
                  <div className="text-5xl">🔍</div>
                </div>
              </div>

              {/* Risiko Ketidakamananan Mata */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Risiko Ketidakamananan Mata</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">Sedang</p>
                  </div>
                  <div className="text-5xl">⚠️</div>
                </div>
              </div>

              {/* Rata-rata Jarak Mata */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Rata-rata Jarak Mata</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">57 cm</p>
                  </div>
                  <div className="text-5xl">📏</div>
                </div>
              </div>

              {/* Kepatuhan Istirahat */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Kepatuhan Istirahat</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">89%</p>
                  </div>
                  <div className="text-5xl">😴</div>
                </div>
              </div>

              {/* Total Jam Monitoring */}
              <div className="bg-white dark:bg-slate-600 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Jam Monitoring</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">245 jam</p>
                  </div>
                  <div className="text-5xl">⏱️</div>
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
    </DashboardLayout>
  )
}
