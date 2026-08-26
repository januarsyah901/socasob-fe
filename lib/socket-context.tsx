'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { sendDesktopNotification, playGentleChime } from './desktop-notifications'

const getIsProd = () => typeof window !== 'undefined' && window.location.hostname !== 'localhost'

const BE_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (getIsProd() ? 'https://be-socasob.hallojanu.xyz' : 'http://localhost:3001')
const BE_API = process.env.NEXT_PUBLIC_API_URL || BE_URL
const ML_WS_URL = process.env.NEXT_PUBLIC_ML_WS_URL || (getIsProd() ? 'wss://socasob-ml.hallojanu.xyz/ws' : 'ws://localhost:5000/ws')

export type LcdCommand = 'normal' | 'fatigue_5m' | 'fatigue_10m' | 'break_20m' | 'dry_eye'
export type SpeakerCommand = 'cling' | 'bip-bip' | 'ting-tong' | 'pop-pop' | 'ta-da' | 'none'

export interface HardwareState {
  lcdCommand: LcdCommand
  speakerCommand: SpeakerCommand
  fatigueDurationSec: number
  breakRemainingSec: number
  workElapsedSec: number
}

export interface FatigueData {
  status?: string
  dataQuality?: string
  recommendation?: string
}

export interface DryEyeData {
  perclos?: number
  avgBlinkDuration?: number
  incompleteBlinkRatio?: number
  riskFactors?: string[]
}

