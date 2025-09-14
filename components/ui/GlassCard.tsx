import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'strong'
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  hover = false 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "smooth-transition",
        variant === 'default' 
          ? "glass" 
          : "glass-strong",
        hover && "hover:bg-white/20 hover:scale-[1.02] hover:shadow-glow",
        className
      )}
    >
      {children}
    </div>
  )
}
