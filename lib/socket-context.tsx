'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { sendDesktopNotification, playGentleChime } from './desktop-notifications'

const BE_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
const BE_API = process.env.NEXT_PUBLIC_API_URL || BE_URL

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  robotId: string | null
  setRobotId: (id: string) => void
  timer: {
    hours: number
    minutes: number
    seconds: number
  }
  eyeDistance: string
  eyeStatus: 'normal' | 'risk_myopia' | 'risk_fatigue' | 'disconnected'
  confidence: number
  eyeScore: number
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [robotId, setRobotIdState] = useState<string | null>(null)
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [eyeDistance, setEyeDistance] = useState('Jauh')
  const [eyeStatus, setEyeStatus] = useState<SocketContextType['eyeStatus']>('disconnected')
  const [confidence, setConfidence] = useState(0)
  const [eyeScore, setEyeScore] = useState(0)

  // Baca robotId dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem('socasob-robot-id')
    if (saved) setRobotIdState(saved)
  }, [])

  // Inisialisasi socket
  useEffect(() => {
    const socketInstance = io(BE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    })

    socketInstance.on('connect', () => {
      console.log('[SocaSob] Socket connected:', socketInstance.id)
      setIsConnected(true)
      setEyeStatus('normal')

      // Join room robot jika robotId sudah ada
      const savedRobotId = localStorage.getItem('socasob-robot-id')
      if (savedRobotId) {
        socketInstance.emit('subscribe-robot', { robot_id: savedRobotId })
        console.log(`[SocaSob] Auto-subscribed to robot:${savedRobotId}`)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('[SocaSob] Socket disconnected')
      setIsConnected(false)
      setEyeStatus('disconnected')
    })

    socketInstance.on('subscribed', (data: { robot_id: string; room: string }) => {
      console.log(`[SocaSob] Subscribed to room: ${data.room}`)
    })

    socketInstance.on('timer-update', (data) => {
      setTimer({
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0,
      })
    })

    socketInstance.on('eye-distance', (data) => {
      const dist = data.distance || 'Jauh'
      setEyeDistance(dist)
      if (data.confidence !== undefined) setConfidence(Math.round(data.confidence))

      // Trigger desktop notification & chime jika terlalu dekat
      if (dist === 'Dekat') {
        const settingsStr = localStorage.getItem('socasob-settings')
        let soundEnabled = true
        let notifyEnabled = true
        if (settingsStr) {
          try {
            const s = JSON.parse(settingsStr)
            soundEnabled = s.alertSoundEnabled !== false
            notifyEnabled = s.notificationsEnabled !== false
          } catch {}
        }

        if (soundEnabled) playGentleChime('warning')
        if (notifyEnabled) {
          sendDesktopNotification({
            title: '⚠️ Peringatan Jarak Layar SocaSob',
            body: 'Jarak mata Anda kurang dari 30 cm. Mundurkan posisi duduk Anda demi menjaga kesehatan netra.',
            tag: 'socasob-distance-alert',
          })
        }
      }
    })

    socketInstance.on('eye-status', (data) => {
      if (data.status === 'disconnected') {
        setEyeStatus('disconnected')
        setEyeScore(0)
        return
      }
      const st = data.status || 'normal'
      setEyeStatus(st)
      if (data.score !== undefined) setEyeScore(data.score)

      // Jika kelelahan ekstrem, beri notifikasi istirahat 20-20-20
      if (st === 'risk_fatigue') {
        sendDesktopNotification({
          title: '🌿 Waktunya Istirahat Mata (20-20-20)',
          body: 'Mata Anda mulai lelah setelah menatap layar. Lakukan senam mata 20 detik sekarang!',
          tag: 'socasob-fatigue-alert',
        })
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Fungsi untuk set robotId dan langsung subscribe ke room
  const setRobotId = useCallback((id: string) => {
    setRobotIdState(id)
    localStorage.setItem('socasob-robot-id', id)
    if (socket?.connected && id) {
      socket.emit('subscribe-robot', { robot_id: id })
      console.log(`[SocaSob] Subscribed to robot:${id}`)
      // Reset timer & status saat pindah robot
      setTimer({ hours: 0, minutes: 0, seconds: 0 })
      setEyeDistance('Jauh')
      setEyeStatus('disconnected')
      setConfidence(0)
      setEyeScore(0)
    }
  }, [socket])

  const value: SocketContextType = {
    socket,
    isConnected,
    robotId,
    setRobotId,
    timer,
    eyeDistance,
    eyeStatus,
    confidence,
    eyeScore,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

/** Helper: fetch ke BE API dengan base URL yang benar */
export async function beApi(path: string, options?: RequestInit) {
  const base = BE_API.replace(/\/+$/, '').replace(/\/api$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${cleanPath}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}