export interface MyopiaRiskData {
  distanceCm?: number
  distanceWarning?: boolean
  breakState?: string
  screenTimeMinutes?: number
}

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
  hardware: HardwareState
  fatigueData: FatigueData
  dryEyeData: DryEyeData
  myopiaRiskData: MyopiaRiskData
  mlWsConnected: boolean
  queryMlHistory: (type: 'fatigue' | 'dry_eye' | 'myopia_risk', days?: number) => void
  queryMlSummary: (days?: number) => void
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

  // State Hardware Aktuator & Monitoring Waktu
  const [hardware, setHardware] = useState<HardwareState>({
    lcdCommand: 'normal',
    speakerCommand: 'none',
    fatigueDurationSec: 0,
    breakRemainingSec: 0,
    workElapsedSec: 0,
  })

  // State Detail Payload WebSocket ML
  const [fatigueData, setFatigueData] = useState<FatigueData>({})
  const [dryEyeData, setDryEyeData] = useState<DryEyeData>({})
  const [myopiaRiskData, setMyopiaRiskData] = useState<MyopiaRiskData>({})

  // State Native ML WebSocket (Port 8765)
  const [mlWs, setMlWs] = useState<WebSocket | null>(null)
  const [mlWsConnected, setMlWsConnected] = useState(false)

  // Baca robotId dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem('socasob-robot-id')
    if (saved) setRobotIdState(saved)
  }, [])

  // Inisialisasi Socket.IO Client (Backend)
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

    socketInstance.on('hardware-status', (data: any) => {
      if (!data) return
      setHardware((prev) => ({
        lcdCommand: data.lcd_command || prev.lcdCommand,
        speakerCommand: data.speaker_command || prev.speakerCommand,
        fatigueDurationSec: data.fatigue_duration_sec ?? prev.fatigueDurationSec,
        breakRemainingSec: data.break_remaining_sec ?? prev.breakRemainingSec,
        workElapsedSec: data.work_elapsed_sec ?? prev.workElapsedSec,
      }))
    })

    socketInstance.on('eye-distance', (data) => {
      const dist = data.distance || 'Jauh'
      setEyeDistance(dist)
      if (data.confidence !== undefined) setConfidence(Math.round(data.confidence))

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
        return
      }
      const st = data.status || 'normal'
      setEyeStatus(st)

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

  // Inisialisasi Native WebSocket Client (Native ML WS - Port 8765)
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout

    const connectNativeWs = () => {
      try {
        ws = new WebSocket(ML_WS_URL)

        ws.onopen = () => {
          console.log('[ML-WS] Connected to ML Native WebSocket server:', ML_WS_URL)
          setMlWsConnected(true)
        }

        ws.onmessage = (event) => {
          // Ignore non-JSON handshakes from ML Server (e.g., 'READY', 'OK')
          if (typeof event.data === 'string' && (event.data === 'READY' || event.data === 'OK' || event.data === 'pong')) {
            return;
          }

          try {
            const payload = JSON.parse(event.data)

            // Handle Tipe Payload ML Broadcast:
            if (payload.target === 'hardware') {
              setHardware({
                lcdCommand: payload.lcd_command || 'normal',
                speakerCommand: payload.speaker_command || 'none',
                fatigueDurationSec: payload.fatigue_duration_sec ?? 0,
                breakRemainingSec: payload.break_remaining_sec ?? 0,
                workElapsedSec: payload.work_elapsed_sec ?? 0,
              })
            } else if (payload.type === 'fatigue') {
              setFatigueData({
                status: payload.status,
                dataQuality: payload.data_quality,
                recommendation: payload.recommendation,
              })
            } else if (payload.type === 'dry_eye') {
              setDryEyeData({
                perclos: payload.perclos,
                avgBlinkDuration: payload.avg_blink_duration,
                incompleteBlinkRatio: payload.incomplete_blink_ratio,
                riskFactors: payload.risk_factors,
              })
            } else if (payload.type === 'myopia_risk') {
              setMyopiaRiskData({
                distanceCm: payload.distance_cm,
                distanceWarning: payload.distance_warning,
                breakState: payload.break_state,
                screenTimeMinutes: payload.screen_time_minutes,
              })
            }
          } catch (e) {
            console.error('[ML-WS] Error parsing message:', e)
          }
        }

        ws.onclose = () => {
          setMlWsConnected(false)
          reconnectTimer = setTimeout(connectNativeWs, 3000)
        }

        ws.onerror = () => {
          setMlWsConnected(false)
        }

        setMlWs(ws)
      } catch (e) {
        setMlWsConnected(false)
        reconnectTimer = setTimeout(connectNativeWs, 5000)
      }
    }

    connectNativeWs()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [])

  // Helper untuk query histori & summary via Native ML WebSocket
  const queryMlHistory = useCallback((type: 'fatigue' | 'dry_eye' | 'myopia_risk', days = 7) => {
    if (mlWs && mlWs.readyState === WebSocket.OPEN) {
      mlWs.send(JSON.stringify({ action: 'get_history', type, days }))
    }
  }, [mlWs])

  const queryMlSummary = useCallback((days = 1) => {
    if (mlWs && mlWs.readyState === WebSocket.OPEN) {
      mlWs.send(JSON.stringify({ action: 'get_summary', days }))
    }
  }, [mlWs])

  // Fungsi untuk set robotId dan langsung subscribe ke room
  const setRobotId = useCallback((id: string) => {
    setRobotIdState(id)
    localStorage.setItem('socasob-robot-id', id)
    if (socket?.connected && id) {
      socket.emit('subscribe-robot', { robot_id: id })
      console.log(`[SocaSob] Subscribed to robot:${id}`)
      setTimer({ hours: 0, minutes: 0, seconds: 0 })
      setEyeDistance('Jauh')
      setEyeStatus('disconnected')
      setConfidence(0)
      setHardware({
        lcdCommand: 'normal',
        speakerCommand: 'none',
        fatigueDurationSec: 0,
        breakRemainingSec: 0,
        workElapsedSec: 0,
      })
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
    hardware,
    fatigueData,
    dryEyeData,
    myopiaRiskData,
    mlWsConnected,
    queryMlHistory,
    queryMlSummary,
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

/**
 * Helper: fetch ke BE API dengan base URL yang benar.
 * - Otomatis inject JWT token dari localStorage ke Authorization header
 * - Jika server balas 401, session dianggap expired → auto logout & redirect /login
 */
export async function beApi(path: string, options?: RequestInit) {
  const base = BE_API.replace(/\/+$/, '').replace(/\/api$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${cleanPath}`

  // Inject JWT token jika tersedia
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('socasob_token')
    : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })

  // Handle 401 — token expired atau tidak valid
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('socasob_token')
      localStorage.removeItem('socasob_user')
      window.location.href = '/login'
    }
    return { success: false, error: 'Sesi berakhir. Silakan login ulang.' }
  }

  return res.json()
}

