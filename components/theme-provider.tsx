'use client'

import { useUIStore } from '@/lib/store'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes and data attributes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')
    
    // Apply the current theme
    if (theme === 'matrix') {
      root.setAttribute('data-theme', 'matrix')
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
}
