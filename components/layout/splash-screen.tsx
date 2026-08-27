'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  useEffect(() => {
    const hasShown = sessionStorage.getItem('soca_splash_shown')
    if (hasShown) {
      setShow(false)
      return
    }

    // Munculkan progress bar dengan efek fade-in setelah seluruh huruf selesai masuk (setelah ~700ms)
    const progressTimer = setTimeout(() => {
      setShowProgress(true)
      
      // Request animation frame agar transisi width 0 ke 100% berjalan mulus
      requestAnimationFrame(() => {
        setProgress(100)
      })
    }, 700)

    // Mulai fade out seluruh screen setelah 2.2 detik (memberi waktu progress bar jalan)
    const timer1 = setTimeout(() => {
      setFade(true)
    }, 2200)

    // Hapus dari DOM setelah 2.7 detik (2.2 detik + 0.5 detik durasi fade-out)
    const timer2 = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('soca_splash_shown', 'true')
    }, 2700)

    return () => {
      clearTimeout(progressTimer)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Logo SocaSob Animatif (Naik Turun) */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-4 animate-bounce">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo-socasob.png" 
              alt="SocaSob Logo" 
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-3xl font-extrabold font-figtree tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-signal-blue to-active-teal drop-shadow-sm animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            SocaSob
          </h1>
        </div>
        
        {/* Progress Bar Horizontal Tipis */}
        <div 
          className={`mt-8 w-[160px] h-[3px] bg-signal-blue/20 rounded-full overflow-hidden transition-opacity duration-500 ${
            showProgress ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Indicator bergerak dari kiri ke kanan (Biru) */}
          <div 
            className="h-full bg-signal-blue shadow-[0_0_8px_rgba(78,154,217,0.8)] rounded-full transition-all duration-[1200ms] ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-signal-blue/5 to-transparent -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-active-teal/5 to-transparent -z-10"></div>
    </div>
  )
}
