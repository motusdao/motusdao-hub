'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Shield
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore } from '@/lib/onboarding-store'

interface StepBlockchainProps {
  onNext: () => void
  onBack: () => void
}

type BlockchainStatus = 'idle' | 'registering' | 'success' | 'error'

export function StepBlockchain({ onNext, onBack }: StepBlockchainProps) {
  const { role } = useOnboardingStore()
  // const { data } = useOnboardingStore() // TODO: Use data for blockchain registration
  const [status, setStatus] = useState<BlockchainStatus>('idle')
  const [error, setError] = useState<string>('')

  const handleRegisterOnChain = async () => {
    setStatus('registering')
    setError('')

    try {
      // Simular llamada a la API de registro
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Aquí iría la llamada real a useUserManagement
      // if (role === 'psm') {
      //   await registerOnChain('psm', offChainId)
      // } else {
      //   await completeRegistration(form, 'patient')
      // }
      
      setStatus('success')
      
      // Auto-redirect después de 2 segundos
      setTimeout(() => {
        onNext()
      }, 2000)
      
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registro en la blockchain</h2>
            <p className="text-muted-foreground mb-6">
              Confirma la transacción en tu wallet para completar el registro y obtener tu identidad descentralizada.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mauve-500/20 rounded-full flex items-center justify-center">
                    <span className="text-mauve-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Registro off-chain completado</p>
                    <p className="text-sm text-muted-foreground">
                      Tu información ha sido guardada de forma segura
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mauve-500/20 rounded-full flex items-center justify-center">
                    <span className="text-mauve-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Registro on-chain</p>
                    <p className="text-sm text-muted-foreground">
                      Crear tu identidad descentralizada en la blockchain
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CTAButton
              onClick={handleRegisterOnChain}
              className="flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Registrar en Blockchain</span>
            </CTAButton>
          </div>
        )

      case 'registering':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registrando en blockchain...</h2>
            <p className="text-muted-foreground mb-6">
              Por favor, confirma la transacción en tu wallet. Esto puede tomar unos momentos.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse"></div>
                <span>Procesando transacción...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Creando identidad descentralizada...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span>Verificando registro...</span>
              </div>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Registro completado!</h2>
            <p className="text-muted-foreground mb-6">
              Tu identidad descentralizada ha sido creada exitosamente en la blockchain.
            </p>
            
            <div className="p-4 glass-card rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <p className="font-medium">Registro exitoso</p>
                  <p className="text-sm text-muted-foreground">
                    Tu cuenta {role === 'usuario' ? 'de usuario' : 'profesional'} está lista
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Redirigiendo automáticamente...
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error en el registro</h2>
            <p className="text-muted-foreground mb-6">
              Hubo un problema al registrar en la blockchain. Por favor, inténtalo de nuevo.
            </p>
            
            {error && (
              <div className="p-4 glass-card rounded-lg mb-6 bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Atrás
              </button>
              <CTAButton
                onClick={handleRegisterOnChain}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Intentar de nuevo</span>
              </CTAButton>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="p-8">
        {getStatusContent()}
      </GlassCard>
    </motion.div>
  )
}
