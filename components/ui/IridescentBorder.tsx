import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface IridescentBorderProps {
  children: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function IridescentBorder({ 
  children, 
  className,
  intensity = 'medium'
}: IridescentBorderProps) {
  const intensityClasses = {
    low: "opacity-30",
    medium: "opacity-60",
    high: "opacity-90"
  }

  return (
    <div className={cn("iridescent-border", className)}>
      <div className={cn(
        "rounded-lg bg-background/80 backdrop-blur-sm p-6",
        intensityClasses[intensity]
      )}>
        {children}
      </div>
    </div>
  )
}
