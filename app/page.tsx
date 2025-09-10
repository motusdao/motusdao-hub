'use client'

import { useState } from 'react'
import { ADNBackdrop } from '@/components/three/ADNBackdrop'
import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { RolePickerModal } from '@/components/onboarding/RolePickerModal'
import { EmailLoginModal } from '@/components/onboarding/EmailLoginModal'
import { useUIStore } from '@/lib/store'
import { usePrivy } from '@privy-io/react-auth'
import { 
  Bot, 
  Heart, 
  GraduationCap, 
  CreditCard, 
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const featuredApps = [
  {
    title: 'MotusAI',
    description: 'Asistente de IA especializado en salud mental',
    icon: Bot,
    href: '/motusai',
    color: 'from-blue-500 to-purple-600'
  },
  {
    title: 'Psicoterapia',
    description: 'Conecta con profesionales de la salud mental',
    icon: Heart,
    href: '/psicoterapia',
    color: 'from-pink-500 to-rose-600'
  },
  {
    title: 'Academia',
    description: 'Cursos y recursos para el bienestar mental',
    icon: GraduationCap,
    href: '/academia',
    color: 'from-green-500 to-emerald-600'
  },
  {
    title: 'Pagos',
    description: 'Sistema de pagos descentralizado',
    icon: CreditCard,
    href: '/pagos',
    color: 'from-yellow-500 to-orange-600'
  }
]

export default function Home() {
  const { } = useUIStore()
  const { authenticated } = usePrivy()
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [showRolePicker, setShowRolePicker] = useState(false)

  // Debug logs
  console.log('Home Debug:', {
    authenticated,
    showEmailLogin,
    showRolePicker
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <ADNBackdrop intensity={0.3} speed={0.5} />
      
      {/* Hero Section */}
      <Section className="relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-mauve-500 mr-3" />
              <GradientText as="h1" className="text-5xl md:text-7xl font-bold">
                MotusDAO Hub
              </GradientText>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Plataforma integral de salud mental que combina tecnología blockchain, 
              inteligencia artificial y atención profesional para tu bienestar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <CTAButton 
                size="lg" 
                glow 
                className="group"
                onClick={() => {
                  if (authenticated) {
                    setShowRolePicker(true)
                  } else {
                    setShowEmailLogin(true)
                  }
                }}
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </CTAButton>
              
              <Link href="/docs">
                <CTAButton variant="secondary" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Documentación
                </CTAButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Featured Apps Section */}
      <Section className="relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Aplicaciones Destacadas
            </GradientText>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre las herramientas que transformarán tu experiencia en salud mental
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.map((app, index) => {
              const Icon = app.icon
              return (
                <motion.div
                  key={app.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                >
                  <Link href={app.href}>
                    <GlassCard hover className="h-full p-6 group cursor-pointer">
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${app.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-mauve-400 transition-colors">
                          {app.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm">
                          {app.description}
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <GlassCard className="max-w-2xl mx-auto p-8">
              <GradientText as="h2" className="text-2xl md:text-3xl font-bold mb-4">
                ¿Listo para comenzar tu viaje?
              </GradientText>
              <p className="text-muted-foreground mb-6">
                Únete a la revolución de la salud mental descentralizada. 
                Tu bienestar es nuestra prioridad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton size="lg" glow>
                  Crear Cuenta
                </CTAButton>
                <CTAButton variant="secondary" size="lg">
                  Ver Demo
                </CTAButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Section>

      {/* Email Login Modal */}
      <EmailLoginModal 
        isOpen={showEmailLogin} 
        onClose={() => setShowEmailLogin(false)}
        onLoggedIn={() => {
          setShowEmailLogin(false)
          setShowRolePicker(true)
        }}
      />

      {/* Role Picker Modal */}
      <RolePickerModal 
        isOpen={showRolePicker} 
        onClose={() => setShowRolePicker(false)} 
      />
    </div>
  )
}
