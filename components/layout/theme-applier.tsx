'use client';

import { useEffect } from 'react';

// Default light; if user chose dark (stored in localStorage), add `dark` class.
export function ThemeApplier() {
  useEffect(() => {
    const theme = window.localStorage.getItem('socasob-theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);
  return null;
}
