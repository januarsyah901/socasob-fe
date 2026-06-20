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
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [eyeDistance, setEyeDistance] = useState('Dekat')
  const [eyeStatus, setEyeStatus] = useState<SocketContextType['eyeStatus']>('normal')

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('[v0] Socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('[v0] Socket disconnected')
      setIsConnected(false)
    })

    // Listen for real-time updates from backend
    socketInstance.on('timer-update', (data) => {
      setTimer({
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0,
      })
    })

    socketInstance.on('eye-distance', (data) => {
      setEyeDistance(data.distance || 'Dekat')
    })

    socketInstance.on('eye-status', (data) => {
      setEyeStatus(data.status || 'normal')
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
