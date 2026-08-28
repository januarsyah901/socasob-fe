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

export async function sendDesktopNotification({
  title,
  body,
  icon = '/images/logo-socasob.png',
  tag,
  requireInteraction = false,
  bypassThrottle = false,
}: DesktopNotificationOptions & { bypassThrottle?: boolean }): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false
  }

  const now = Date.now()
  if (!bypassThrottle && now - lastNotificationTime < THROTTLE_MS) {
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


function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush(robotId: string): Promise<boolean> {
  console.group('[Web Push] subscribeToWebPush() dipanggil dengan robotId:', robotId);
  
  if (!robotId) {
    console.error('[Web Push] ❌ robotId kosong! Simpan settings dulu.');
    console.groupEnd();
    return false;
  }
  if (!('serviceWorker' in navigator)) {
    console.error('[Web Push] ❌ Browser tidak support Service Worker');
    console.groupEnd();
    return false;
  }
  if (!('PushManager' in window)) {
    console.error('[Web Push] ❌ Browser tidak support PushManager (butuh HTTPS atau localhost)');
    console.groupEnd();
    return false;
  }
  
  console.log('[Web Push] ✅ Browser support SW + PushManager');
  console.log('[Web Push] Notification.permission:', Notification.permission);
  
  try {
    // Register SW jika belum
    let registration = await navigator.serviceWorker.getRegistration('/');
    console.log('[Web Push] SW registration:', registration ? 'Ada' : 'Belum ada');
    
    if (!registration) {
      console.log('[Web Push] Mendaftarkan SW baru...');
      registration = await navigator.serviceWorker.register('/sw.js');
    }
    
    // Tunggu SW aktif
    const ready = await navigator.serviceWorker.ready;
    console.log('[Web Push] SW siap, scope:', ready.scope);

    // Cek subscription lama
    const existingSub = await ready.pushManager.getSubscription();
    console.log('[Web Push] Existing subscription:', existingSub ? 'Ada (pakai yang lama)' : 'Belum ada');
    
    let subscription = existingSub;
    if (!subscription) {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('[Web Push] VAPID key dari env:', publicVapidKey ? publicVapidKey.slice(0, 20) + '...' : '❌ TIDAK ADA');
      
      if (!publicVapidKey) {
        console.error('[Web Push] ❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY tidak ada di env! Restart Next.js dev server.');
        console.groupEnd();
        return false;
      }
      
      console.log('[Web Push] Membuat subscription baru ke Push Server (FCM)...');
      subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      console.log('[Web Push] ✅ Subscription berhasil dibuat!');
      console.log('[Web Push] Endpoint:', subscription.endpoint.slice(0, 60) + '...');
    }

    // Kirim ke backend
    const BE_API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const base = BE_API.replace(/\/+$/, '').replace(/\/api$/, '');
    const url = `${base}/api/push/subscribe`;
    console.log('[Web Push] Mengirim subscription ke backend:', url);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ robotId, subscription })
    });
    
    const data = await res.json();
    console.log('[Web Push] Response backend:', res.status, data);
    
    if (res.ok) {
      console.log('[Web Push] ✅ Subscription tersimpan di backend untuk robotId:', robotId);
    } else {
      console.error('[Web Push] ❌ Backend error:', data);
    }
    
    console.groupEnd();
    return res.ok;
  } catch (err) {
    console.error('[Web Push] ❌ Exception:', err);
    console.groupEnd();
    return false;
  }
}
