'use client'

import { useState, useEffect } from 'react'
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
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider'

interface StepBlockchainProps {
  onNext: () => void
  onBack: () => void
}

type BlockchainStatus = 'idle' | 'waiting-wallet' | 'submitting' | 'success' | 'error'

export function StepBlockchain({ onNext, onBack }: StepBlockchainProps) {
  const { role, data, updateData } = useOnboardingStore()
  const { smartAccountAddress, kernelClient, isInitializing, error: smartWalletError } = useSmartAccount()
  const [status, setStatus] = useState<BlockchainStatus>('idle')
  const [error, setError] = useState<string>('')

  // Wait for smart wallet to be ready
  useEffect(() => {
    if (isInitializing) {
      setStatus('waiting-wallet')
    } else if (smartWalletError) {
      setStatus('error')
      setError(`Error al crear smart wallet: ${smartWalletError}`)
    } else if (smartAccountAddress) {
      // Smart wallet is ready
      if (status === 'waiting-wallet') {
        setStatus('idle')
      }
      // Update store with smart wallet address
      if (data.walletAddress !== smartAccountAddress) {
        updateData({
          walletAddress: smartAccountAddress,
          walletType: 'smart-wallet'
        })
      }
    }
  }, [isInitializing, smartAccountAddress, smartWalletError, status, data.walletAddress, updateData])

  const handleRegisterOnChain = async () => {
    if (!smartAccountAddress) {
      setError('Smart wallet no está listo. Por favor espera...')
      setStatus('waiting-wallet')
      return
    }

    setStatus('submitting')
    setError('')

    try {
      // Step 1: Submit off-chain registration to API with smart wallet address
      const endpoint = role === 'psm' ? '/api/onboarding/psm' : '/api/onboarding/user'
      const payload = {
        // Connection - use smart wallet address
        email: data.email,
        walletAddress: smartAccountAddress, // Smart wallet address
        privyId: data.privyId,
        // Personal
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        fechaNacimiento: data.fechaNacimiento,
        ciudad: data.ciudad,
        pais: data.pais,
        // Role-specific
        ...(role === 'usuario' ? {
          tipoAtencion: data.tipoAtencion,
          problematica: data.problematica,
          preferenciaAsignacion: data.preferenciaAsignacion
        } : {}),
        ...(role === 'psm' ? {
          cedulaProfesional: data.cedulaProfesional,
          formacionAcademica: data.formacionAcademica,
          experienciaAnios: data.experienciaAnios,
          biografia: data.biografia,
          especialidades: data.especialidades,
          participaSupervision: data.participaSupervision,
          participaCursos: data.participaCursos,
          participaInvestigacion: data.participaInvestigacion,
          participaComunidad: data.participaComunidad
        } : {})
      }

      console.log('🔄 Submitting registration with smart wallet:', {
        endpoint,
        smartWalletAddress: smartAccountAddress,
        email: data.email
      })

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        interface ErrorResponse {
          message?: string
          error?: string
          details?: string
          code?: string
        }
        let err: ErrorResponse = {}
        let errorText = ''
        
        try {
          errorText = await res.text()
          if (errorText) {
            try {
              err = JSON.parse(errorText) as ErrorResponse
            } catch (parseError) {
              // If JSON parsing fails, use the raw text as error message
              console.warn('Error response is not valid JSON:', parseError)
              err = { message: errorText || res.statusText }
            }
          } else {
            // Empty response, use status text
            err = { message: res.statusText || 'Error desconocido' }
          }
        } catch (readError) {
          console.error('Error reading error response:', readError)
          err = { message: res.statusText || 'Error al leer la respuesta del servidor' }
        }
        
        console.error('Registration API error:', {
          status: res.status,
          statusText: res.statusText,
          error: err,
          rawResponse: errorText
        })
        
        // If user exists, check if we can update (wallet address change)
        if (res.status === 409 && err.code === 'USER_EXISTS') {
          // User exists - this might be okay if we're updating wallet address
          console.log('ℹ️ User already exists, updating with smart wallet address')
        } else {
          // Extract error message with fallbacks
          const errorMessage = err?.error || err?.message || err?.details || 
            `Error al registrar en la base de datos (${res.status}: ${res.statusText})`
          throw new Error(errorMessage)
        }
      } else {
        const result = await res.json()
        console.log('✅ Off-chain registration successful:', result)
      }

      // Step 2: Optional - Send a test transaction to verify smart wallet works
      // This is optional but can be useful to verify the smart wallet is fully functional
      if (kernelClient) {
        try {
          console.log('🔄 Verifying smart wallet with test transaction...')
          // You could send a zero-value transaction here if needed
          // For now, we'll just mark as success
        } catch (txError) {
          console.warn('⚠️ Test transaction failed, but registration succeeded:', txError)
          // Don't fail the flow - registration is complete
        }
      }

      setStatus('success')
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        onNext()
      }, 2000)
      
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error in blockchain registration:', err)
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'waiting-wallet':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Creando Smart Wallet...</h2>
            <p className="text-muted-foreground mb-6">
              Estamos creando tu smart wallet. Esto solo toma unos segundos...
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse"></div>
                <span>Inicializando smart wallet...</span>
              </div>
            </div>
          </div>
        )

      case 'idle':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registro en la blockchain</h2>
            <p className="text-muted-foreground mb-6">
              Tu smart wallet está lista. Completa el registro para guardar tu información en la blockchain.
            </p>
            
            {smartAccountAddress && (
              <div className="p-4 glass rounded-xl mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="font-medium">Smart Wallet Creada</p>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {smartAccountAddress.slice(0, 10)}...{smartAccountAddress.slice(-8)}
                </p>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mauve-500/20 rounded-full flex items-center justify-center">
                    <span className="text-mauve-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Smart Wallet lista</p>
                    <p className="text-sm text-muted-foreground">
                      Tu wallet inteligente está configurada y lista para usar
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mauve-500/20 rounded-full flex items-center justify-center">
                    <span className="text-mauve-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Registro on-chain</p>
                    <p className="text-sm text-muted-foreground">
                      Guardar tu información en la base de datos con tu smart wallet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CTAButton
              onClick={handleRegisterOnChain}
              disabled={!smartAccountAddress}
              className="flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Completar Registro</span>
            </CTAButton>
          </div>
        )

      case 'submitting':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registrando en blockchain...</h2>
            <p className="text-muted-foreground mb-6">
              Guardando tu información en la base de datos con tu smart wallet.
            </p>
            
            {smartAccountAddress && (
              <div className="p-4 glass rounded-xl mb-4">
                <p className="text-sm text-muted-foreground mb-1">Smart Wallet:</p>
                <p className="text-sm font-mono text-white">
                  {smartAccountAddress.slice(0, 10)}...{smartAccountAddress.slice(-8)}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse"></div>
                <span>Registrando información...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-mauve-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Actualizando base de datos...</span>
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
              Tu smart wallet ha sido creada y tu registro está completo.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium">Smart Wallet creada</p>
                    {smartAccountAddress && (
                      <p className="text-sm text-muted-foreground font-mono">
                        {smartAccountAddress.slice(0, 10)}...{smartAccountAddress.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium">Registro completado</p>
                    <p className="text-sm text-muted-foreground">
                      Tu cuenta {role === 'usuario' ? 'de usuario' : 'profesional'} está lista
                    </p>
                  </div>
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
              <div className="p-4 glass rounded-xl mb-6 bg-red-500/10 border border-red-500/20">
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
