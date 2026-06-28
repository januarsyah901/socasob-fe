'use client'

import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'
import { RefreshCw, Volume2, Bell, Bot, Info } from 'lucide-react'

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
      <div className="relative z-0 min-h-[calc(100vh-80px)] overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-100/50 to-blue-50/30 z-[-20] pointer-events-none" />
        <div className="absolute inset-0 z-[-15] pointer-events-none flex items-center justify-center opacity-10">
          <Image
            src="/images/Logo Socasob.png"
            alt="Socasob Logo Watermark"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl z-[-10] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl z-[-10] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-white">Pengaturan</h1>
          <p className="text-gray-300 text-lg mt-1">Kelola koneksi perangkat dan preferensi</p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-300 font-medium">{savedMessage}</p>
          </div>
        )}

        {/* Robot Connection Section */}
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg border-2 border-green-300 dark:border-green-700">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cek Koneksi SocaSob</h2>
          </div>

          <div className="bg-white dark:bg-slate-600 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">SocaSob ESP32Cam Connected</span>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleConnect}
                disabled={!ipAddress.trim()}
                className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Koneksi
              </button>
              <button
                onClick={handleDisconnect}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
              >
                Putus
              </button>
            </div>

            {isConnected && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg border-l-4 border-green-500">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  ✓ Terhubung ke {ipAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sound Control Section */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Suara</h2>
          </div>

          <div className="bg-white dark:bg-slate-600 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Aktifkan Peringatan Suara</span>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 font-medium mb-3">
                Volume Suara
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-12">
                  {volume}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Section */}
        <div className="bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg border-2 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Notifikasi</h2>
          </div>

          <div className="bg-white dark:bg-slate-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Aktifkan Notifikasi Browser</span>
              </div>
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled)
                  saveSettings()
                }}
                className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                  notificationsEnabled
                    ? 'bg-green-500'
                    : 'bg-gray-400 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={saveSettings}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Simpan Pengaturan
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Pengaturan disimpan secara lokal. Untuk integrasi penuh dengan backend, IP address dan preferences akan disinkronkan saat terhubung ke server.
          </p>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
