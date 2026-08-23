'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles, Calendar, Bot, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/lib/socket-context'

interface GenerateReportModalProps {
  open: boolean
  onClose: () => void
}

export function GenerateReportModal({ open, onClose }: GenerateReportModalProps) {
  const router = useRouter()
  const { robotId } = useSocket()
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | '6months'>('7days')
  const [patientName, setPatientName] = useState('Bang Jan')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      onClose()
      const reportId = `SOCA-${Date.now().toString().slice(-6)}`
      router.push(`/reports/${reportId}?period=${period}&name=${encodeURIComponent(patientName)}`)
    }, 600)
  }

  return (
    <Modal open={open} onClose={onClose} title="Buat Laporan Medis Kesehatan Mata" className="max-w-md">
      <div className="space-y-5">
        <p className="text-xs text-text-muted leading-relaxed">
          Pilih rentang waktu untuk mengompilasi analisis jarak mata, skor miopia, frekuensi kedipan, dan kepatuhan aturan 20-20-20 ke dalam format laporan medis formal.
        </p>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Nama Pengguna / Pasien
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Masukkan nama pengguna"
            className="input-base text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Periode Laporan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'today', label: 'Hari Ini', sub: 'Monitoring Harian' },
              { id: '7days', label: '7 Hari Terakhir', sub: 'Mingguan Standar' },
              { id: '30days', label: '30 Hari Terakhir', sub: 'Evaluasi Bulanan' },
              { id: '6months', label: '6 Bulan Terakhir', sub: 'Longitudinal Miopia' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  period === opt.id
                    ? 'border-signal-blue bg-signal-blue/10 shadow-sm'
                    : 'border-border bg-surface-2 hover:bg-surface text-text-muted'
                }`}
              >
                <p className="text-xs font-bold text-text">{opt.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Generate Dokumen PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}
