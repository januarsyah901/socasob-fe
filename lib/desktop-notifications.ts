'use client'

/**
 * SocaSob Desktop Push Notification & Audio Alert Manager
 * Mengelola notifikasi level OS browser & audio tone untuk intervensi kesehatan mata
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false
  try {
    const perm = await Notification.requestPermission()
    return perm === 'granted'
  } catch {
    return false
  }
}

interface DesktopNotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

let lastNotificationTime = 0
const THROTTLE_MS = 8000 // Minimal jeda 8 detik antar notifikasi agar tidak spam

export function sendDesktopNotification({
  title,
  body,
  icon = '/images/Logo Socasob.png',
  tag,
  requireInteraction = false,
}: DesktopNotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false
  }

  const now = Date.now()
  if (now - lastNotificationTime < THROTTLE_MS) {
    return false
  }
  lastNotificationTime = now

  try {
    const notification = new Notification(title, {
      body,
      icon,
      tag: tag || 'socasob-eye-alert',
      requireInteraction,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    return true
  } catch (e) {
    console.warn('[Desktop Notification Error]', e)
    return false
  }
}

/** Synthesize a soft gentle chime using Web Audio API */
export function playGentleChime(type: 'warning' | 'relax' | 'success' = 'warning') {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    if (type === 'warning') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime) // A4
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.3) // E4
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } else if (type === 'relax') {
      // Dua nada harmonis lembut (C5 -> G5)
      const freqs = [523.25, 783.99]
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.15)
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.6)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.15)
        osc.stop(ctx.currentTime + idx * 0.15 + 0.6)
      })
    } else {
      // Success fanfare chime
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.08)
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4)
      })
    }
  } catch (err) {
    console.warn('[Audio Play Error]', err)
  }
}
