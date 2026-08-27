'use client'

import { useState, useEffect } from 'react'
import { Play, Eye, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EyeExerciseModal } from './eye-exercise-modal'

export function EyeExerciseCard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [completedBreaks, setCompletedBreaks] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('socasob-completed-breaks')
    if (saved) setCompletedBreaks(parseInt(saved, 10) || 0)
  }, [modalOpen])

  return (
    <>
      <div className="card p-6 relative overflow-hidden group hover:shadow-dreamy-lg transition-all duration-300">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-signal-blue/10 via-active-teal/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center shrink-0 group-hover:bg-signal-blue/20 transition-colors">
              <Eye className="w-6 h-6 text-signal-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-signal-blue">
                  Micro-Break Interaktif
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3" />
                  {completedBreaks} Sesi Hari Ini
                </span>
              </div>
              <h3 className="text-lg font-bold text-text mt-1">
                Senam Mata & Aturan 20-20-20
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xl leading-relaxed">
                Istirahatkan otot akomodasi mata Anda setiap 20 menit menatap layar. Tersedia panduan video YouTube terstruktur & timer interaktif 20 detik.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalOpen(true)}
              className="gap-2 text-xs font-semibold shadow-md w-full md:w-auto"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mulai Senam Mata (20s)
            </Button>
          </div>
        </div>
      </div>

      <EyeExerciseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
