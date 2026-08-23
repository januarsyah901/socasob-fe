'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect, useCallback } from 'react'
import {
  Volume2,
  Bell,
  Bot,
  Info,
  WifiOff,
  AlertCircle,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSocket, beApi } from '@/lib/socket-context'
import {
  playGentleChime,
  requestNotificationPermission,
  sendDesktopNotification,
  getNotificationPermission,
} from '@/lib/desktop-notifications'

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
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default')

  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [inputError, setInputError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [robotStatus, setRobotStatus] = useState<RobotStatus | null>(null)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    setNotificationPerm(getNotificationPermission())
  }, [])

  // Load settings dari BE saat mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await beApi('/api/settings')
        if (data.success && data.data) {
          setVolume(data.data.audioVolume ?? 70)
          setAlertSoundEnabled(data.data.audioEnabled !== false)
          setNotificationsEnabled(data.data.notificationEnabled !== false)
        }
      } catch (e) {
        console.warn('[Settings] Fallback localStorage')
        const saved = localStorage.getItem('socasob-settings')
        if (saved) {
          const s = JSON.parse(saved)
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
      const cleanId = robotIdInput.trim()

      const validateRes = await beApi(`/api/robots/validate/${encodeURIComponent(cleanId)}`)
      if (!validateRes.success || !validateRes.valid) {
        setInputError(
          `Robot ID "${cleanId}" belum terdaftar. Daftarkan dulu di halaman Perangkat.`
        )
        setIsSaving(false)
        return
      }

      const payload = {
        robotId: cleanId,
        audioVolume: volume,
        audioEnabled: alertSoundEnabled,
        notificationEnabled: notificationsEnabled,
      }

      const data = await beApi('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (data.success) {
        localStorage.setItem(
          'socasob-settings',
          JSON.stringify({
            robotId: payload.robotId,
            volume,
            alertSoundEnabled,
            notificationsEnabled,
          })
        )

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

  useEffect(() => {
    if (activeRobotId) {
      setRobotIdInput(activeRobotId)
      fetchRobotStatus(activeRobotId)
    }
  }, [activeRobotId, fetchRobotStatus])

  const testAudioTone = (type: 'warning' | 'relax' | 'success') => {
    playGentleChime(type)
    showMessage(`Audio nada '${type}' diputar.`)
  }

  const testDesktopNotification = async () => {
    let perm = notificationPerm
    if (perm !== 'granted') {
      const ok = await requestNotificationPermission()
      perm = ok ? 'granted' : 'denied'
      setNotificationPerm(perm)
    }

    if (perm === 'granted') {
      sendDesktopNotification({
        title: '🔔 Uji Coba Peringatan SocaSob',
        body: 'Notifikasi push berhasil terhubung ke sistem operasi desktop Anda!',
      })
      playGentleChime('success')
      showMessage('Notifikasi uji coba dikirim ke desktop!')
    } else {
      showMessage('Izin notifikasi ditolak di browser Anda.', true)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          title="Pengaturan Sistem & Ergonomi"
          subtitle="Hubungkan perangkat kamera detektor ESP32-CAM SocaSob dan atur preferensi peringatan audio & desktop push."
        />

        {/* Success Toast */}
        {savedMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs">{savedMessage}</p>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-rose-800 dark:text-rose-300 font-semibold text-xs">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* === Robot Connection Card === */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-9 h-9 rounded-2xl bg-signal-blue/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-signal-blue" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">Koneksi Robot SocaSob (ESP32-CAM)</h2>
                <p className="text-xs text-text-muted">Sinkronisasi ID perangkat sensor hardware.</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Socket Status */}
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-colors',
                  isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-surface-2 border-border text-text-muted'
                )}
              >
                {isConnected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span>Socket Backend Terhubung & Aktif</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-text-muted" />
                    <span>Socket Backend Sedang Terputus</span>
                  </>
                )}
              </div>

              <Input
                label="Robot ID (Hardware / MAC Identifier)"
                value={robotIdInput}
                onChange={(e) => {
                  setRobotIdInput(e.target.value)
                  if (inputError) setInputError('')
                }}
                placeholder="Contoh: fadfa566 atau ESP32-CAM-01"
                error={inputError}
                id="robot-id"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!robotIdInput.trim() || isSaving}
                  className="text-xs font-semibold"
                >
                  {isSaving ? 'Memvalidasi…' : 'Simpan & Hubungkan Robot'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fetchRobotStatus(robotIdInput)}
                  disabled={!robotIdInput.trim() || isLoadingStatus}
                  className="text-xs font-semibold"
                >
                  {isLoadingStatus ? 'Mengecek…' : 'Cek Status Server'}
                </Button>
              </div>

              {/* Status Display */}
              {robotStatus && (
                <div className="p-4 bg-surface-2 border border-border rounded-2xl space-y-3 animate-fade-in">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Telemetri Server Robot
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-text-muted text-[10px]">Robot ID</p>
                      <p className="font-mono font-bold text-text">{robotStatus.robotId}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px]">Status Telemetri</p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-bold',
                          robotStatus.isOnline ? 'text-success' : 'text-text-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            robotStatus.isOnline ? 'bg-success animate-pulse' : 'bg-text-muted'
                          )}
                        />
                        {robotStatus.isOnline ? 'Online (Aktif)' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Audio Settings Card === */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-signal-blue/10 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-signal-blue" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">Peringatan Audio & Nada Intervensi</h2>
                  <p className="text-xs text-text-muted">Putar chime lembut saat jarak terlalu dekat.</p>
                </div>
              </div>

              <button
                onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
                className={cn(
                  'relative inline-flex items-center h-6 w-14 rounded-full transition-colors shrink-0 px-1 cursor-pointer',
                  alertSoundEnabled ? 'bg-signal-blue' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm',
                    alertSoundEnabled ? 'translate-x-7' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {alertSoundEnabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-text-muted uppercase text-[10px]">Volume Peringatan</span>
                    <span className="text-text font-bold">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-signal-blue"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[10px] font-bold uppercase text-text-muted">Uji Nada:</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => testAudioTone('warning')}
                    className="text-xs py-1 px-3"
                  >
                    🔔 Peringatan Jarak
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => testAudioTone('relax')}
                    className="text-xs py-1 px-3"
                  >
                    🌿 Relaksasi 20-20-20
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => testAudioTone('success')}
                    className="text-xs py-1 px-3"
                  >
                    🎉 Sesi Selesai
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* === Desktop Push Notification Card === */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-signal-blue/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-signal-blue" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">Notifikasi Desktop Latar Belakang (PWA)</h2>
                  <p className="text-xs text-text-muted">Peringatan otomatis saat tab terminimalkan.</p>
                </div>
              </div>

              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  'relative inline-flex items-center h-6 w-14 rounded-full transition-colors shrink-0 px-1 cursor-pointer',
                  notificationsEnabled ? 'bg-signal-blue' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm',
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface-2 rounded-2xl border border-border">
              <div>
                <p className="text-xs font-bold text-text">Status Izin Notifikasi Browser OS:</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {notificationPerm === 'granted'
                    ? '🟢 Izin Diberikan — Notifikasi latar belakang siap beroperasi.'
                    : notificationPerm === 'denied'
                    ? '🔴 Izin Ditolak — Ubah izin di pengaturan gembok URL browser.'
                    : '🟡 Belum Meminta Izin — Klik tombol di samping untuk mengaktifkan.'}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={testDesktopNotification}
                className="text-xs shrink-0 font-semibold gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Uji Notifikasi Desktop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
