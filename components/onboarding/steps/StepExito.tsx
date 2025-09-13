'use client'

// import { useEffect } from 'react' // TODO: Add success page effects
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Bot, 
  GraduationCap,
  Heart,
  Users
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore } from '@/lib/onboarding-store'

interface StepExitoProps {
  onComplete?: () => void
}

export function StepExito({ onComplete: _onComplete }: StepExitoProps) {
  // TODO: Use onComplete callback when needed
  const { role, reset } = useOnboardingStore()
  const router = useRouter()

  // Removed automatic reset - let user stay on success page
  // useEffect(() => {
  //   // Reset onboarding state after successful completion
  //   const timer = setTimeout(() => {
  //     reset()
  //   }, 5000)

  //   return () => clearTimeout(timer)
  // }, [reset])

  const handleRedirect = (path: string) => {
    reset()
    router.push(path)
  }

  const getRoleContent = () => {
    if (role === 'usuario') {
      return {
        title: '🎉 ¡Listo! Tu registro ha sido completado',
        subtitle: 'Bienvenido a MotusDAO. Tu cuenta de usuario está lista para usar.',
        features: [
          { icon: Heart, label: 'Acceso a psicoterapia', description: 'Conecta con profesionales' },
          { icon: Bot, label: 'MotusAI personalizado', description: 'Asistente de IA especializado' },
          { icon: GraduationCap, label: 'Cursos de bienestar', description: 'Recursos para tu salud mental' },
          { icon: Home, label: 'Bitácora privada', description: 'Diario personal seguro' }
        ],
        primaryAction: {
          label: 'Ir a MotusAI',
          path: '/motusai',
          icon: Bot
        },
        secondaryAction: {
          label: 'Ir a Inicio',
          path: '/',
          icon: Home
        }
      }
    } else {
      return {
        title: '🎉 ¡Bienvenido/a a la red profesional de MotusDAO!',
        subtitle: 'Tu cuenta profesional está lista. Accede a todas las herramientas para profesionales.',
        features: [
          { icon: Users, label: 'Gestión de pacientes', description: 'Administra tu cartera de pacientes' },
          { icon: Heart, label: 'Supervisión de casos', description: 'Revisa y supervisa terapias' },
          { icon: GraduationCap, label: 'Certificaciones', description: 'Accede a cursos y certificaciones' },
          { icon: Home, label: 'Red profesional', description: 'Conecta con otros profesionales' }
        ],
        primaryAction: {
          label: 'Ir al Dashboard',
          path: '/',
          icon: Home
        },
        secondaryAction: {
          label: 'Academia',
          path: '/academia',
          icon: GraduationCap
        }
      }
    }
  }

  const content = getRoleContent()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-4"
          >
            {content.title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg"
          >
            {content.subtitle}
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {content.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 glass-card rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-mauve-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-mauve-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <CTAButton
            onClick={() => handleRedirect(content.primaryAction.path)}
            className="flex items-center space-x-2"
          >
            <content.primaryAction.icon className="w-4 h-4" />
            <span>{content.primaryAction.label}</span>
            <ArrowRight className="w-4 h-4" />
          </CTAButton>
          
          <button
            onClick={() => handleRedirect(content.secondaryAction.path)}
            className="flex items-center justify-center space-x-2 px-6 py-3 glass-card border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            <content.secondaryAction.icon className="w-4 h-4" />
            <span>{content.secondaryAction.label}</span>
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 glass-card rounded-lg bg-mauve-500/10 border border-mauve-500/20"
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ¿Necesitas ayuda o tienes preguntas?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href="/docs" 
                className="text-mauve-400 hover:text-mauve-300 transition-colors"
              >
                Documentación
              </a>
              <span className="text-gray-500">•</span>
              <a 
                href="/contact" 
                className="text-mauve-400 hover:text-mauve-300 transition-colors"
              >
                Soporte
              </a>
            </div>
          </div>
        </motion.div>

        {/* Back to Onboarding Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => {
              reset()
              router.push('/onboarding')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors underline"
          >
            Volver al inicio del registro
          </button>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}
