'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { Volume2, Bell, Bot, Info, Wifi, WifiOff, Cpu, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DeviceInfo {
  mac: string
  rssi: number
  firmware: string
  frameRate: number
}

export default function SettingsPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [volume, setVolume] = useState(70)
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [savedMessage, setSavedMessage] = useState('')
  const [inputError, setInputError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('socasob-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      setIpAddress(settings.ipAddress || '')
      setIsConnected(settings.isConnected || false)
      setVolume(settings.volume ?? 70)
      setAlertSoundEnabled(settings.alertSoundEnabled !== false)
      setNotificationsEnabled(settings.notificationsEnabled !== false)
      if (settings.isConnected && settings.ipAddress) {
        // Restore mock device info when re-loading
        setDeviceInfo({
          mac: 'A4:CF:12:83:2E:01',
          rssi: -58,
          firmware: '1.3.2',
          frameRate: 18,
        })
      }
    }
  }, [])

  const validateIp = (ip: string) => {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return regex.test(ip) || ip.toLowerCase() === 'localhost'
  }

  const saveSettings = (overrides?: Partial<{ isConnected: boolean }>, msg?: string) => {
    if (ipAddress.trim() && !validateIp(ipAddress)) {
      setInputError('Format IP Address tidak valid')
      return
    }
    setInputError('')
    const settings = {
      ipAddress,
      isConnected: overrides?.isConnected ?? isConnected,
      volume,
      alertSoundEnabled,
      notificationsEnabled,
    }
    localStorage.setItem('socasob-settings', JSON.stringify(settings))
    if (msg) {
      setSavedMessage(msg)
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleConnect = async () => {
    if (!ipAddress.trim()) return
    if (!validateIp(ipAddress)) { setInputError('Format IP Address tidak valid'); return }
    setInputError('')
    setIsConnecting(true)

    // Simulate connection handshake
    await new Promise((r) => setTimeout(r, 1200))

    setIsConnecting(false)
    setIsConnected(true)
    // Mock device info fetched after connecting
    setDeviceInfo({
      mac: 'A4:CF:12:83:2E:01',
      rssi: -58,
      firmware: '1.3.2',
      frameRate: 18,
    })
    saveSettings({ isConnected: true }, 'Perangkat berhasil terhubung!')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setDeviceInfo(null)
    saveSettings({ isConnected: false }, 'Koneksi diputuskan.')
  }

  const rssiStrength = (rssi: number) => {
    if (rssi >= -50) return { label: 'Sangat Kuat', color: 'text-success' }
    if (rssi >= -65) return { label: 'Kuat', color: 'text-success' }
    if (rssi >= -75) return { label: 'Sedang', color: 'text-warning' }
    return { label: 'Lemah', color: 'text-error' }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <PageHeader
          eyebrow="Konfigurasi Sistem"
          title="Pengaturan"
          description="Hubungkan perangkat kamera detektor SocaSob Anda dan atur preferensi peringatan."
        />

        {/* Toast */}
        {savedMessage && (
          <div className="bg-active-teal/10 border border-active-teal/25 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-active-teal/20 flex items-center justify-center text-active-teal text-xs font-bold shrink-0">✓</span>
            <p className="text-active-teal font-semibold text-sm">{savedMessage}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* === Camera Connection === */}
          <div className="card-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-signal-blue" />
              </div>
              <h2 className="text-lg font-semibold text-text tracking-tight">Koneksi Kamera SocaSob</h2>
            </div>

            <div className="space-y-5">
              {/* Connection Status */}
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors',
                isConnected
                  ? 'bg-success/5 border-success/25 text-success'
                  : 'bg-surface-2 border-border text-text-muted'
              )}>
                {isConnected
                  ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" /><span className="relative rounded-full h-2 w-2 bg-success" /></span> ESP32-CAM Terhubung</>
                  : <><WifiOff className="w-4 h-4" /> Kamera Belum Terhubung</>
                }
              </div>

              <Input
                label="Alamat IP Kamera"
                value={ipAddress}
                onChange={(e) => { setIpAddress(e.target.value); if (inputError) setInputError('') }}
                placeholder="Contoh: 192.168.1.100 atau localhost"
                error={inputError}
                id="ip-address"
              />

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline-blue"
                  onClick={handleConnect}
                  disabled={!ipAddress.trim() || isConnecting}
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-signal-blue border-t-transparent rounded-full animate-spin" />
                      Menghubungkan…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">Hubungkan <span>→</span></span>
                  )}
                </Button>
                <Button variant="secondary" onClick={handleDisconnect} disabled={!isConnected}>
                  Putuskan
                </Button>
              </div>

              {/* Device Info — shown after connect */}
              {isConnected && deviceInfo && (
                <div className="p-4 bg-surface-2 border border-border rounded-2xl space-y-3 animate-fade-in">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">Informasi Perangkat</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">MAC Address</p>
                        <p className="text-xs font-semibold text-text font-mono">{deviceInfo.mac}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-4 h-4 text-text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Kekuatan Sinyal</p>
                        <p className={cn('text-xs font-semibold', rssiStrength(deviceInfo.rssi).color)}>
                          {deviceInfo.rssi} dBm — {rssiStrength(deviceInfo.rssi).label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Wifi className="w-4 h-4 text-text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Firmware</p>
                        <p className="text-xs font-semibold text-text">v{deviceInfo.firmware}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Bot className="w-4 h-4 text-text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Frame Rate</p>
                        <p className="text-xs font-semibold text-text">{deviceInfo.frameRate} fps</p>
                      </div>
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
              {/* Toggle Alert Sound */}
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

              {/* Volume Slider */}
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
          onClick={() => saveSettings(undefined, 'Pengaturan tersimpan!')}
          className="w-full"
        >
          Simpan Pengaturan
        </Button>

        {/* Info Footer */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            Pengaturan disimpan secara lokal di browser Anda. IP address dan preferensi audio akan disinkronisasikan ke server kamera SocaSob ESP32-CAM.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
