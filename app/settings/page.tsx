'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { RefreshCw, Volume2, Bell, Bot, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [volume, setVolume] = useState(70)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz'

  // Load saved settings from Backend and fallback to localStorage
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${baseUrl}/api/settings`)
        if (!res.ok) throw new Error('Gagal memuat pengaturan dari server.')
        const json = await res.json()
        
        if (json.success && json.data) {
          const data = json.data
          setIpAddress(data.robotIp || '')
          setVolume(data.audioVolume !== undefined ? data.audioVolume : 70)
          setNotificationsEnabled(data.notificationEnabled !== false)
          
          // Check robot status to set connection state
          try {
            const statusRes = await fetch(`${baseUrl}/api/robot/status`)
            if (statusRes.ok) {
              const statusJson = await statusRes.json()
              if (statusJson.success && statusJson.data && statusJson.data.status === 'active') {
                setIsConnected(true)
              }
            }
          } catch (err) {
            console.error('Failed to get robot status:', err)
          }
          return
        }
      } catch (err) {
        console.warn('Failed to fetch from backend, trying localStorage...', err)
      }

      // Fallback: localStorage
      const saved = localStorage.getItem('socasob-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        setIpAddress(settings.ipAddress || '')
        setIsConnected(settings.isConnected || false)
        setVolume(settings.volume || 70)
        setNotificationsEnabled(settings.notificationsEnabled !== false)
      }
    }

    loadSettings()
  }, [baseUrl])

  // Save settings to backend and localStorage
  const saveSettings = async (customIp = ipAddress, customConnected = isConnected, customVolume = volume, customNotif = notificationsEnabled) => {
    setIsSaving(true)
    setSavedMessage('')
    setErrorMessage('')

    const settingsPayload = {
      robotIp: customIp,
      audioVolume: customVolume,
      audioEnabled: customVolume > 0,
      notificationEnabled: customNotif,
    }

    // Save to localStorage
    const localSettings = {
      ipAddress: customIp,
      isConnected: customConnected,
      volume: customVolume,
      notificationsEnabled: customNotif,
    }
    localStorage.setItem('socasob-settings', JSON.stringify(localSettings))

    try {
      const res = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsPayload),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Gagal menyimpan pengaturan ke server.')
      }

      setSavedMessage('Pengaturan berhasil disimpan ke server!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Gagal sinkronisasi dengan server.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnect = async () => {
    if (!ipAddress.trim()) return

    setIsTestingConnection(true)
    setSavedMessage('')
    setErrorMessage('')

    try {
      const res = await fetch(`${baseUrl}/api/robot/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ robotIp: ipAddress }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Gagal terhubung dengan perangkat ESP32-CAM.')
      }

      setIsConnected(true)
      await saveSettings(ipAddress, true, volume, notificationsEnabled)
      setSavedMessage(`Koneksi sukses! ${json.message || ''}`)
      setTimeout(() => setSavedMessage(''), 4000)
    } catch (err: any) {
      console.error(err)
      setIsConnected(false)
      setErrorMessage(err.message || 'Koneksi gagal. Pastikan IP address benar dan ESP32-CAM aktif.')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleDisconnect = async () => {
    setIsConnected(false)
    await saveSettings(ipAddress, false, volume, notificationsEnabled)
    setSavedMessage('Koneksi perangkat diputuskan.')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Editorial Page Header */}
        <div className="border-b border-mist/40 pb-6">
          <span className="text-xs font-bold font-af text-signal-blue uppercase tracking-widest">
            Konfigurasi Sistem
          </span>
          <h1 className="font-ppmondwest text-4xl text-graphite font-normal tracking-tight mt-2">
            Pengaturan
          </h1>
          <p className="font-af text-sm text-ash mt-1">
            Hubungkan perangkat kamera detektor SocaSob Anda dan atur preferensi peringatan.
          </p>
        </div>

        {/* Success / Error Message */}
        {savedMessage && (
          <div className="bg-linen border border-mist rounded-lg p-4 animate-in fade-in duration-300">
            <p className="text-ink-black font-semibold text-sm font-af">✓ {savedMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 animate-in fade-in duration-300">
            <p className="font-semibold text-sm font-af">✗ {errorMessage}</p>
          </div>
        )}

        {/* Section Cards */}
        <div className="space-y-6">
          {/* Connection Settings */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-twilight" />
              <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight">
                Cek Koneksi SocaSob
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-linen border border-mist rounded-lg w-fit text-xs font-medium text-charcoal">
                <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-red-400")} />
                {isConnected ? "SocaSob ESP32Cam Connected" : "SocaSob Camera Disconnected"}
              </div>

              <div>
                <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-2 font-af">
                  Alamat IP Kamera
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="Contoh: 192.168.1.100"
                  className="rounded-none bg-linen text-charcoal border-t-0 border-l-0 border-r-0 border-b border-charcoal/80 px-3 py-2 w-full focus:outline-none focus:border-ink-black placeholder-ash/40 font-af text-[15px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Outlined Primary CTA for Connection */}
                <button
                  onClick={handleConnect}
                  disabled={!ipAddress.trim() || isTestingConnection}
                  className="inline-flex items-center justify-center gap-2 border border-signal-blue text-signal-blue disabled:border-fog disabled:text-fog rounded-lg px-4 py-2 hover:bg-signal-blue/5 disabled:hover:bg-transparent transition-all text-[15px] font-medium"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Koneksi</span>
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                        →
                      </span>
                    </>
                  )}
                </button>

                {/* Secondary Outlined for Disconnect */}
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center justify-center gap-2 border border-twilight text-twilight rounded-lg px-4 py-2 hover:bg-twilight/5 transition-all text-[15px] font-medium"
                >
                  Putus
                </button>
              </div>

              {isConnected && (
                <div className="p-3 bg-linen border border-mist rounded-lg text-xs text-charcoal font-af">
                  ✓ Terhubung dengan lancar pada alamat IP: {ipAddress}
                </div>
              )}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-twilight" />
              <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight">
                Pengaturan Suara
              </h2>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-mist/80 bg-linen/70 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label className="block text-xs font-bold text-ash uppercase tracking-wider font-af">
                    Volume Peringatan Suara
                  </label>
                  <div className="inline-flex items-center gap-2 rounded-full border border-mist bg-paper px-3 py-1.5 shadow-sm">
                    <Volume2 className="w-4 h-4 text-twilight" />
                    <span className="font-ppmondwest text-lg text-graphite font-normal leading-none">
                      {volume}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-af text-ash">Lembut</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #6D6F8A 0%, #6D6F8A ${volume}%, #E6E8EB ${volume}%, #E6E8EB 100%)`,
                    }}
                    className="flex-1 h-2.5 appearance-none rounded-full cursor-pointer transition-all duration-200"
                  />
                  <span className="text-[11px] font-af text-ash">Keras</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-af text-ash">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-twilight" />
              <h2 className="font-ppmondwest text-2xl text-graphite font-normal tracking-tight">
                Pengaturan Notifikasi
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-af text-sm text-charcoal font-medium">Aktifkan Notifikasi Browser</span>
                <p className="text-[11px] text-ash mt-0.5 font-af">Dapatkan peringatan layar melalui banner pop-up.</p>
              </div>
              <button
                type="button"
                aria-pressed={notificationsEnabled}
                aria-label={notificationsEnabled ? 'Nonaktifkan notifikasi' : 'Aktifkan notifikasi'}
                onClick={() => {
                  const val = !notificationsEnabled
                  setNotificationsEnabled(val)
                  saveSettings(ipAddress, isConnected, volume, val)
                }}
                className={cn(
                  "relative inline-flex items-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-twilight/30 focus:ring-offset-1",
                  notificationsEnabled ? "h-7 w-14 border-twilight bg-twilight shadow-sm" : "h-7 w-14 border-mist bg-mist"
                )}
              >
                <span
                className={cn(
                  "absolute left-0.5 top-1/2 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200 -translate-y-1/2",
                  notificationsEnabled
                    ? "translate-x-7"
                    : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {/* Filled Dark Button (Dusk Background) */}
          <button
            onClick={() => saveSettings()}
            disabled={isSaving}
            className="w-full inline-flex items-center justify-center gap-2 bg-dusk hover:bg-ink-black border border-twilight text-white rounded-lg px-4 py-3.5 transition-all text-[15px] font-medium disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            )}
            <span>Simpan Pengaturan</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-linen border border-mist rounded-lg p-4 flex gap-3 items-start shadow-sm">
          <Info className="w-5 h-5 text-twilight shrink-0 mt-0.5" />
          <div className="text-sm text-charcoal font-af leading-relaxed">
            Pengaturan disimpan secara lokal pada perangkat Anda. IP address dan volume akan disinkronkan secara langsung ke server SocaSob ESP32Cam Anda demi kestabilan koneksi.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
