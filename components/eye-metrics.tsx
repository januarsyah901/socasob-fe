'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Shield, CheckCircle2, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EyeMetrics() {
  const { eyeDistance, eyeStatus } = useSocket()

  const getStatusTextColor = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'text-graphite'
      case 'risk_myopia':
      case 'risk_fatigue':
        return 'text-signal-blue'
      default:
        return 'text-ash'
    }
  }

  const getStatusLabel = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'Normal'
      case 'risk_myopia':
        return 'Risiko Miopia'
      case 'risk_fatigue':
        return 'Kelelahan Mata'
      default:
        return 'Tidak Terhubung'
    }
  }

  const getStatusDesc = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'Kondisi mata Anda terdeteksi sehat dan segar.'
      case 'risk_myopia':
        return 'Risiko pandangan mata terlalu dekat terus-menerus.'
      case 'risk_fatigue':
        return 'Mata Anda mengalami kelelahan. Istirahat sejenak.'
      default:
        return 'Perangkat detektor SocaSob belum terhubung.'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Jarak Mata */}
      <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-twilight" />
          <h3 className="font-ppmondwest text-xl text-graphite font-normal tracking-tight">
            Jarak Mata
          </h3>
        </div>
        
        <div className="my-4">
          <div className="text-3xl font-ppmondwest text-ink-black font-normal leading-tight">
            {eyeDistance}
          </div>
          <div className="text-[13px] text-ash font-medium mt-1 font-af">
            {eyeDistance === 'Dekat' ? 'Jarak tatap < 30 cm (Terlalu Dekat!)' : 'Jarak tatap ≥ 30 cm (Aman)'}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-mist/30 pt-3 mt-1">
          {eyeDistance === 'Dekat' ? (
            <AlertCircle className="w-4 h-4 text-signal-blue" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-twilight" />
          )}
          <span className="text-xs text-charcoal font-medium font-af">
            {eyeDistance === 'Dekat' ? 'Segera mundurkan posisi duduk Anda' : 'Pertahankan posisi aman ini'}
          </span>
        </div>
      </div>

      {/* Status Mata */}
      <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-twilight" />
          <h3 className="font-ppmondwest text-xl text-graphite font-normal tracking-tight">
            Status Deteksi
          </h3>
        </div>
        
        <div className="my-4">
          <div className={cn("text-3xl font-ppmondwest font-normal leading-tight", getStatusTextColor())}>
            {getStatusLabel()}
          </div>
          <div className="text-[13px] text-ash font-medium mt-1 font-af">
            {getStatusDesc()}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-mist/30 pt-3 mt-1">
          {eyeStatus === 'normal' ? (
            <CheckCircle2 className="w-4 h-4 text-twilight" />
          ) : eyeStatus === 'disconnected' ? (
            <Sparkles className="w-4 h-4 text-ash" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-signal-blue animate-pulse" />
          )}
          <span className="text-xs text-charcoal font-medium font-af">
            {eyeStatus === 'normal' 
              ? 'Mata dalam keadan prima' 
              : eyeStatus === 'disconnected'
              ? 'Nyalakan kamera ESP32'
              : 'Disarankan istirahat 20 detik'}
          </span>
        </div>
      </div>
    </div>
  )
}
