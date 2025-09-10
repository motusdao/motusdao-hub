'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap,
  Award,
  Briefcase,
  Users,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { useOnboardingStore } from '@/lib/onboarding-store'

const psmSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  telefono: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Formato de teléfono inválido'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  pais: z.string().min(1, 'El país es obligatorio'),
  cedulaProfesional: z.string().min(1, 'La cédula profesional es obligatoria'),
  formacionAcademica: z.string().min(1, 'La formación académica es obligatoria'),
  experienciaAnios: z.number().min(0, 'Los años de experiencia deben ser 0 o mayor'),
  biografia: z.string().optional(),
  especialidades: z.array(z.string()).min(1, 'Debes seleccionar al menos una especialidad'),
  participaSupervision: z.boolean(),
  participaCursos: z.boolean(),
  participaInvestigacion: z.boolean(),
  participaComunidad: z.boolean()
})

type PSMFormData = z.infer<typeof psmSchema>

interface StepPerfilPSMProps {
  onNext: () => void
  onBack: () => void
}

const especialidades = [
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'trauma', label: 'Trauma y TEPT' },
  { value: 'pareja', label: 'Terapia de pareja' },
  { value: 'familiar', label: 'Terapia familiar' },
  { value: 'infantil', label: 'Psicología infantil' },
  { value: 'adolescentes', label: 'Psicología adolescente' },
  { value: 'adicciones', label: 'Adicciones' },
  { value: 'duelo', label: 'Duelo y pérdidas' },
  { value: 'autoestima', label: 'Autoestima' },
  { value: 'estres', label: 'Manejo del estrés' },
  { value: 'cognitivo', label: 'Terapia cognitivo-conductual' },
  { value: 'humanista', label: 'Terapia humanista' },
  { value: 'psicoanalisis', label: 'Psicoanálisis' },
  { value: 'sistemica', label: 'Terapia sistémica' },
  { value: 'otros', label: 'Otros' }
]

const paises = [
  { value: 'mexico', label: 'México' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'chile', label: 'Chile' },
  { value: 'peru', label: 'Perú' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'ecuador', label: 'Ecuador' },
  { value: 'bolivia', label: 'Bolivia' },
  { value: 'paraguay', label: 'Paraguay' },
  { value: 'uruguay', label: 'Uruguay' },
  { value: 'espana', label: 'España' },
  { value: 'otros', label: 'Otros' }
]

