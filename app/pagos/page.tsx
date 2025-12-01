'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  DollarSign,
  Shield,
  Zap,
  Info,
  User,
  Building2,
  Loader
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider'

const paymentSteps = [
  {
    step: 1,
    title: 'Onramp',
    description: 'Convierte tu dinero fiat a criptomonedas',
    icon: DollarSign,
    status: 'coming-soon',
    details: 'Integración con Transak y MiniPay próximamente'
  },
  {
    step: 2,
    title: 'Wallet',
    description: 'Almacena tus fondos de forma segura',
    icon: Wallet,
    status: 'active',
    details: 'Conecta tu wallet con Privy'
  },
  {
    step: 3,
    title: 'Split',
    description: 'Distribución automática de pagos',
    icon: Zap,
    status: 'coming-soon',
    details: 'Sistema de división de pagos en desarrollo'
  }
]

const features = [
  {
    icon: Shield,
    title: 'Seguridad Blockchain',
    description: 'Todas las transacciones están protegidas por la tecnología blockchain'
  },
  {
    icon: Zap,
    title: 'Pagos Instantáneos',
    description: 'Transacciones rápidas y sin intermediarios'
  },
  {
    icon: DollarSign,
    title: 'Tarifas Bajas',
    description: 'Costos mínimos comparado con sistemas tradicionales'
  }
]

