import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'mauve' | 'iris'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export function GradientText({ 
  children, 
  className, 
  variant = 'default',
  as: Component = 'span'
}: GradientTextProps) {
  const variantClasses = {
    default: "gradient-text",
    mauve: "gradient-text-mauve",
    iris: "bg-gradient-to-r from-iris-500 to-iris-700 bg-clip-text text-transparent"
  }

  return (
    <Component
      className={cn(
        "font-heading font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </Component>
  )
}
