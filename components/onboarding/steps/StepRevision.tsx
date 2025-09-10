'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Mail, 
  Wallet, 
  User, 
  Phone, 
  Calendar, 
  MapPin,
  Heart,
  Award,
  Edit
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore } from '@/lib/onboarding-store'

interface StepRevisionProps {
  onNext: () => void
  onBack: () => void
}

export function StepRevision({ onNext, onBack }: StepRevisionProps) {
  const { data, role } = useOnboardingStore()

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAddress = (address: string) => {
    if (!address) return 'No conectada'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSubmit = async () => {
    try {
      const endpoint = role === 'psm' ? '/api/onboarding/psm' : '/api/onboarding/user'
      const payload = {
        // Connection
        email: data.email,
        walletAddress: data.walletAddress,
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

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Onboarding submit failed:', err)
        alert(err?.error || 'No se pudo completar el registro. Intenta nuevamente.')
        return
      }

      onNext()
    } catch (e) {
      console.error('Onboarding submit error:', e)
      alert('Ocurrió un error inesperado. Intenta nuevamente.')
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Revisa tu información</h2>
          <p className="text-muted-foreground">
            Verifica que todos los datos sean correctos antes de continuar
          </p>
        </div>

        <div className="space-y-6">
          {/* Connection Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-mauve-400" />
              <span>Conexión</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Correo electrónico</span>
                </div>
                <p className="text-white">{data.email || 'No especificado'}</p>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Wallet</span>
                </div>
                <p className="text-white font-mono">{formatAddress(data.walletAddress || '')}</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5 text-mauve-400" />
              <span>Información Personal</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Nombre completo</span>
                </div>
                <p className="text-white">{data.nombre} {data.apellido}</p>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Teléfono</span>
                </div>
                <p className="text-white">{data.telefono || 'No especificado'}</p>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium">Fecha de nacimiento</span>
                </div>
                <p className="text-white">{formatDate(data.fechaNacimiento || '')}</p>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Ubicación</span>
                </div>
                <p className="text-white">{data.ciudad}, {data.pais}</p>
              </div>
            </div>
          </div>

          {/* Role-specific Info */}
          {role === 'usuario' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Heart className="w-5 h-5 text-mauve-400" />
                <span>Perfil Terapéutico</span>
              </h3>
              <div className="space-y-4">
                <div className="p-4 glass-card rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium">Tipo de atención</span>
                  </div>
                  <p className="text-white capitalize">{data.tipoAtencion || 'No especificado'}</p>
                </div>
                <div className="p-4 glass-card rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Motivo de consulta</span>
                  </div>
                  <p className="text-white">{data.problematica || 'No especificado'}</p>
                </div>
                <div className="p-4 glass-card rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Preferencia de asignación</span>
                  </div>
                  <p className="text-white capitalize">
                    {data.preferenciaAsignacion === 'automatica' ? 'Asignación automática' : 'Explorar perfiles'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Award className="w-5 h-5 text-mauve-400" />
                <span>Información Profesional</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 glass-card rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">Cédula profesional</span>
                  </div>
                  <p className="text-white">{data.cedulaProfesional || 'No especificada'}</p>
                </div>
                <div className="p-4 glass-card rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Años de experiencia</span>
                  </div>
                  <p className="text-white">{data.experienciaAnios || 0} años</p>
                </div>
                <div className="p-4 glass-card rounded-lg md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">Formación académica</span>
                  </div>
                  <p className="text-white">{data.formacionAcademica || 'No especificada'}</p>
                </div>
                {data.biografia && (
                  <div className="p-4 glass-card rounded-lg md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Edit className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">Biografía</span>
                    </div>
                    <p className="text-white">{data.biografia}</p>
                  </div>
                )}
                <div className="p-4 glass-card rounded-lg md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium">Especialidades</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.especialidades?.map((especialidad, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-mauve-500/20 text-mauve-300 rounded-full text-xs"
                      >
                        {especialidad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Preferences (PSM only) */}
          {role === 'psm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="w-5 h-5 text-mauve-400" />
                <span>Preferencias de Plataforma</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.participaSupervision && (
                  <div className="p-3 glass-card rounded-lg text-center">
                    <User className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-white">Supervisión</p>
                  </div>
                )}
                {data.participaCursos && (
                  <div className="p-3 glass-card rounded-lg text-center">
                    <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs text-white">Cursos</p>
                  </div>
                )}
                {data.participaInvestigacion && (
                  <div className="p-3 glass-card rounded-lg text-center">
                    <Edit className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-white">Investigación</p>
                  </div>
                )}
                {data.participaComunidad && (
                  <div className="p-3 glass-card rounded-lg text-center">
                    <User className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                    <p className="text-xs text-white">Comunidad</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Atrás
          </button>
          
          <CTAButton
            onClick={handleSubmit}
            className="flex items-center space-x-2"
          >
            <span>Continuar al registro</span>
          </CTAButton>
        </div>
      </GlassCard>
    </motion.div>
  )
}
