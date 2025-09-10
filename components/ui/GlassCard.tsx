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
        "rounded-xl border transition-all duration-300",
        variant === 'default' 
          ? "glass-card" 
          : "glass-card-strong",
        hover && "hover:bg-white/10 dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-glow",
        className
      )}
    >
      {children}
    </div>
  )
}
