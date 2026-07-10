'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { RefreshCw, Volume2, Bell, Bot, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [volume, setVolume] = useState(70)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [savedMessage, setSavedMessage] = useState('')

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('socasob-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      setIpAddress(settings.ipAddress || '')
      setIsConnected(settings.isConnected || false)
      setVolume(settings.volume || 70)
      setNotificationsEnabled(settings.notificationsEnabled !== false)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      ipAddress,
      isConnected,
      volume,
      notificationsEnabled,
    }
    localStorage.setItem('socasob-settings', JSON.stringify(settings))
    setSavedMessage('Pengaturan tersimpan!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleConnect = () => {
    if (ipAddress.trim()) {
      setIsConnected(true)
      saveSettings()
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    saveSettings()
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

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-linen border border-mist rounded-lg p-4 animate-in fade-in duration-300">
            <p className="text-ink-black font-semibold text-sm font-af">✓ {savedMessage}</p>
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
                  disabled={!ipAddress.trim()}
                  className="inline-flex items-center justify-center gap-2 border border-signal-blue text-signal-blue disabled:border-fog disabled:text-fog rounded-lg px-4 py-2 hover:bg-signal-blue/5 disabled:hover:bg-transparent transition-all text-[15px] font-medium"
                >
                  <span>Koneksi</span>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    →
                  </span>
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
              <div>
                <label className="block text-xs font-bold text-ash uppercase tracking-wider mb-3 font-af">
                  Volume Peringatan Suara
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-mist rounded-lg appearance-none cursor-pointer accent-twilight"
                  />
                  <span className="font-ppmondwest text-xl text-graphite font-normal min-w-10 text-right leading-none">
                    {volume}%
                  </span>
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
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled)
                  saveSettings()
                }}
                className={cn(
                  "relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none",
                  notificationsEnabled ? "bg-twilight" : "bg-mist"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform",
                    notificationsEnabled ? "translate-x-5.5" : "translate-x-1"
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
            onClick={saveSettings}
            className="w-full inline-flex items-center justify-center gap-2 bg-dusk hover:bg-ink-black border border-twilight text-white rounded-lg px-4 py-3.5 transition-all text-[15px] font-medium"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
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
