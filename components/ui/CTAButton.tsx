import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

export function CTAButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  glow = false,
  ...props
}: CTAButtonProps) {
  const variantClasses = {
    primary: "bg-gradient-mauve hover:bg-gradient-to-r hover:from-mauve-600 hover:to-mauve-800 text-white border-0",
    secondary: "glass-card hover:bg-white/10 text-foreground border-white/20",
    ghost: "bg-transparent hover:bg-white/5 text-foreground border-white/10"
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-ring",
        "border backdrop-blur-sm",
        variantClasses[variant],
        sizeClasses[size],
        glow && "shadow-glow hover:shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
