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
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import { TestGaslessTransaction } from '@/components/payments/TestGaslessTransaction'

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

          {/* Test Gasless Transaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <TestGaslessTransaction />
          </motion.div>

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
