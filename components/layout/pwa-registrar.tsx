'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope)
          },
          (err) => {
            console.error('[PWA] Service Worker registration failed:', err)
          }
        )
      }
      
      if (document.readyState === 'complete') {
        register()
      } else {
        window.addEventListener('load', register)
      }
    }
  }, [])
  return null
}
