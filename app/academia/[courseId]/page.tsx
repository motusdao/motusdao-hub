'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  ArrowLeft,
  Play,
  Clock,
  BookOpen,
  Users,
  Download
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Lesson {
  id: string
  title: string
  slug: string
  summary: string | null
  order: number
  duration: number | null
  isPublished: boolean
  contentMDX: string | null
}

interface Module {
  id: string
  title: string
  summary: string | null
  order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  summary: string
  description: string | null
  imageUrl: string | null
  duration: number
  lessons: number
  students: number
  isPublished: boolean
  modules: Module[]
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses/${params.courseId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Curso no encontrado')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        
        if (data.success && data.course) {
          setCourse(data.course)
          // Set first lesson as active if available
          const firstLesson = data.course.modules
            .flatMap((m: Module) => m.lessons)
            .sort((a: Lesson, b: Lesson) => a.order - b.order)[0]
          if (firstLesson) {
            setActiveLesson(firstLesson.id)
          }
        } else {
          setError('Curso no encontrado')
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar el curso')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">Cargando curso...</p>
        </GlassCard>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Curso no encontrado</h1>
          <p className="text-muted-foreground mb-4">{error || 'El curso que buscas no existe o no está disponible.'}</p>
          <Link href="/academia">
            <CTAButton>Volver a la Academia</CTAButton>
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Flatten all lessons from all modules
  const allLessons = course.modules
    .flatMap(module => module.lessons.map(lesson => ({ ...lesson, moduleTitle: module.title })))
    .sort((a, b) => a.order - b.order)

  const progress = 0 // TODO: Calculate based on user enrollment

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link href="/academia">
              <CTAButton variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la Academia
              </CTAButton>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <GlassCard className="p-8">
                  {/* Course Image */}
                  <div className="h-64 bg-gradient-to-br from-mauve-500/20 to-iris-500/20 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-xl flex items-center justify-center">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="mb-6">
                    <GradientText as="h1" className="text-3xl md:text-4xl font-bold mb-4">
                      {course.title}
                    </GradientText>
                    <p className="text-lg text-muted-foreground mb-4">
                      {course.summary}
                    </p>
                    {course.description && (
                      <p className="text-muted-foreground mb-6">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-mauve-500 mr-1" />
                        <span className="font-semibold">{course.duration} min</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Duración</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-mauve-500 mr-1" />
                        <span className="font-semibold">{course.lessons} lecciones</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Contenido</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-mauve-500 mr-1" />
                        <span className="font-semibold">{course.students.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Estudiantes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-mauve-500 mr-1" />
                        <span className="font-semibold">{course.modules.length}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Módulos</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progreso del curso</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-mauve h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <CTAButton size="lg" glow className="flex-1">
                      <Play className="w-5 h-5 mr-2" />
                      Continuar Curso
                    </CTAButton>
                    <CTAButton variant="secondary" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Descargar Materiales
                    </CTAButton>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Course Modules */}
              {course.modules.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Módulos del Curso</h3>
                    <div className="space-y-4">
                      {course.modules.map((module) => (
                        <div key={module.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                          <h4 className="font-semibold text-lg mb-2">{module.title}</h4>
                          {module.summary && (
                            <p className="text-sm text-muted-foreground mb-2">{module.summary}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {module.lessons.length} lección{module.lessons.length !== 1 ? 'es' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            {/* Lessons Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <GlassCard className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Lecciones del Curso</h3>
                  <div className="space-y-2">
                    {course.modules.map((module) => (
                      <div key={module.id} className="mb-4">
                        <h4 className="text-sm font-semibold text-mauve-400 mb-2">{module.title}</h4>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                activeLesson === lesson.id
                                  ? 'bg-mauve-500/20 border border-mauve-500/30'
                                  : 'hover:bg-white/10'
                              }`}
                              onClick={() => setActiveLesson(lesson.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                    {activeLesson === lesson.id ? (
                                      <Play className="w-4 h-4 text-mauve-500" />
                                    ) : (
                                      <Play className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{lesson.title}</p>
                                    {lesson.duration && (
                                      <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {allLessons.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay lecciones disponibles
                      </p>
                    )}
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
