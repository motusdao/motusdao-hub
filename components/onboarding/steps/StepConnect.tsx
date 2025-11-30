'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Mail, 
  AlertCircle, 
  CheckCircle,
  Loader
} from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore, isValidCeloAddress } from '@/lib/onboarding-store'
import { getCeloChain } from '@/lib/celo'
import { 
  identifyEmbeddedWallet
} from '@/lib/wallet-utils'

const connectSchema = z.object({
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  acceptPrivacy: z.boolean()
    .refine(val => val === true, 'Debes aceptar la política de privacidad')
})

type ConnectFormData = z.infer<typeof connectSchema>

interface StepConnectProps {
  onNext: () => void
  onBack: () => void
}

export function StepConnect({ onNext, onBack }: StepConnectProps) {
  const { ready, authenticated, user, login } = usePrivy()
  const { wallets } = useWallets()
  const { data, updateData } = useOnboardingStore()
  const [isConnecting, setIsConnecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false
    },
    mode: 'onChange'
  })

  // Get the embedded wallet (EOA) address - this is created on login
  // Smart wallet will be created later in StepBlockchain
  const embeddedWallet = identifyEmbeddedWallet(wallets)
  const embeddedWalletAddress = embeddedWallet?.address
  
  // Log wallet detection for debugging
  useEffect(() => {
    if (authenticated && ready && wallets.length > 0) {
      console.log('🔍 Wallet Detection Debug (StepConnect - EOA only):', {
        totalWallets: wallets.length,
        embeddedWalletAddress,
        allWallets: wallets.map(w => ({
          address: w.address,
          type: w.walletClientType,
          chainId: w.chainId
        }))
      })
    }
  }, [authenticated, ready, wallets, embeddedWalletAddress])

  // Update store when user data is available
  // Store EOA address - smart wallet will be created later in StepBlockchain
  useEffect(() => {
    if (authenticated && user && user.email?.address) {
      const userEmail = user.email?.address
      const celoChain = getCeloChain()
      
      if (!embeddedWalletAddress) {
        console.warn('⚠️ No embedded wallet found')
        return
      }
      
      console.log('📝 StepConnect - Storing EOA address:', {
        authenticated,
        userEmail,
        embeddedWalletAddress,
        currentDataEmail: data.email,
        currentDataWallet: data.walletAddress,
        celoChainId: celoChain.id,
        note: 'EOA stored - smart wallet will be created in StepBlockchain'
      })
      
      // Validate Celo address format
      const isValidAddress = isValidCeloAddress(embeddedWalletAddress)
      
      // Store the EOA address - smart wallet will be created later
      if (userEmail !== data.email || embeddedWalletAddress !== data.walletAddress) {
        updateData({ 
          email: userEmail,
          walletAddress: embeddedWalletAddress,
          privyId: user.id,
          celoChainId: celoChain.id,
          walletType: 'embedded' // Mark as embedded - smart wallet created later
        })
        console.log('✅ Updated store with EOA address:', { 
          email: userEmail, 
          walletAddress: embeddedWalletAddress,
          walletType: 'embedded',
          celoChainId: celoChain.id,
          isValidAddress,
          note: 'Smart wallet will be created in StepBlockchain'
        })
      }
    }
  }, [authenticated, user, embeddedWalletAddress, data.email, data.walletAddress, updateData, wallets])

  const handleConnectWallet = async () => {
    if (!ready) return
    
    setIsConnecting(true)
    try {
      await login()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }


  const onSubmit = (formData: ConnectFormData) => {
    console.log('StepConnect onSubmit Debug:', {
      formData,
      canProceed,
      authenticated,
      embeddedWalletAddress,
      isValid,
      userEmail: user?.email?.address
    })
    
    // Email and EOA wallet are already set from Privy user data
    onNext()
  }

  // Allow proceeding if we have embedded wallet (EOA) and email
  // Smart wallet will be created later in StepBlockchain
  const canProceed = authenticated && embeddedWalletAddress && isValid && user?.email?.address && isValidCeloAddress(embeddedWalletAddress)


  // Debug logs
  console.log('StepConnect Debug:', {
    authenticated,
    embeddedWalletAddress,
    isValid,
    userEmail: user?.email?.address,
    canProceed
  })

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-2xl mx-auto"
      >
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Conecta tu cuenta</h2>
            <p className="text-muted-foreground">
              Inicia sesión con tu email para comenzar el proceso de registro
            </p>
          </div>

          <div className="space-y-6">
            <CTAButton
              onClick={handleConnectWallet}
              disabled={!ready || isConnecting}
              className="w-full flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>
                {isConnecting ? 'Conectando...' : ready ? 'Iniciar sesión con email' : 'Cargando...'}
              </span>
            </CTAButton>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Al continuar, aceptas nuestros{' '}
                <a href="/terms" className="text-mauve-400 hover:text-mauve-300 underline">
                  términos y condiciones
                </a>{' '}
                y{' '}
                <a href="/privacy" className="text-mauve-400 hover:text-mauve-300 underline">
                  política de privacidad
                </a>
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Atrás
            </button>
          </div>
        </GlassCard>

      </motion.div>
    )
  }

  // Show verification screen if authenticated
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Cuenta Verificada!</h2>
          <p className="text-muted-foreground">
            Tu email y wallet están listos. Acepta los términos para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            {/* Email Display */}
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Correo Electrónico</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email?.address || 'No disponible'}
                  </p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>

            {/* Wallet Display */}
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Wallet Conectada (EOA)</p>
                  <p className="text-sm text-muted-foreground">
                    {embeddedWalletAddress ? `${embeddedWalletAddress.slice(0, 6)}...${embeddedWalletAddress.slice(-4)}` : 'No conectada'}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    ℹ️ El smart wallet se creará al finalizar el registro
                  </p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                id="acceptTerms"
                className="mt-1 w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500 focus:ring-2"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                Acepto los{' '}
                <a href="/terms" className="text-mauve-400 hover:text-mauve-300 underline">
                  términos y condiciones
                </a>{' '}
                de MotusDAO *
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.acceptTerms.message}</span>
              </p>
            )}

            <div className="flex items-start space-x-3">
              <input
                {...register('acceptPrivacy')}
                type="checkbox"
                id="acceptPrivacy"
                className="mt-1 w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500 focus:ring-2"
              />
              <label htmlFor="acceptPrivacy" className="text-sm text-gray-300">
                Acepto la{' '}
                <a href="/privacy" className="text-mauve-400 hover:text-mauve-300 underline">
                  política de privacidad
                </a>{' '}
                y el manejo de mis datos *
              </label>
            </div>
            {errors.acceptPrivacy && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.acceptPrivacy.message}</span>
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Atrás
            </button>
            
            <CTAButton
              type="submit"
              disabled={!canProceed}
              className="flex items-center space-x-2"
            >
              <span>Continuar</span>
            </CTAButton>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  )
}
