'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Heart, 
  ArrowRight,
  Shield,
  Users,
  Brain,
  GraduationCap
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore } from '@/lib/onboarding-store'

interface StepRoleSelectionProps {
  onNext: () => void
  onBack: () => void
}

export function StepRoleSelection({ onNext, onBack }: StepRoleSelectionProps) {
  const { role, setRole } = useOnboardingStore()
  const [selectedRole, setSelectedRole] = useState<'usuario' | 'psm' | null>(role)

  const handleRoleSelect = (newRole: 'usuario' | 'psm') => {
    setSelectedRole(newRole)
    setRole(newRole)
  }

  const handleContinue = () => {
    if (selectedRole) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Selecciona tu tipo de cuenta</h2>
          <p className="text-muted-foreground">
            Elige cómo quieres usar MotusDAO
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Usuario Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => handleRoleSelect('usuario')}
          >
            <GlassCard 
              className={`p-6 transition-all duration-300 ${
                selectedRole === 'usuario' 
                  ? 'ring-2 ring-mauve-500 bg-mauve-500/10' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Soy Usuario</h3>
                  <p className="text-muted-foreground">Busco apoyo en salud mental</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Acceso a psicoterapia</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span>MotusAI personalizado</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-green-400" />
                  <span>Cursos de bienestar</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Bitácora privada</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* PSM Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => handleRoleSelect('psm')}
          >
            <GlassCard 
              className={`p-6 transition-all duration-300 ${
                selectedRole === 'psm' 
                  ? 'ring-2 ring-mauve-500 bg-mauve-500/10' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Soy Profesional</h3>
                  <p className="text-muted-foreground">Profesional de la Salud Mental</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Gestión de pacientes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Supervisión de casos</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>Certificaciones</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Red profesional</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
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
            onClick={handleContinue}
            disabled={!selectedRole}
            className="flex items-center space-x-2"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </CTAButton>
        </div>
      </GlassCard>
    </motion.div>
  )
}

