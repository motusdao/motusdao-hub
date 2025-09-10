'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface JournalEntry {
  id: string
  content: string
  mood: string
  tags: string[]
  createdAt: Date
}

const moodIcons = {
  happy: Smile,
  sad: Frown,
  anxious: TrendingUp,
  calm: Heart,
  neutral: Meh
}

const moodColors = {
  happy: 'text-yellow-500',
  sad: 'text-blue-500',
  anxious: 'text-red-500',
  calm: 'text-green-500',
  neutral: 'text-gray-500'
}

// Mock journal entries
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    content: 'Hoy me sentí muy motivado después de la sesión de meditación. Logré concentrarme mejor en el trabajo y me siento más tranquilo.',
    mood: 'happy',
    tags: ['meditación', 'trabajo', 'motivación'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    content: 'Tuve una conversación difícil con mi familia. Me siento un poco abrumado pero sé que es importante comunicar mis sentimientos.',
    mood: 'anxious',
    tags: ['familia', 'comunicación', 'emociones'],
    createdAt: new Date('2024-01-14')
  },
  {
    id: '3',
    content: 'Día tranquilo en casa. Disfruté leyendo un libro y cocinando. Me siento en paz conmigo mismo.',
    mood: 'calm',
    tags: ['lectura', 'cocina', 'paz'],
    createdAt: new Date('2024-01-13')
  }
]

export default function BitacoraPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [formData, setFormData] = useState({
    content: '',
    mood: 'neutral',
    tags: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingEntry) {
      // Update existing entry
      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              content: formData.content,
              mood: formData.mood,
              tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            }
          : entry
      ))
      setEditingEntry(null)
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content: formData.content,
        mood: formData.mood,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date()
      }
      setEntries(prev => [newEntry, ...prev])
    }

    setFormData({ content: '', mood: 'neutral', tags: '' })
    setShowForm(false)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', ')
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const getMoodStats = () => {
    const stats = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  const moodStats = getMoodStats()

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
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Mi Bitácora
                </GradientText>
                <p className="text-muted-foreground">Reflexiona sobre tu día y tus emociones</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Add Entry Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <CTAButton
                  onClick={() => setShowForm(true)}
                  size="lg"
                  glow
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Entrada
                </CTAButton>
              </motion.div>

              {/* Journal Form */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {editingEntry ? 'Editar Entrada' : 'Nueva Entrada'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          ¿Cómo te sientes hoy?
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Escribe sobre tu día, tus pensamientos, emociones..."
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent resize-none"
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Estado de ánimo
                        </label>
                        <div className="flex space-x-4">
                          {Object.entries(moodIcons).map(([mood, Icon]) => (
                            <button
                              key={mood}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, mood }))}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                                formData.mood === mood
                                  ? 'border-mauve-500 bg-mauve-500/20'
                                  : 'border-white/10 hover:border-white/20'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${moodColors[mood as keyof typeof moodColors]}`} />
                              <span className="capitalize">{mood}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Etiquetas (separadas por comas)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="trabajo, familia, ejercicio..."
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <CTAButton type="submit" size="lg">
                          {editingEntry ? 'Actualizar' : 'Guardar'} Entrada
                        </CTAButton>
                        <CTAButton
                          type="button"
                          variant="secondary"
                          size="lg"
                          onClick={() => {
                            setShowForm(false)
                            setEditingEntry(null)
                            setFormData({ content: '', mood: 'neutral', tags: '' })
                          }}
                        >
                          Cancelar
                        </CTAButton>
                      </div>
                    </form>
                  </GlassCard>
                </motion.div>
              )}

              {/* Journal Entries */}
              <div className="space-y-6">
                {entries.map((entry, index) => {
                  const MoodIcon = moodIcons[entry.mood as keyof typeof moodIcons]
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    >
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              entry.mood === 'happy' ? 'bg-yellow-500/20' :
                              entry.mood === 'sad' ? 'bg-blue-500/20' :
                              entry.mood === 'anxious' ? 'bg-red-500/20' :
                              entry.mood === 'calm' ? 'bg-green-500/20' :
                              'bg-gray-500/20'
                            }`}>
                              <MoodIcon className={`w-5 h-5 ${moodColors[entry.mood as keyof typeof moodColors]}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold capitalize">{entry.mood}</h3>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {entry.createdAt.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-foreground mb-4 leading-relaxed">
                          {entry.content}
                        </p>

                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-mauve-500/20 text-mauve-400 text-sm rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
              >
                {/* Mood Stats */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-mauve-500" />
                    Estadísticas de Humor
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(moodStats).map(([mood, count]) => {
                      const MoodIcon = moodIcons[mood as keyof typeof moodIcons]
                      const percentage = (count / entries.length) * 100
                      return (
                        <div key={mood} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MoodIcon className={`w-4 h-4 ${moodColors[mood as keyof typeof moodColors]}`} />
                            <span className="text-sm capitalize">{mood}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-mauve transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>

                {/* Quick Stats */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Resumen</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de entradas</span>
                      <span className="font-semibold">{entries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Este mes</span>
                      <span className="font-semibold">
                        {entries.filter(entry => {
                          const now = new Date()
                          const entryDate = new Date(entry.createdAt)
                          return entryDate.getMonth() === now.getMonth() && 
                                 entryDate.getFullYear() === now.getFullYear()
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio por semana</span>
                      <span className="font-semibold">
                        {Math.round(entries.length / 4)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
