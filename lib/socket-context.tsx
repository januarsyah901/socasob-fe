'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
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
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [eyeDistance, setEyeDistance] = useState('Jauh')
  const [eyeStatus, setEyeStatus] = useState<SocketContextType['eyeStatus']>('disconnected')
  const [confidence, setConfidence] = useState(0)
  const [eyeScore, setEyeScore] = useState(0)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('[SocaSob] Socket connected')
      setIsConnected(true)
      setEyeStatus('normal')
    })

    socketInstance.on('disconnect', () => {
      console.log('[SocaSob] Socket disconnected')
      setIsConnected(false)
      setEyeStatus('disconnected')
    })

    socketInstance.on('timer-update', (data) => {
      setTimer({
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0,
      })
    })

    socketInstance.on('eye-distance', (data) => {
      setEyeDistance(data.distance || 'Jauh')
      if (data.confidence !== undefined) setConfidence(Math.round(data.confidence * 100))
    })

    socketInstance.on('eye-status', (data) => {
      setEyeStatus(data.status || 'normal')
      if (data.score !== undefined) setEyeScore(data.score)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const value: SocketContextType = {
    socket,
    isConnected,
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
