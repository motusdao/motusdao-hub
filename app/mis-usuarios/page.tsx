'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  Users, 
  Search, 
  MessageCircle, 
  Calendar,
  Clock,
  Star,
  MoreVertical,
  Plus,
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Mock user data
const users = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    lastSession: '2024-01-15',
    nextSession: '2024-01-18',
    status: 'active',
    progress: 75,
    notes: 'Progreso excelente en manejo de ansiedad',
    avatar: 'AG'
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    lastSession: '2024-01-14',
    nextSession: '2024-01-20',
    status: 'active',
    progress: 60,
    notes: 'Necesita más trabajo en técnicas de relajación',
    avatar: 'CL'
  },
  {
    id: '3',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    lastSession: '2024-01-10',
    nextSession: '2024-01-22',
    status: 'pending',
    progress: 40,
    notes: 'Primera sesión completada, evaluación inicial',
    avatar: 'MR'
  }
]

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  inactive: 'bg-gray-500/20 text-gray-400'
}

export default function MisUsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesFilter
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
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Mis Usuarios
                </GradientText>
                <p className="text-muted-foreground">Gestiona tus pacientes y su progreso</p>
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">12</h3>
              <p className="text-muted-foreground">Usuarios Activos</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">8</h3>
              <p className="text-muted-foreground">Sesiones Hoy</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">3</h3>
              <p className="text-muted-foreground">Pendientes</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">4.8</h3>
              <p className="text-muted-foreground">Calificación</p>
            </GlassCard>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                  
                  <CTAButton size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </CTAButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {filteredUsers.map((user) => (
              <GlassCard key={user.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-mauve rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{user.avatar}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[user.status as keyof typeof statusColors]}`}>
                          {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Progreso: {user.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Última sesión</p>
                      <p className="font-medium">{new Date(user.lastSession).toLocaleDateString('es-ES')}</p>
                      <p className="text-sm text-muted-foreground">Próxima: {new Date(user.nextSession).toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <CTAButton variant="secondary" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </CTAButton>
                      <CTAButton variant="secondary" size="sm">
                        <Eye className="w-4 h-4" />
                      </CTAButton>
                      <CTAButton variant="secondary" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </CTAButton>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso del tratamiento</span>
                    <span className="text-sm text-muted-foreground">{user.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-mauve h-2 rounded-full transition-all duration-300"
                      style={{ width: `${user.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 p-3 glass-card rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notas:</strong> {user.notes}
                  </p>
                </div>
              </GlassCard>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center py-12"
            >
              <GlassCard className="p-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground mb-6">
                  No hay usuarios que coincidan con tu búsqueda o filtros.
                </p>
                <CTAButton>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Nuevo Usuario
                </CTAButton>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </Section>
    </div>
  )
}