export default function PagosPage() {
  const { authenticated, user, ready } = usePrivy()
  const { smartAccountAddress } = useSmartAccount()
  const [paymentPreference, setPaymentPreference] = useState<any>(null)
  const [isLoadingPreference, setIsLoadingPreference] = useState(false)
  const [isSavingPreference, setIsSavingPreference] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const userEmail = user?.email?.address || user?.google?.email
  const privyId = user?.id
  const daoTreasuryAddress = process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS || '0xf229F3Dcea3D7cd3cA5ca41C4C50135D7b37F2b9'

  // Fetch user data and payment preference
  useEffect(() => {
    const fetchData = async () => {
      if (!ready || !authenticated || !userEmail) return

      setIsLoadingPreference(true)
      try {
        // Get user profile to get userId
        const params = new URLSearchParams()
        if (privyId) params.append('privyId', privyId)
        if (userEmail) params.append('email', userEmail)

        const profileResponse = await fetch(`/api/profile?${params.toString()}`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setUserData(profileData.user)

          // Get payment preference
          if (profileData.user?.id) {
            const prefResponse = await fetch(`/api/payment-preferences?userId=${profileData.user.id}`)
            if (prefResponse.ok) {
              const prefData = await prefResponse.json()
              setPaymentPreference(prefData.preference)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching payment preference:', err)
      } finally {
        setIsLoadingPreference(false)
      }
    }

    fetchData()
  }, [ready, authenticated, userEmail, privyId])

  const handleDestinationChange = async (destination: 'own_wallet' | 'matched_psm' | 'dao_treasury') => {
    if (!userData?.id || isSavingPreference) return

    setIsSavingPreference(true)
    try {
      const response = await fetch('/api/payment-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          defaultDestination: destination
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentPreference(data.preference)
      } else {
        const error = await response.json()
        console.error('Error updating preference:', error)
      }
    } catch (err) {
      console.error('Error updating preference:', err)
    } finally {
      setIsSavingPreference(false)
    }
  }

  const getDestinationAddress = () => {
    if (!paymentPreference) return null

    switch (paymentPreference.defaultDestination) {
      case 'own_wallet':
        return smartAccountAddress || userData?.smartWalletAddress
      case 'matched_psm':
        return paymentPreference.matchedPSM?.smartWalletAddress
      case 'dao_treasury':
        return daoTreasuryAddress
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Sistema de Pagos
                </GradientText>
                <p className="text-muted-foreground">Pagos descentralizados para servicios de salud mental</p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <GlassCard key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              )
            })}
          </motion.div>

          {/* Payment Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8">Flujo de Pagos</h2>
              <div className="space-y-6">
                {paymentSteps.map((step, index) => {
                  const Icon = step.icon
                  const isLast = index === paymentSteps.length - 1
                  
                  return (
                    <div key={step.step} className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          step.status === 'active' 
                            ? 'bg-gradient-mauve' 
                            : step.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-white/10'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                          ) : step.status === 'coming-soon' ? (
                            <Clock className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <Icon className="w-8 h-8 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
                          </div>
                          <div className="text-right">
                            {step.status === 'active' && (
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                Activo
                              </span>
                            )}
                            {step.status === 'coming-soon' && (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                                Próximamente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!isLast && (
                        <div className="ml-6">
                          <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Payment Destination Selection */}
          {authenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Wallet className="w-6 h-6 mr-3 text-mauve-500" />
                  Destino de Fondos
                </h2>
                <p className="text-muted-foreground mb-6">
                  Selecciona dónde quieres que vayan tus fondos cuando hagas on-ramp (convierte fiat a cripto)
                </p>

                {isLoadingPreference ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-mauve-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Own Wallet Option */}
                    <button
                      onClick={() => handleDestinationChange('own_wallet')}
                      disabled={isSavingPreference}
                      className={`w-full p-6 glass-card rounded-lg border-2 transition-all text-left ${
                        paymentPreference?.defaultDestination === 'own_wallet'
                          ? 'border-mauve-500 bg-mauve-500/10'
                          : 'border-white/10 hover:border-white/20'
                      } ${isSavingPreference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentPreference?.defaultDestination === 'own_wallet'
                              ? 'bg-mauve-500'
                              : 'bg-white/10'
                          }`}>
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Mi Wallet</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Los fondos irán a tu propia smart wallet
                            </p>
                            {smartAccountAddress || userData?.smartWalletAddress ? (
                              <p className="text-xs font-mono text-muted-foreground break-all">
                                {(smartAccountAddress || userData?.smartWalletAddress)?.slice(0, 10)}...{(smartAccountAddress || userData?.smartWalletAddress)?.slice(-8)}
                              </p>
                            ) : (
                              <p className="text-xs text-yellow-500">Smart wallet no disponible aún</p>
                            )}
                          </div>
                        </div>
                        {paymentPreference?.defaultDestination === 'own_wallet' && (
                          <CheckCircle className="w-6 h-6 text-mauve-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Matched PSM Option */}
                    {paymentPreference?.hasMatchedPSM && paymentPreference?.matchedPSM ? (
                      <button
                        onClick={() => handleDestinationChange('matched_psm')}
                        disabled={isSavingPreference}
                        className={`w-full p-6 glass-card rounded-lg border-2 transition-all text-left ${
                          paymentPreference?.defaultDestination === 'matched_psm'
                            ? 'border-mauve-500 bg-mauve-500/10'
                            : 'border-white/10 hover:border-white/20'
                        } ${isSavingPreference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              paymentPreference?.defaultDestination === 'matched_psm'
                                ? 'bg-mauve-500'
                                : 'bg-white/10'
                            }`}>
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-1">Mi Psicólogo/a</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Los fondos irán directamente a tu profesional emparejado
                              </p>
                              {paymentPreference.matchedPSM.smartWalletAddress ? (
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                  {paymentPreference.matchedPSM.smartWalletAddress.slice(0, 10)}...{paymentPreference.matchedPSM.smartWalletAddress.slice(-8)}
                                </p>
                              ) : (
                                <p className="text-xs text-yellow-500">Wallet del profesional no disponible</p>
                              )}
                            </div>
                          </div>
                          {paymentPreference?.defaultDestination === 'matched_psm' && (
                            <CheckCircle className="w-6 h-6 text-mauve-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full p-6 glass-card rounded-lg border border-white/10 opacity-50">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1 text-muted-foreground">Mi Psicólogo/a</h3>
                            <p className="text-sm text-muted-foreground">
                              No disponible - Necesitas estar emparejado con un profesional
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DAO Treasury Option */}
                    <button
                      onClick={() => handleDestinationChange('dao_treasury')}
                      disabled={isSavingPreference}
                      className={`w-full p-6 glass-card rounded-lg border-2 transition-all text-left ${
                        paymentPreference?.defaultDestination === 'dao_treasury'
                          ? 'border-mauve-500 bg-mauve-500/10'
                          : 'border-white/10 hover:border-white/20'
                      } ${isSavingPreference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentPreference?.defaultDestination === 'dao_treasury'
                              ? 'bg-mauve-500'
                              : 'bg-white/10'
                          }`}>
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Tesorería DAO</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Los fondos irán a la tesorería de MotusDAO
                            </p>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                              {daoTreasuryAddress.slice(0, 10)}...{daoTreasuryAddress.slice(-8)}
                            </p>
                          </div>
                        </div>
                        {paymentPreference?.defaultDestination === 'dao_treasury' && (
                          <CheckCircle className="w-6 h-6 text-mauve-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Current Selection Display */}
                    {getDestinationAddress() && (
                      <div className="mt-6 p-4 glass-card rounded-lg border border-mauve-500/30">
                        <p className="text-xs text-muted-foreground mb-2">Dirección de destino actual:</p>
                        <p className="text-sm font-mono break-all">{getDestinationAddress()}</p>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}


          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Estado Actual del Sistema</h3>
                  <p className="text-muted-foreground mb-4">
                    El sistema de pagos está configurado con Pimlico paymaster para gasless transactions.
                    La integración con wallets a través de Privy está activa. Las funcionalidades de onramp 
                    y split de pagos estarán disponibles en futuras actualizaciones.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Conexión de wallet (Privy)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Pimlico Paymaster configurado (gasless transactions)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Onramp con Transak/MiniPay</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Sistema de split de pagos</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-4">¿Listo para el futuro de los pagos?</h2>
              <p className="text-muted-foreground mb-6">
                Mantente actualizado sobre las nuevas funcionalidades del sistema de pagos descentralizado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton size="lg" glow disabled>
                  <Wallet className="w-5 h-5 mr-2" />
                  Conectar Wallet
                </CTAButton>
                <CTAButton variant="secondary" size="lg" disabled>
                  <Info className="w-5 h-5 mr-2" />
                  Más Información
                </CTAButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
