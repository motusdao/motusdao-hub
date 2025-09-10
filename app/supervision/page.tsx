'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  Eye, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  FileText,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Mock supervision cases
const supervisionCases = [
  {
    id: '1',
    title: 'Caso de Ansiedad Generalizada',
    patient: 'Ana García',
    therapist: 'Dr. María González',
    status: 'active',
    priority: 'high',
    lastUpdate: '2024-01-15',
    nextReview: '2024-01-18',
    progress: 70,
    notes: 'Paciente muestra mejoría significativa en técnicas de relajación. Continuar con terapia cognitivo-conductual.',
    tags: ['ansiedad', 'TCC', 'relajación']
  },
  {
    id: '2',
    title: 'Terapia de Pareja - Crisis Matrimonial',
    patient: 'Carlos y María López',
    therapist: 'Lic. Carlos Rodríguez',
    status: 'pending',
    priority: 'medium',
    lastUpdate: '2024-01-14',
    nextReview: '2024-01-20',
    progress: 45,
    notes: 'Pareja en proceso de comunicación. Necesita más trabajo en resolución de conflictos.',
    tags: ['pareja', 'comunicación', 'conflictos']
  },
  {
    id: '3',
    title: 'Tratamiento de Depresión',
    patient: 'Roberto Silva',
    therapist: 'Dra. Ana Martínez',
    status: 'completed',
    priority: 'low',
    lastUpdate: '2024-01-10',
    nextReview: '2024-01-25',
    progress: 100,
    notes: 'Tratamiento completado exitosamente. Paciente en remisión. Seguimiento mensual programado.',
    tags: ['depresión', 'completado', 'seguimiento']
  }
]

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-400'
}

const priorityColors = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400'
}

export default function SupervisionPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const filteredCases = supervisionCases.filter(case_ => {
    const matchesStatus = filterStatus === 'all' || case_.status === filterStatus
    const matchesPriority = filterPriority === 'all' || case_.priority === filterPriority
    return matchesStatus && matchesPriority
  })

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
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Supervisión
                </GradientText>
                <p className="text-muted-foreground">Revisa y supervisa casos de terapia</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">8</h3>
              <p className="text-muted-foreground">Casos Activos</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">3</h3>
              <p className="text-muted-foreground">Pendientes</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">12</h3>
              <p className="text-muted-foreground">Completados</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">85%</h3>
              <p className="text-muted-foreground">Tasa de Éxito</p>
            </GlassCard>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                    <option value="completed">Completados</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                
                <CTAButton size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Caso
                </CTAButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Cases List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {filteredCases.map((case_, index) => (
              <GlassCard key={case_.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{case_.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[case_.status as keyof typeof statusColors]}`}>
                        {case_.status === 'active' ? 'Activo' : case_.status === 'pending' ? 'Pendiente' : 'Completado'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
                        Prioridad {case_.priority === 'high' ? 'Alta' : case_.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Paciente:</strong> {case_.patient}</p>
                        <p><strong>Terapeuta:</strong> {case_.therapist}</p>
                      </div>
                      <div>
                        <p><strong>Última actualización:</strong> {new Date(case_.lastUpdate).toLocaleDateString('es-ES')}</p>
                        <p><strong>Próxima revisión:</strong> {new Date(case_.nextReview).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <CTAButton variant="secondary" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </CTAButton>
                    <CTAButton variant="secondary" size="sm">
                      <FileText className="w-4 h-4" />
                    </CTAButton>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso del caso</span>
                    <span className="text-sm text-muted-foreground">{case_.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-mauve h-2 rounded-full transition-all duration-300"
                      style={{ width: `${case_.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4 p-3 glass-card rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notas de supervisión:</strong> {case_.notes}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {case_.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-mauve-500/20 text-mauve-400 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredCases.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center py-12"
            >
              <GlassCard className="p-12">
                <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay casos de supervisión</h3>
                <p className="text-muted-foreground mb-6">
                  No se encontraron casos que coincidan con los filtros seleccionados.
                </p>
                <CTAButton>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Nuevo Caso
                </CTAButton>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </Section>
    </div>
  )
}
