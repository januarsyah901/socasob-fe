'use client'

import { useSocket } from '@/lib/socket-context'
import { Eye, Shield, CheckCircle2, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react'

export function EyeMetrics() {
  const { eyeDistance, eyeStatus } = useSocket()

  const getStatusColor = () => {
    return 'bg-white/[0.15] backdrop-blur-2xl border-white/60'
  }

  const getStatusTextColor = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'text-green-600'
      case 'risk_myopia':
        return 'text-orange-600'
      case 'risk_fatigue':
        return 'text-red-600'
      default:
        return 'text-gray-650'
    }
  }

  const getStatusBorderColor = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'border-green-300'
      case 'risk_myopia':
        return 'border-orange-300'
      case 'risk_fatigue':
        return 'border-red-300'
      default:
        return 'border-gray-300'
    }
  }

  const getStatusLabel = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'Normal'
      case 'risk_myopia':
        return 'Risiko Miopia'
      case 'risk_fatigue':
        return 'Kelelahan'
      default:
        return 'Tidak Terhubung'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Jarak Mata */}
      <div className="bg-white/[0.15] backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-[0_12px_40px_0_rgba(0,0,0,0.06),_inset_0_1.5px_2.5px_rgba(255,255,255,0.85)] flex flex-col justify-between min-h-[230px]">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Jarak Mata</h3>
        </div>
        
        <div className="text-center pb-4">
          <div className="flex justify-center mb-3">
            {eyeDistance === 'Dekat' ? (
              <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-800">{eyeDistance}</div>
          <div className="text-sm text-gray-500 mt-2 font-medium">
            {eyeDistance === 'Dekat' ? '< 30 cm (Terlalu Dekat!)' : '≥ 30 cm (Jarak Aman)'}
          </div>
        </div>
      </div>

      {/* Status Mata */}
      <div className={`${getStatusColor()} rounded-3xl p-6 shadow-[0_12px_40px_0_rgba(0,0,0,0.06),_inset_0_1.5px_2.5px_rgba(255,255,255,0.85)] border transition-all duration-350 flex flex-col justify-between min-h-[230px]`}>
        <div className="flex items-center gap-3 mb-6">
          <Shield className={`w-6 h-6 ${getStatusTextColor()}`} />
          <h3 className="text-lg font-bold text-gray-800">Status Mata</h3>
        </div>
        
        <div className="text-center pb-4">
          <div className="flex justify-center mb-3">
            {eyeStatus === 'normal' ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : eyeStatus === 'risk_myopia' ? (
              <AlertTriangle className="w-16 h-16 text-orange-500 animate-pulse" />
            ) : eyeStatus === 'risk_fatigue' ? (
              <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
            ) : (
              <Sparkles className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${getStatusTextColor()}`}>
            {getStatusLabel()}
          </div>
          <div className="text-sm text-gray-500 mt-2 font-medium">
            {eyeStatus === 'normal' 
              ? 'Kondisi mata sehat' 
              : eyeStatus === 'risk_myopia' 
              ? 'Risiko miopia terdeteksi' 
              : eyeStatus === 'risk_fatigue'
              ? 'Mata mengalami kelelahan'
              : 'Perangkat tidak terdeteksi'}
          </div>
        </div>
      </div>
    </div>
  )
}

