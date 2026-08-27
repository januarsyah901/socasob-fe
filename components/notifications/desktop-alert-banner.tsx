'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, CheckCircle2, ShieldAlert, X } from 'lucide-react'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendDesktopNotification,
  playGentleChime,
} from '@/lib/desktop-notifications'
import { Button } from '@/components/ui/button'

export function DesktopAlertBanner() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [dismissed, setDismissed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(isNotificationSupported())
    setPermission(getNotificationPermission())
  }, [])

  if (!isSupported || permission === 'granted' || dismissed) {
    return null
  }

  const handleEnable = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
      playGentleChime('success')
      sendDesktopNotification({
        title: '🔔 Notifikasi SocaSob Aktif!',
        body: 'Sistem akan memberi peringatan pintar jika jarak mata Anda terlalu dekat atau saat butuh istirahat.',
        bypassThrottle: true
      })
    } else {
      setPermission('denied')
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-signal-blue/30 bg-ice-tint/80 dark:bg-midnight-harbor/40 backdrop-blur-md p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-dreamy animate-fade-up">
      <div className="flex items-center gap-3.5">
        <span className="shrink-0 rounded-xl bg-signal-blue/15 text-signal-blue p-2.5">
          <Bell className="w-5 h-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text flex items-center gap-2">
            <span>Aktifkan Notifikasi Desktop Latar Belakang</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-signal-blue/15 text-signal-blue">
              Smart Alert
            </span>
          </p>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
            Dapatkan peringatan ergonomi saat Anda fokus bekerja di aplikasi lain atau tab browser sedang diminimalkan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          size="sm"
          variant="primary"
          onClick={handleEnable}
          className="gap-1.5 text-xs font-semibold"
        >

          Aktifkan Sekarang
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Tutup saran"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
