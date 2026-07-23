'use client'

import { useEffect } from 'react'

export function ThemeApplier() {
  useEffect(() => {
    const stored = localStorage.getItem('socasob-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored === 'dark' || (!stored && prefersDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}
