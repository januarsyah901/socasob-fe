/**
 * Testing utilities untuk Socket.io connection
 * Gunakan di browser console untuk testing
 */

export function createMockSocketData() {
  const mockData = {
    // Simulate timer update
    emitTimerUpdate: () => {
      const hours = Math.floor(Math.random() * 24)
      const minutes = Math.floor(Math.random() * 60)
      const seconds = Math.floor(Math.random() * 60)
      
      return {
        type: 'timer-update',
        data: { hours, minutes, seconds },
        timestamp: new Date().toISOString()
      }
    },

    // Simulate eye distance detection
    emitEyeDistance: () => {
      const distances = ['Dekat', 'Jauh']
      return {
        type: 'eye-distance',
        data: { distance: distances[Math.floor(Math.random() * distances.length)] },
        timestamp: new Date().toISOString()
      }
    },

    // Simulate eye status
    emitEyeStatus: () => {
      const statuses = ['normal', 'risk_myopia', 'risk_fatigue']
      return {
        type: 'eye-status',
        data: { status: statuses[Math.floor(Math.random() * statuses.length)] },
        timestamp: new Date().toISOString()
      }
    },

    // Print connection status
    printConnectionStatus: (isConnected: boolean) => {
      console.log(`%c[SocaSob Socket] Connection Status: ${isConnected ? 'CONNECTED ✓' : 'DISCONNECTED ✗'}`, 
        `color: ${isConnected ? 'green' : 'red'}; font-weight: bold;`)
    },

    // Print event log
    printEvent: (event: string, data: any) => {
      console.log(`%c[SocaSob Socket] ${event}`, 'color: blue; font-weight: bold;', data)
    }
  }

  return mockData
}

export function setupSocketTesting() {
  if (typeof window !== 'undefined') {
    (window as any).__SOCASOB_SOCKET_TEST__ = createMockSocketData()
    console.log('%c[SocaSob] Socket testing utilities loaded', 'color: green; font-weight: bold;')
    console.log('Available methods:', Object.keys(createMockSocketData()))
  }
}

// Sample backend event payload
export const sampleBackendPayloads = {
  timerUpdate: {
    hours: 2,
    minutes: 35,
    seconds: 42
  },
  eyeDistance: {
    distance: 'Dekat' // or 'Jauh'
  },
  eyeStatus: {
    status: 'normal' // or 'risk_myopia', 'risk_fatigue'
  }
}
