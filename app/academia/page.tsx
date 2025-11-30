'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  Play,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

// Mock course data
const courses = [
  {
    id: '5',
    title: 'IA para Psicólogos: Potencia tu práctica en psicología digital',
    slug: 'ia-para-psicologos',
    summary: 'La integración ética de la IA en psicología permite usarla como copiloto clínico, acceder a evidencia en segundos y crear materiales psicoeducativos con eficiencia.',
    description: 'Taller práctico de 45 minutos que te enseñará a optimizar tu práctica clínica con prompts útiles para psicoterapia, crear contenido psicoeducativo en minutos, verificar hipótesis clínicas de forma estructurada y buscar evidencia científica actualizada.',
    imageUrl: 'https://i.postimg.cc/tgGdtwSX/MotusAI.png',
    duration: 45,
    lessons: 6,
    rating: 4.9,
    students: 320,
    isPublished: true,
    category: 'Tecnología & Psicología'
  },
  {
    id: '1',
    title: 'Fundamentos de Mindfulness',
    slug: 'fundamentos-mindfulness',
    summary: 'Aprende las bases de la atención plena y cómo aplicarla en tu vida diaria',
    description: 'Un curso completo que te guiará a través de los principios fundamentales del mindfulness, incluyendo técnicas de respiración, meditación y aplicación práctica.',
    imageUrl: '/api/placeholder/400/200',
    duration: 120,
    lessons: 8,
    rating: 4.8,
    students: 1250,
    isPublished: false,
    category: 'Bienestar'
  },
  {
    id: '2',
    title: 'Manejo de Ansiedad y Estrés',
    slug: 'manejo-ansiedad-estres',
    summary: 'Técnicas efectivas para controlar la ansiedad y reducir el estrés',
    description: 'Descubre estrategias probadas para manejar la ansiedad y el estrés, incluyendo técnicas cognitivo-conductuales y herramientas de relajación.',
    imageUrl: '/api/placeholder/400/200',
    duration: 90,
    lessons: 6,
    rating: 4.9,
    students: 980,
    isPublished: false,
    category: 'Salud Mental'
  },
  {
    id: '3',
    title: 'Comunicación Asertiva',
    slug: 'comunicacion-asertiva',
    summary: 'Mejora tus habilidades de comunicación y relaciones interpersonales',
    description: 'Aprende a comunicarte de manera efectiva, expresar tus necesidades y establecer límites saludables en tus relaciones.',
    imageUrl: '/api/placeholder/400/200',
    duration: 75,
    lessons: 5,
    rating: 4.7,
    students: 750,
    isPublished: false,
    category: 'Habilidades Sociales'
  },
  {
    id: '4',
    title: 'Psicología Positiva',
    slug: 'psicologia-positiva',
    summary: 'Cultiva el bienestar y la felicidad a través de la psicología positiva',
    description: 'Explora los principios de la psicología positiva y cómo aplicarlos para aumentar tu bienestar y satisfacción con la vida.',
    imageUrl: '/api/placeholder/400/200',
    duration: 100,
    lessons: 7,
    rating: 4.6,
    students: 650,
    isPublished: false,
    category: 'Desarrollo Personal'
  }
]

const categories = ['Todos', 'Bienestar', 'Salud Mental', 'Habilidades Sociales', 'Desarrollo Personal', 'Tecnología & Psicología']

export default function AcademiaPage() {
  // Separate available and upcoming courses
  const availableCourses = courses.filter(course => course.isPublished)
  const upcomingCourses = courses.filter(course => !course.isPublished)
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
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Academia MotusDAO
                </GradientText>
                <p className="text-muted-foreground">Aprende y crece en tu bienestar mental</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">1</h3>
              <p className="text-muted-foreground">Cursos Disponibles</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">4</h3>
              <p className="text-muted-foreground">Próximos cursos</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">4.8</h3>
              <p className="text-muted-foreground">Calificación Promedio</p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-mauve-500">95%</h3>
              <p className="text-muted-foreground">Tasa de Completación</p>
            </GlassCard>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <CTAButton
                  key={category}
                  variant={category === 'Todos' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {category}
                </CTAButton>
              ))}
            </div>
          </motion.div>

          {/* Available Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Cursos Disponibles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                >
                  <Link href={`/academia/${course.slug}`}>
                    <GlassCard hover className="h-full group cursor-pointer overflow-hidden">
                      {/* Course Image */}
                      <div className="h-48 bg-gradient-to-br from-mauve-500/20 to-iris-500/20 flex items-center justify-center relative overflow-hidden">
                        {course.slug === 'ia-para-psicologos' ? (
                          <Image 
                            src={course.imageUrl} 
                            alt={course.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-xl flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        {/* Category Badge */}
                        <div className="inline-block px-3 py-1 bg-mauve-500/20 text-mauve-400 text-xs font-medium rounded-full mb-3">
                          {course.category}
                        </div>

                        {/* Course Title */}
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-mauve-400 transition-colors">
                          {course.title}
                        </h3>

                        {/* Course Summary */}
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {course.summary}
                        </p>

                        {/* Course Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {course.duration} min
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {course.lessons} lecciones
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {course.rating}
                          </div>
                        </div>

                        {/* Students Count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {course.students.toLocaleString()} estudiantes
                          </div>
                          <CTAButton size="sm" className="group-hover:scale-105 transition-transform">
                            Ver Curso
                          </CTAButton>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Próximos Cursos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                >
                  <GlassCard className="h-full overflow-hidden opacity-75">
                    {/* Course Image */}
                    <div className="h-48 bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      {/* Coming Soon Badge */}
                      <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
                        Próximamente
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="inline-block px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full mb-3">
                        {course.category}
                      </div>

                      {/* Course Title */}
                      <h3 className="text-xl font-semibold mb-2 text-gray-300">
                        {course.title}
                      </h3>

                      {/* Course Summary */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.summary}
                      </p>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration} min
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {course.lessons} lecciones
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {course.rating}
                        </div>
                      </div>

                      {/* Students Count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-1" />
                          {course.students.toLocaleString()} estudiantes
                        </div>
                        <CTAButton size="sm" variant="secondary" disabled>
                          <Lock className="w-4 h-4 mr-1" />
                          Próximamente
                        </CTAButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
