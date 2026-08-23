'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect, useCallback } from 'react'
import { Volume2, Bell, Bot, Info, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSocket, beApi } from '@/lib/socket-context'

const BE_API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

interface RobotStatus {
  robotId: string
  ipAddress: string
  isOnline: boolean
  status: 'active' | 'offline'
}

export default function SettingsPage() {
  const { isConnected, setRobotId, robotId: activeRobotId } = useSocket()

  const [robotIdInput, setRobotIdInput] = useState('')
  const [volume, setVolume] = useState(70)
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [inputError, setInputError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [robotStatus, setRobotStatus] = useState<RobotStatus | null>(null)
  const [statusError, setStatusError] = useState('')

  // Load settings dari BE saat mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await beApi('/api/settings')
        if (data.success && data.data) {
          setRobotIdInput(data.data.robotId || '')
          setVolume(data.data.audioVolume ?? 70)
          setAlertSoundEnabled(data.data.audioEnabled !== false)
          setNotificationsEnabled(data.data.notificationEnabled !== false)
        }
      } catch (e) {
        console.warn('[Settings] Gagal load dari BE, fallback ke localStorage')
        const saved = localStorage.getItem('socasob-settings')
        if (saved) {
          const s = JSON.parse(saved)
          setRobotIdInput(s.robotId || '')
          setVolume(s.volume ?? 70)
          setAlertSoundEnabled(s.alertSoundEnabled !== false)
          setNotificationsEnabled(s.notificationsEnabled !== false)
        }
      }
    }
    loadSettings()
  }, [])

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg)
      setSavedMessage('')
      setTimeout(() => setErrorMessage(''), 4000)
    } else {
      setSavedMessage(msg)
      setErrorMessage('')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleSave = async () => {
    if (!robotIdInput.trim()) {
      setInputError('Robot ID wajib diisi')
      return
    }
    setInputError('')
    setIsSaving(true)

    try {
      const payload = {
        robotId: robotIdInput.trim(),
        audioVolume: volume,
        audioEnabled: alertSoundEnabled,
        notificationEnabled: notificationsEnabled,
      }

      const data = await beApi('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (data.success) {
        // Simpan ke localStorage sebagai cache
        localStorage.setItem('socasob-settings', JSON.stringify({
          robotId: payload.robotId,
          volume,
          alertSoundEnabled,
          notificationsEnabled,
        }))

        // Subscribe socket ke room robot baru
        setRobotId(payload.robotId)

        showMessage('Pengaturan tersimpan & terhubung ke robot!')
        await fetchRobotStatus(payload.robotId)
      } else {
        showMessage(data.error || 'Gagal menyimpan pengaturan', true)
      }
    } catch (e) {
      showMessage('Tidak dapat terhubung ke server backend', true)
    } finally {
      setIsSaving(false)
    }
  }

  const fetchRobotStatus = useCallback(async (rId: string) => {
    if (!rId) return
    setIsLoadingStatus(true)
    setStatusError('')
    try {
      const data = await beApi(`/api/robot/status?robotId=${encodeURIComponent(rId)}`)
      if (data.success) {
        setRobotStatus(data.data)
      } else {
        setRobotStatus(null)
        setStatusError(data.error || 'Robot tidak ditemukan di server')
      }
    } catch (e) {
      setStatusError('Gagal mengambil status robot dari server')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  // Cek status robot jika sudah ada robotId aktif
  useEffect(() => {
    if (activeRobotId) {
      setRobotIdInput(activeRobotId)
      fetchRobotStatus(activeRobotId)
    }
  }, [activeRobotId, fetchRobotStatus])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          eyebrow="Konfigurasi Sistem"
          title="Pengaturan"
          description="Hubungkan perangkat kamera detektor SocaSob Anda dan atur preferensi peringatan."
        />

        {/* Success Toast */}
        {savedMessage && (
          <div className="bg-active-teal/10 border border-active-teal/25 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-active-teal/20 flex items-center justify-center text-active-teal text-xs font-bold shrink-0">✓</span>
            <p className="text-active-teal font-semibold text-sm">{savedMessage}</p>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="bg-error/10 border border-error/25 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <p className="text-error font-semibold text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* === Robot Connection === */}
          <div className="card-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-lg font-semibold text-text tracking-tight">Koneksi Robot SocaSob</h2>
            </div>

            <div className="space-y-5">
              {/* Socket Connection Status */}
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors',
                isConnected
                  ? 'bg-success/5 border-success/25 text-success'
                  : 'bg-surface-2 border-border text-text-muted'
              )}>
                {isConnected
                  ? <><span className="h-2 w-2 rounded-full bg-success shrink-0" /> Backend Terhubung</>
                  : <><WifiOff className="w-4 h-4" /> Backend Tidak Terhubung</>
                }
              </div>

              <Input
                label="Robot ID (MAC / Hardware ID)"
                value={robotIdInput}
                onChange={(e) => { setRobotIdInput(e.target.value); if (inputError) setInputError('') }}
                placeholder="Contoh: fadfa566 atau A4CF12832E01"
                error={inputError}
                id="robot-id"
              />

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline-blue"
                  onClick={handleSave}
                  disabled={!robotIdInput.trim() || isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-signal-blue border-t-transparent rounded-full animate-spin" />
                      Menyimpan…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">Simpan & Hubungkan <span>→</span></span>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fetchRobotStatus(robotIdInput)}
                  disabled={!robotIdInput.trim() || isLoadingStatus}
                >
                  {isLoadingStatus ? 'Mengecek…' : 'Cek Status'}
                </Button>
              </div>

              {/* Real Robot Status dari BE */}
              {statusError && (
                <div className="p-4 bg-error/5 border border-error/25 rounded-2xl text-sm text-error">
                  {statusError}
                </div>
              )}

              {robotStatus && (
                <div className="p-4 bg-surface-2 border border-border rounded-2xl space-y-3 animate-fade-in">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">Status Robot dari Server</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Robot ID</p>
                      <p className="text-xs font-semibold text-text font-mono">{robotStatus.robotId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Status Robot</p>
                      <p className={cn(
                        'text-xs font-bold',
                        robotStatus.isOnline ? 'text-success' : 'text-text-muted'
                      )}>
                        {robotStatus.isOnline ? '🟢 Online (Mengirim Data)' : '⚫ Offline (Belum Mengirim)'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Socket BE</p>
                      <p className={cn(
                        'text-xs font-bold',
                        isConnected ? 'text-success' : 'text-error'
                      )}>
                        {isConnected ? '🟢 Terhubung' : '🔴 Putus'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Audio === */}
          <div className="card-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-lg font-semibold text-text tracking-tight">Pengaturan Suara</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-text font-medium">Aktifkan Suara Peringatan</span>
                  <p className="text-xs text-text-muted mt-0.5">Putar bunyi peringatan saat mata terlalu dekat.</p>
                </div>
                <button
                  onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
                  className={cn(
                    'relative inline-flex items-center h-6 w-16 rounded-full transition-colors shrink-0 px-1',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue',
                    alertSoundEnabled ? 'bg-signal-blue' : 'bg-border'
                  )}
                >
                  <span className={cn(
                    'absolute text-[9px] font-extrabold transition-opacity duration-200 select-none uppercase tracking-wider',
                    alertSoundEnabled ? 'left-2.5 text-white' : 'right-2.5 text-text-muted'
                  )}>
                    {alertSoundEnabled ? 'ON' : 'OFF'}
                  </span>
                  <span className={cn(
                    'inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform duration-200 shadow-sm z-10',
                    alertSoundEnabled ? 'translate-x-9' : 'translate-x-0'
                  )} />
                </button>
              </div>

              {alertSoundEnabled && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Volume Peringatan
                  </label>
                  <div className="flex items-center gap-5">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-signal-blue"
                    />
                    <span className="text-xl font-bold text-text min-w-12 text-right leading-none tabular-nums">
                      {volume}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Notifications === */}
          <div className="card-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-lg font-semibold text-text tracking-tight">Pengaturan Notifikasi</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-text font-medium">Notifikasi Browser</span>
                <p className="text-xs text-text-muted mt-0.5">Dapatkan peringatan jarak tatap melalui pop-up browser.</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  'relative inline-flex items-center h-6 w-16 rounded-full transition-colors shrink-0 px-1',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue',
                  notificationsEnabled ? 'bg-signal-blue' : 'bg-border'
                )}
              >
                <span className={cn(
                  'absolute text-[9px] font-extrabold transition-opacity duration-200 select-none uppercase tracking-wider',
                  notificationsEnabled ? 'left-2.5 text-white' : 'right-2.5 text-text-muted'
                )}>
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </span>
                <span className={cn(
                  'inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform duration-200 shadow-sm z-10',
                  notificationsEnabled ? 'translate-x-9' : 'translate-x-0'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={isSaving || !robotIdInput.trim()}
          className="w-full"
        >
          {isSaving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </Button>

        {/* Info Footer */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            Robot ID adalah MAC Address atau Hardware ID unik dari perangkat ESP32-CAM Anda. Pengaturan disimpan ke server dan akan digunakan untuk menampilkan data monitoring dari robot yang tepat di dashboard.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
