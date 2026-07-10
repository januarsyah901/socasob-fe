'use client'

import Image from 'next/image'
import * as React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Eye, Search, Ruler, Coffee, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ResumePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Editorial Page Header */}
        <div className="border-b border-mist/40 pb-6">
          <span className="text-xs font-bold font-af text-signal-blue uppercase tracking-widest">
            Ikhtisar Data
          </span>
          <h1 className="font-ppmondwest text-4xl text-graphite font-normal tracking-tight mt-2">
            Resume Kesehatan Mata
          </h1>
          <p className="font-af text-sm text-ash mt-1">
            Ringkasan data pemantauan dan analisis kebiasaan menatap layar selama 6 bulan terakhir.
          </p>
        </div>

        {/* Metrics Section */}
        <div className="space-y-6">
          {/* Main Grid */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
            <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight mb-6">
              Ringkasan 6 Bulan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Eye Health Score */}
              <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Eye Health Score</p>
                  <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">84</p>
                </div>
                <Eye className="w-8 h-8 text-twilight" />
              </div>

              {/* Risiko Miopia */}
              <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Risiko Miopia</p>
                  <p className="font-ppmondwest text-3xl text-graphite mt-2.5 font-normal leading-none">Rendah</p>
                </div>
                <Search className="w-8 h-8 text-twilight" />
              </div>

              {/* Rata-rata Jarak Mata */}
              <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Rata-rata Jarak Mata</p>
                  <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">57 cm</p>
                </div>
                <Ruler className="w-8 h-8 text-twilight" />
              </div>

              {/* Kepatuhan Istirahat */}
              <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Kepatuhan Istirahat</p>
                  <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">89%</p>
                </div>
                <Coffee className="w-8 h-8 text-twilight" />
              </div>

              {/* Total Jam Monitoring */}
              <div className="bg-linen border border-mist rounded-lg p-5 flex items-center justify-between md:col-span-2">
                <div>
                  <p className="text-[10px] text-ash font-bold uppercase tracking-wider font-af">Total Jam Monitoring</p>
                  <p className="font-ppmondwest text-4xl text-ink-black mt-2 font-normal">245 Jam</p>
                </div>
                <Clock className="w-8 h-8 text-twilight" />
              </div>
            </div>
          </div>

          {/* Breakdown Chart Card */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
            <h3 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight mb-6">
              Distribusi Monitoring
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 font-af text-sm">
                  <span className="text-charcoal font-medium">Tatap Dekat</span>
                  <span className="text-ink-black font-bold">35%</span>
                </div>
                <div className="w-full bg-linen border border-mist rounded-full h-3 overflow-hidden">
                  <div className="bg-twilight h-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 font-af text-sm">
                  <span className="text-charcoal font-medium">Tatap Jauh</span>
                  <span className="text-ink-black font-bold">65%</span>
                </div>
                <div className="w-full bg-linen border border-mist rounded-full h-3 overflow-hidden">
                  <div className="bg-mist h-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-linen border border-mist rounded-lg p-4 flex gap-3 items-start shadow-sm">
          <div className="text-sm text-charcoal font-af leading-relaxed">
            💡 Data resume dihitung secara otomatis berdasarkan histori harian Anda selama periode 6 bulan terakhir.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
