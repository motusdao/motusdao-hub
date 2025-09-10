'use client'

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
  Star,
  CheckCircle,
  Lock,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Mock course data
const courseData = {
  'fundamentos-mindfulness': {
    id: '1',
    title: 'Fundamentos de Mindfulness',
    slug: 'fundamentos-mindfulness',
    summary: 'Aprende las bases de la atención plena y cómo aplicarla en tu vida diaria',
    description: 'Un curso completo que te guiará a través de los principios fundamentales del mindfulness, incluyendo técnicas de respiración, meditación y aplicación práctica en situaciones cotidianas.',
    imageUrl: '/api/placeholder/800/400',
    duration: 120,
    totalLessons: 8,
    rating: 4.8,
    students: 1250,
    isPublished: true,
    category: 'Bienestar',
    instructor: 'Dr. María González',
    instructorBio: 'Psicóloga clínica especializada en mindfulness y terapia cognitivo-conductual con más de 10 años de experiencia.',
    lessons: [
      {
        id: '1',
        title: 'Introducción al Mindfulness',
        duration: 15,
        isCompleted: true,
        isLocked: false,
        content: 'Conceptos básicos y beneficios del mindfulness'
      },
      {
        id: '2',
        title: 'Técnicas de Respiración',
        duration: 20,
        isCompleted: true,
        isLocked: false,
        content: 'Ejercicios de respiración para la atención plena'
      },
      {
        id: '3',
        title: 'Meditación Guiada',
        duration: 25,
        isCompleted: false,
        isLocked: false,
        content: 'Sesiones de meditación paso a paso'
      },
      {
        id: '4',
        title: 'Mindfulness en el Trabajo',
        duration: 18,
        isCompleted: false,
        isLocked: false,
        content: 'Aplicación del mindfulness en el entorno laboral'
      },
      {
        id: '5',
        title: 'Manejo de Emociones',
        duration: 22,
        isCompleted: false,
        isLocked: true,
        content: 'Técnicas para reconocer y manejar emociones'
      },
      {
        id: '6',
        title: 'Mindfulness en Relaciones',
        duration: 20,
        isCompleted: false,
        isLocked: true,
        content: 'Aplicación del mindfulness en las relaciones interpersonales'
      }
    ]
  }
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [activeLesson, setActiveLesson] = useState('1')
  const course = courseData[params.courseId as keyof typeof courseData]

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Curso no encontrado</h1>
          <Link href="/academia">
            <CTAButton>Volver a la Academia</CTAButton>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const completedLessons = course.lessons.filter(lesson => lesson.isCompleted).length
  const progress = (completedLessons / course.lessons.length) * 100

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
                  <div className="h-64 bg-gradient-to-br from-mauve-500/20 to-iris-500/20 rounded-lg flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-xl flex items-center justify-center">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-mauve-500/20 text-mauve-400 text-sm font-medium rounded-full mb-4">
                      {course.category}
                    </div>
                    <GradientText as="h1" className="text-3xl md:text-4xl font-bold mb-4">
                      {course.title}
                    </GradientText>
                    <p className="text-lg text-muted-foreground mb-6">
                      {course.description}
                    </p>
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
                        <span className="font-semibold">{course.lessons.length} lecciones</span>
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
                        <Star className="w-5 h-5 text-yellow-500 mr-1" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Calificación</p>
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

              {/* Instructor Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-mauve rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{course.instructor}</h4>
                      <p className="text-muted-foreground">{course.instructorBio}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
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
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          activeLesson === lesson.id
                            ? 'bg-mauve-500/20 border border-mauve-500/30'
                            : lesson.isLocked
                            ? 'bg-white/5 opacity-60'
                            : 'hover:bg-white/10'
                        }`}
                        onClick={() => !lesson.isLocked && setActiveLesson(lesson.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              {lesson.isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : lesson.isLocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Play className="w-4 h-4 text-mauve-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
