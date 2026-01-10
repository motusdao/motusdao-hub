'use client'

import { useUIStore, type MatrixColor } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface MatrixColorSelectorProps {
  onColorChange?: (color: MatrixColor) => void
}

const colorOptions: { value: MatrixColor; label: string; colorClass: string; rgb: string }[] = [
  { value: 'green', label: 'Verde', colorClass: 'bg-[#39ff14]', rgb: 'rgb(57, 255, 20)' },
  { value: 'red', label: 'Rojo', colorClass: 'bg-[#ff1744]', rgb: 'rgb(255, 23, 68)' },
  { value: 'orange', label: 'Naranja', colorClass: 'bg-[#ff9100]', rgb: 'rgb(255, 145, 0)' },
  { value: 'blue', label: 'Azul', colorClass: 'bg-[#00e5ff]', rgb: 'rgb(0, 229, 255)' },
  { value: 'pink', label: 'Rosa', colorClass: 'bg-[#ff10f0]', rgb: 'rgb(255, 16, 240)' },
]

export function MatrixColorSelector({ onColorChange }: MatrixColorSelectorProps) {
  const { matrixColor, setMatrixColor } = useUIStore()

  const handleColorSelect = (color: MatrixColor) => {
    setMatrixColor(color)
    onColorChange?.(color)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Color del Tema Matrix
      </label>
      <div className="grid grid-cols-5 gap-3">
        {colorOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleColorSelect(option.value)}
            className={cn(
              "group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              matrixColor === option.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
            aria-label={`Seleccionar color ${option.label}`}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200",
                option.colorClass,
                "shadow-lg"
              )}
              style={{
                boxShadow: matrixColor === option.value 
                  ? `0 0 20px ${option.rgb}, 0 0 40px ${option.rgb}` 
                  : `0 4px 12px rgba(0,0,0,0.3)`
              }}
            >
              {matrixColor === option.value && (
                <Check className="w-5 h-5 text-black font-bold" strokeWidth={3} />
              )}
            </div>
            <span className="text-xs font-medium text-center">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Personaliza el color de tu tema Matrix. Los cambios se aplicarán inmediatamente.
      </p>
    </div>
  )
}