export function StepPerfilPSM({ onNext, onBack }: StepPerfilPSMProps) {
  const { data, updateData } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<PSMFormData>({
    resolver: zodResolver(psmSchema),
    defaultValues: {
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      telefono: data.telefono || '',
      fechaNacimiento: data.fechaNacimiento || '',
      ciudad: data.ciudad || '',
      pais: data.pais || '',
      cedulaProfesional: data.cedulaProfesional || '',
      formacionAcademica: data.formacionAcademica || '',
      experienciaAnios: data.experienciaAnios || 0,
      biografia: data.biografia || '',
      especialidades: data.especialidades || [],
      participaSupervision: data.participaSupervision ?? false,
      participaCursos: data.participaCursos ?? false,
      participaInvestigacion: data.participaInvestigacion ?? false,
      participaComunidad: data.participaComunidad ?? false
    },
    mode: 'onChange'
  })

  const watchedEspecialidades = watch('especialidades')

  const handleEspecialidadChange = (especialidad: string, checked: boolean) => {
    const current = watchedEspecialidades || []
    if (checked) {
      setValue('especialidades', [...current, especialidad])
    } else {
      setValue('especialidades', current.filter(e => e !== especialidad))
    }
  }

  const onSubmit = (formData: PSMFormData) => {
    console.log('StepPerfilPSM onSubmit:', {
      formData,
      isValid,
      errors
    })
    updateData(formData)
    onNext()
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
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Información Profesional</h2>
          <p className="text-muted-foreground">
            Cuéntanos sobre tu formación y experiencia profesional
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium">
                Nombre *
              </label>
              <input
                {...register('nombre')}
                type="text"
                id="nombre"
                placeholder="Tu nombre"
                className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.nombre.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="apellido" className="block text-sm font-medium">
                Apellidos *
              </label>
              <input
                {...register('apellido')}
                type="text"
                id="apellido"
                placeholder="Tus apellidos"
                className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
              />
              {errors.apellido && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.apellido.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="telefono" className="block text-sm font-medium">
                Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('telefono')}
                  type="tel"
                  id="telefono"
                  placeholder="+52 55 1234 5678"
                  className="w-full pl-10 pr-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.telefono && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.telefono.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium">
                Fecha de nacimiento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('fechaNacimiento')}
                  type="date"
                  id="fechaNacimiento"
                  className="w-full pl-10 pr-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.fechaNacimiento && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.fechaNacimiento.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ciudad" className="block text-sm font-medium">
                Ciudad *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('ciudad')}
                  type="text"
                  id="ciudad"
                  placeholder="Tu ciudad"
                  className="w-full pl-10 pr-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.ciudad && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.ciudad.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="pais" className="block text-sm font-medium">
                País *
              </label>
              <div className="relative">
                <select
                  {...register('pais')}
                  id="pais"
                  className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Selecciona tu país</option>
                  {paises.map(pais => (
                    <option key={pais.value} value={pais.value}>
                      {pais.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.pais && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.pais.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold">Información Profesional</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="cedulaProfesional" className="block text-sm font-medium">
                  Cédula profesional *
                </label>
                <input
                  {...register('cedulaProfesional')}
                  type="text"
                  id="cedulaProfesional"
                  placeholder="Ej: 12345678"
                  className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
                {errors.cedulaProfesional && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.cedulaProfesional.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="formacionAcademica" className="block text-sm font-medium">
                  Formación académica *
                </label>
                <input
                  {...register('formacionAcademica')}
                  type="text"
                  id="formacionAcademica"
                  placeholder="Ej: Licenciatura en Psicología, Universidad Nacional"
                  className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
                {errors.formacionAcademica && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.formacionAcademica.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="experienciaAnios" className="block text-sm font-medium">
                  Años de experiencia *
                </label>
                <input
                  {...register('experienciaAnios', { valueAsNumber: true })}
                  type="number"
                  id="experienciaAnios"
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all"
                />
                {errors.experienciaAnios && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.experienciaAnios.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="biografia" className="block text-sm font-medium">
                  Biografía breve (opcional)
                </label>
                <textarea
                  {...register('biografia')}
                  id="biografia"
                  rows={3}
                  placeholder="Cuéntanos brevemente sobre tu enfoque terapéutico y experiencia..."
                  className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg focus:ring-2 focus:ring-mauve-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Especialidades *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {especialidades.map(especialidad => (
                    <label
                      key={especialidad.value}
                      className="flex items-center space-x-2 p-2 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={watchedEspecialidades?.includes(especialidad.value) || false}
                        onChange={(e) => handleEspecialidadChange(especialidad.value, e.target.checked)}
                        className="w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500"
                      />
                      <span className="text-sm">{especialidad.label}</span>
                    </label>
                  ))}
                </div>
                {errors.especialidades && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.especialidades.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Preferencias de plataforma
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 p-3 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      {...register('participaSupervision')}
                      type="checkbox"
                      className="w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Supervisión</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-3 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      {...register('participaCursos')}
                      type="checkbox"
                      className="w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500"
                    />
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Cursos</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-3 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      {...register('participaInvestigacion')}
                      type="checkbox"
                      className="w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Investigación</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-3 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      {...register('participaComunidad')}
                      type="checkbox"
                      className="w-4 h-4 text-mauve-600 bg-transparent border-white/20 rounded focus:ring-mauve-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span className="text-sm">Comunidad</span>
                    </div>
                  </label>
                </div>
              </div>
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
            
            <CTAButton
              type="submit"
              disabled={!isValid}
              className="flex items-center space-x-2"
            >
              <span>Continuar {!isValid ? '(Deshabilitado)' : ''}</span>
            </CTAButton>
            
            {/* Debug info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p><strong>Formulario:</strong></p>
                  <p className={isValid ? 'text-green-400' : 'text-red-400'}>
                    {isValid ? '✅ Válido' : '❌ Inválido'}
                  </p>
                </div>
                <div>
                  <p><strong>Errores:</strong></p>
                  <p className={Object.keys(errors).length === 0 ? 'text-green-400' : 'text-red-400'}>
                    {Object.keys(errors).length === 0 ? '✅ Sin errores' : `❌ ${Object.keys(errors).length} errores`}
                  </p>
                </div>
              </div>
              {Object.keys(errors).length > 0 && (
                <div className="mt-2">
                  <p><strong>Errores específicos:</strong></p>
                  {Object.entries(errors).map(([field, error]) => (
                    <p key={field} className="text-red-400">
                      {field}: {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  )
}
