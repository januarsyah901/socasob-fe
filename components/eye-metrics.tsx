'use client'

import { useSocket } from '@/lib/socket-context'

export function EyeMetrics() {
  const { eyeDistance, eyeStatus } = useSocket()

  const getStatusColor = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
      case 'risk_myopia':
        return 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900'
      case 'risk_fatigue':
        return 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900'
      default:
        return 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900 dark:to-slate-900'
    }
  }

  const getStatusTextColor = () => {
    switch (eyeStatus) {
      case 'normal':
        return 'text-green-700 dark:text-green-300'
      case 'risk_myopia':
        return 'text-orange-700 dark:text-orange-300'
      case 'risk_fatigue':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
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
      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-6 shadow-lg border-2 border-blue-300 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">👁️</div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Jarak Mata</h3>
        </div>
        
        <div className="bg-white dark:bg-slate-700 rounded-xl p-4 text-center">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {eyeDistance === 'Dekat' ? '🔴' : '🟢'}
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{eyeDistance}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {eyeDistance === 'Dekat' ? '< 30 cm' : '≥ 30 cm'}
          </div>
        </div>
      </div>

      {/* Status Mata */}
      <div className={`${getStatusColor()} rounded-2xl p-6 shadow-lg border-2 ${getStatusTextColor() === 'text-green-700 dark:text-green-300' ? 'border-green-300 dark:border-green-700' : getStatusTextColor() === 'text-orange-700 dark:text-orange-300' ? 'border-orange-300 dark:border-orange-700' : 'border-red-300 dark:border-red-700'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">💚</div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Status Mata</h3>
        </div>
        
        <div className="bg-white dark:bg-slate-700 rounded-xl p-4 text-center">
          <div className={`text-5xl font-bold mb-2 ${getStatusTextColor()}`}>
            {eyeStatus === 'normal' ? '✓' : '⚠️'}
          </div>
          <div className={`text-2xl font-bold ${getStatusTextColor()}`}>
            {getStatusLabel()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {eyeStatus === 'normal' ? 'Kondisi mata sehat' : eyeStatus === 'risk_myopia' ? 'Risiko miopia terdeteksi' : 'Mata mengalami kelelahan'}
          </div>
        </div>
      </div>
    </div>
  )
}
