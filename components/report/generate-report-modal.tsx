'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSocket, beApi } from '@/lib/socket-context'

interface GenerateReportModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function GenerateReportModal({ open, onClose, onSuccess }: GenerateReportModalProps) {
  const router = useRouter()
  const { robotId } = useSocket()
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | '6months'>('7days')
  const [patientName, setPatientName] = useState('Pengguna')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setErrorMsg('')

    const activeId = robotId || undefined

    try {
      const res = await beApi('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robotId: activeId,
          patientName: patientName.trim() || 'Pengguna',
          period,
        }),
      })

      if (res.success && res.data) {
        setIsGenerating(false)
        onClose()
        onSuccess?.()
        router.push(`/reports/${res.data.reportId}`)
        return
      }

      // Fallback client route if backend gave error
      setErrorMsg(res.error || 'Gagal membuat laporan dari server.')
      setIsGenerating(false)
      } catch (err: any) {
      console.warn('[Report] Backend error', err)
      setErrorMsg('Gagal membuat laporan dari server.')
      setIsGenerating(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Buat Laporan Medis Kesehatan Mata" className="max-w-md">
      <div className="space-y-5">
        <p className="text-xs text-text-muted leading-relaxed">
          Pilih rentang waktu untuk mengompilasi analisis jarak mata, skor miopia, frekuensi kedipan, dan kepatuhan aturan 20-20-20 ke dalam format laporan medis formal.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2">
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

        <div className="space-y-2">
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
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isGenerating}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 font-semibold text-xs shadow-sm"
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
