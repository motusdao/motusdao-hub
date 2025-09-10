'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  Heart, 
  Users, 
  Star, 
  MessageCircle,
  Video,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

// Mock therapist data
const therapists = [
  {
    id: '1',
    name: 'Dr. María González',
    specialization: 'Ansiedad y Depresión',
    experience: '8 años',
    rating: 4.9,
    patients: 150,
    languages: ['Español', 'Inglés'],
    availability: 'Disponible',
    price: '$80/sesión',
    image: '/api/placeholder/150/150',
    bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual con enfoque en ansiedad y depresión.',
    nextAvailable: 'Mañana 2:00 PM'
  },
  {
    id: '2',
    name: 'Lic. Carlos Rodríguez',
    specialization: 'Terapia de Pareja',
    experience: '12 años',
    rating: 4.8,
    patients: 200,
    languages: ['Español'],
    availability: 'Disponible',
    price: '$90/sesión',
    image: '/api/placeholder/150/150',
    bio: 'Especialista en terapia de pareja y familiar con más de una década de experiencia.',
    nextAvailable: 'Viernes 10:00 AM'
  },
  {
    id: '3',
    name: 'Dra. Ana Martínez',
    specialization: 'Trauma y EMDR',
    experience: '6 años',
    rating: 4.9,
    patients: 120,
    languages: ['Español', 'Francés'],
    availability: 'Ocupada',
    price: '$100/sesión',
    image: '/api/placeholder/150/150',
    bio: 'Especialista en trauma y terapia EMDR, certificada internacionalmente.',
    nextAvailable: 'Lunes 3:00 PM'
  }
]

const features = [
  {
    icon: Shield,
    title: 'Confidencialidad Total',
    description: 'Tus sesiones están protegidas con encriptación de extremo a extremo'
  },
  {
    icon: Video,
    title: 'Sesiones Virtuales',
    description: 'Conecta con tu terapeuta desde la comodidad de tu hogar'
  },
  {
    icon: Calendar,
    title: 'Horarios Flexibles',
    description: 'Agenda sesiones que se adapten a tu rutina diaria'
  },
  {
    icon: CheckCircle,
    title: 'Terapeutas Certificados',
    description: 'Todos nuestros profesionales están licenciados y verificados'
  }
]

export default function PsicoterapiaPage() {
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
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Psicoterapia
                </GradientText>
                <p className="text-muted-foreground">Conecta con profesionales de la salud mental</p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
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

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8">¿Cómo funciona?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-mauve rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Elige tu Terapeuta</h3>
                  <p className="text-muted-foreground text-sm">
                    Explora nuestro directorio de profesionales certificados y encuentra el que mejor se adapte a tus necesidades.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-mauve rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Agenda tu Sesión</h3>
                  <p className="text-muted-foreground text-sm">
                    Selecciona un horario que funcione para ti y confirma tu cita virtual.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-mauve rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Comienza tu Terapia</h3>
                  <p className="text-muted-foreground text-sm">
                    Conéctate con tu terapeuta y comienza tu viaje hacia el bienestar mental.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Therapists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Nuestros Terapeutas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist) => (
                <GlassCard key={therapist.id} className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {therapist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{therapist.name}</h3>
                      <p className="text-muted-foreground text-sm">{therapist.specialization}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{therapist.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({therapist.patients} pacientes)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{therapist.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experiencia:</span>
                      <span className="font-medium">{therapist.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Idiomas:</span>
                      <span className="font-medium">{therapist.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-medium text-mauve-400">{therapist.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estado:</span>
                      <div className="flex items-center">
                        {therapist.availability === 'Disponible' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                        )}
                        <span className="font-medium">{therapist.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <CTAButton 
                      size="sm" 
                      className="w-full"
                      disabled={therapist.availability === 'Ocupada'}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {therapist.availability === 'Disponible' ? 'Agendar Sesión' : 'Lista de Espera'}
                    </CTAButton>
                    <CTAButton 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                    >
                      Ver Perfil Completo
                    </CTAButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-4">¿Necesitas ayuda inmediata?</h2>
              <p className="text-muted-foreground mb-6">
                Si estás pasando por una crisis, no dudes en contactar a los servicios de emergencia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton size="lg" glow>
                  <Heart className="w-5 h-5 mr-2" />
                  Buscar Terapeuta
                </CTAButton>
                <CTAButton variant="secondary" size="lg">
                  <Users className="w-5 h-5 mr-2" />
                  Ver Todos los Profesionales
                </CTAButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
