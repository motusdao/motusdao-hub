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
import { useWallets } from '@privy-io/react-auth'

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

interface PaymentPreferenceData {
  id: string
  userId: string
  defaultDestination: 'own_wallet' | 'matched_psm' | 'dao_treasury'
  hasMatchedPSM: boolean
  matchedPSM: {
    id: string
    smartWalletAddress: string | null
  } | null
}

interface UserData {
  id: string
  email: string
  role: string
  smartWalletAddress?: string | null
}

type OnrampProvider = 'transak' | 'mtpelerin' | 'privy'

interface ProviderConfig {
  id: OnrampProvider
  name: string
  enabled: boolean
  description: string
}

export default function PagosPage() {
  const { authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets()
  const { smartAccountAddress } = useSmartAccount()
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreferenceData | null>(null)
  const [isLoadingPreference, setIsLoadingPreference] = useState(false)
  const [isSavingPreference, setIsSavingPreference] = useState(false)
  const [isStartingOnramp, setIsStartingOnramp] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<OnrampProvider | null>(null)
  const [mtPelerinUrl, setMtPelerinUrl] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Configuración de proveedores con flags de habilitación desde env vars
  const providers: ProviderConfig[] = [
    {
      id: 'transak',
      name: 'Transak Lite',
      enabled: !!process.env.NEXT_PUBLIC_TRANSAK_ENABLED, // Flag para habilitar/deshabilitar
      description: 'Compra cripto con tarjeta de crédito/débito (Transak Lite)'
    },
    {
      id: 'mtpelerin',
      name: 'Mt Pelerin',
      enabled: !!process.env.NEXT_PUBLIC_MTPELERIN_WIDGET_URL,
      description: 'On-ramp integrado con soporte para MXN y Celo'
    },
    {
      id: 'privy',
      name: 'Privy (via Ramp/Coinbase)',
      enabled: authenticated && !!wallets?.[0] && !!process.env.NEXT_PUBLIC_PRIVY_ONRAMP_PROVIDER, // Requiere wallet + proveedor configurado
      description: 'On-ramp facilitado por Privy con proveedores externos'
    }
  ]

  const availableProviders = providers.filter(p => p.enabled)

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

  const getDestinationLabel = () => {
    if (!paymentPreference) return '—'

    switch (paymentPreference.defaultDestination) {
      case 'own_wallet':
        return 'Mi wallet'
      case 'matched_psm':
        return 'Mi psicólogo/a'
      case 'dao_treasury':
        return 'Tesorería de la DAO'
      default:
        return 'Destino desconocido'
    }
  }

  const handleStartOnramp = async (provider: OnrampProvider) => {
    if (!authenticated) {
      alert('Necesitas iniciar sesión y conectar tu wallet antes de usar el on-ramp.')
      return
    }

    const destinationAddress = getDestinationAddress()

    if (!destinationAddress) {
      alert('No se encontró una dirección de destino válida. Revisa tu selección de destino de fondos.')
      return
    }

    const destinationLabel = getDestinationLabel()

    const confirmed = window.confirm(
      `Vas a comprar cripto con ${providers.find(p => p.id === provider)?.name} y enviarla a:\n\n` +
        `Destino: ${destinationLabel}\n` +
        `Dirección: ${destinationAddress}\n\n` +
        `¿Confirmas que este es el destino correcto de tus fondos?`
    )

    if (!confirmed) return

    try {
      setIsStartingOnramp(true)
      setSelectedProvider(provider)

      switch (provider) {
        case 'transak': {
          // Transak Lite integration - usa API route para generar URL firmada
          try {
            const response = await fetch('/api/transak-lite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: destinationAddress,
                email: userEmail
              })
            })

            if (!response.ok) {
              const errorData = await response.json()
              const errorMessage = errorData.error || 'Error al generar URL de Transak'
              const missingVars = errorData.missing || []
              const hint = errorData.hint || ''
              
              throw new Error(
                `${errorMessage}${missingVars.length > 0 ? `\n\nVariables faltantes: ${missingVars.join(', ')}` : ''}${hint ? `\n\n${hint}` : ''}`
              )
            }

            const data = await response.json()
            const transakUrl = data.url

            if (transakUrl) {
              // Abrir Transak en nueva pestaña
              window.open(transakUrl, '_blank', 'noopener,noreferrer')
            } else {
              alert('No se pudo generar la URL de Transak. Verifica la configuración.')
            }
          } catch (err) {
            console.error('Error obteniendo URL de Transak:', err)
            alert(
              'Error al iniciar Transak Lite.\n\n' +
              'Asegúrate de que:\n' +
              '1. Las credenciales estén configuradas en .env.local\n' +
              '2. El API route /api/transak-lite esté funcionando\n\n' +
              'Error: ' + (err instanceof Error ? err.message : 'Desconocido')
            )
          }
          break
        }

        case 'mtpelerin': {
          const baseUrl = process.env.NEXT_PUBLIC_MTPELERIN_WIDGET_URL

          if (!baseUrl) {
            alert('Mt Pelerin aún no está configurado. Contacta al equipo de MotusDAO.')
            return
          }

          // Construye la URL del widget según la documentación de Mt Pelerin.
          // IMPORTANTE: configura NEXT_PUBLIC_MTPELERIN_WIDGET_URL con MXN, red CELO y USDT
          const url = new URL(baseUrl)
          url.searchParams.set('walletAddress', destinationAddress)

          setMtPelerinUrl(url.toString())
          break
        }

        case 'privy': {
          // Privy on-ramp integration
          // Privy facilita la integración con proveedores externos (Ramp, Coinbase, MoonPay, etc.)
          // Requiere configuración en backend para generar URLs firmadas
          const primaryWallet = wallets?.[0]

          if (!primaryWallet) {
            alert('Necesitas tener una wallet conectada para usar Privy on-ramp.')
            return
          }

          // Llamar a API route del backend para obtener URL firmada del proveedor
          try {
            const response = await fetch('/api/privy-onramp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: destinationAddress,
                email: userEmail,
                provider: process.env.NEXT_PUBLIC_PRIVY_ONRAMP_PROVIDER || 'ramp' // ramp, coinbase, moonpay, etc.
              })
            })

            if (!response.ok) {
              throw new Error('Error al generar URL de on-ramp')
            }

            const data = await response.json()
            const onrampUrl = data.url

            if (onrampUrl) {
              // Abrir en nueva pestaña o iframe según preferencia
              window.open(onrampUrl, '_blank', 'noopener,noreferrer')
            } else {
              alert('No se pudo generar la URL de on-ramp. Verifica la configuración del backend.')
            }
          } catch (err) {
            console.error('Error obteniendo URL de Privy on-ramp:', err)
            alert(
              'Privy on-ramp requiere configuración en el backend.\n\n' +
              'Pasos necesarios:\n' +
              '1. Configurar un proveedor (Ramp, Coinbase, MoonPay, etc.)\n' +
              '2. Crear API route en /api/privy-onramp\n' +
              '3. Generar URL firmada con clave secreta del proveedor\n\n' +
              'Por ahora, puedes usar Mt Pelerin o Transak.'
            )
          }
          break
        }

        default:
          alert('Proveedor no reconocido.')
      }
    } catch (err) {
      console.error('Error iniciando on-ramp:', err)
      alert('Hubo un problema al iniciar el widget de pagos. Intenta nuevamente en unos momentos.')
    } finally {
      setIsStartingOnramp(false)
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
                      <span className="text-sm">Onramp con múltiples proveedores (Transak, Mt Pelerin, Privy)</span>
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

          {/* Provider Selection */}
          {authenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12"
            >
              <GlassCard className="max-w-4xl mx-auto p-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Selecciona tu Proveedor de On-Ramp</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Elige el proveedor que prefieras para comprar cripto con tarjeta y enviarlo al destino seleccionado.
                </p>

                {availableProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No hay proveedores de on-ramp configurados actualmente.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contacta al equipo de MotusDAO para habilitar los proveedores.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {providers.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleStartOnramp(provider.id)}
                        disabled={!provider.enabled || isStartingOnramp || !getDestinationAddress()}
                        className={`p-6 glass-card rounded-lg border-2 transition-all text-left ${
                          provider.enabled
                            ? selectedProvider === provider.id
                              ? 'border-mauve-500 bg-mauve-500/10'
                              : 'border-white/10 hover:border-white/20 cursor-pointer'
                            : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          {provider.enabled ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                        {!provider.enabled && (
                          <p className="text-xs text-yellow-500 mt-2">Próximamente disponible</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {isStartingOnramp && (
                  <div className="mt-6 text-center">
                    <Loader className="w-6 h-6 animate-spin text-mauve-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Iniciando {providers.find(p => p.id === selectedProvider)?.name}...
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Mt Pelerin On/Off-Ramp iFrame */}
          {mtPelerinUrl && selectedProvider === 'mtpelerin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8"
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Completa tu compra de cripto sin salir de MotusDAO
                  </h3>
                  <button
                    onClick={() => {
                      setMtPelerinUrl(null)
                      setSelectedProvider(null)
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Este widget es proporcionado por Mt Pelerin. Asegúrate de que la dirección mostrada en el flujo
                  coincida con el destino que seleccionaste aquí.
                </p>
                <div className="w-full">
                  <iframe
                    src={mtPelerinUrl}
                    title="Mt Pelerin exchange widget"
                    loading="lazy"
                    allow="usb; ethereum; clipboard-write; payment; microphone; camera"
                    className="w-full h-[700px] rounded-xl border border-white/10"
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </Section>
    </div>
  )
}
