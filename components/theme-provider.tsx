'use client'

import { useUIStore } from '@/lib/store'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, matrixColor } = useUIStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes and data attributes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')
    root.removeAttribute('data-matrix-color')
    
    // Apply the current theme
    if (theme === 'matrix') {
      root.setAttribute('data-theme', 'matrix')
      root.setAttribute('data-matrix-color', matrixColor)
    } else {
      root.classList.add(theme)
    }
  }, [theme, matrixColor])

  return <>{children}</>
}
