'use client'

import { usePrivy } from '@privy-io/react-auth'
import { X } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { CTAButton } from './CTAButton'
import { GradientText } from './GradientText'
import { EmailLoginModal } from '@/components/onboarding/EmailLoginModal'
import { useState } from 'react'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const { login } = usePrivy()
  const [showEmailLogin, setShowEmailLogin] = useState(false)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <GlassCard 
          className="max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <GradientText as="h2" className="text-2xl font-bold mb-4">
              Inicia Sesión
            </GradientText>
            <p className="text-muted-foreground mb-6">
              Inicia sesión para explorar la aplicación
            </p>
            
            <div className="flex flex-col gap-3">
              <CTAButton 
                size="lg" 
                onClick={() => setShowEmailLogin(true)}
                className="w-full"
              >
                Iniciar Sesión
              </CTAButton>
              <CTAButton 
                variant="secondary" 
                size="lg"
                onClick={onClose}
                className="w-full"
              >
                Cancelar
              </CTAButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Email Login Modal */}
      <EmailLoginModal 
        isOpen={showEmailLogin} 
        onClose={() => {
          setShowEmailLogin(false)
          onClose()
        }}
        onLoggedIn={() => {
          setShowEmailLogin(false)
          onClose()
        }}
      />
    </>
  )
}

