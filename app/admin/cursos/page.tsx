'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientText } from '@/components/ui/GradientText'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BookOpen,
  Users,
  X,
  Save,
  Image as ImageIcon
} from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  summary: string
  description: string | null
  imageUrl: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  modulesCount?: number
  lessonsCount: number
  enrollmentsCount: number
}

interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<CoursesResponse['pagination'] | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    imageUrl: '',
    isPublished: false,
    modules: [
      {
        title: '',
        summary: '',
        lessons: [
          {
            title: '',
            summary: '',
            contentMdx: '',
            duration: null as number | null,
            isPublished: true,
          },
        ],
      },
    ],
  })

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      })
      
      if (search) {
        params.append('search', search)
      }
      
      if (publishedFilter) {
        params.append('published', publishedFilter)
      }

      const response = await fetch(`/api/admin/courses?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CoursesResponse = await response.json()
      
      setCourses(data?.courses || [])
      setPagination(data?.pagination || null)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, publishedFilter])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleCreateCourse = () => {
    setSelectedCourse(null)
    setFormData({
      title: '',
      slug: '',
      summary: '',
      description: '',
      imageUrl: '',
      isPublished: false,
      modules: [
        {
          title: '',
          summary: '',
          lessons: [
            {
              title: '',
              summary: '',
              contentMdx: '',
              duration: null,
              isPublished: true,
            },
          ],
        },
      ],
    })
    setShowForm(true)
  }

  const handleEditCourse = async (course: Course) => {
    setSelectedCourse(course)
    
    // Fetch full course data with modules and lessons
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`)
      if (response.ok) {
        const data = await response.json()
        const courseData = data.course
        
        setFormData({
          title: courseData.title,
          slug: courseData.slug,
          summary: courseData.summary,
          description: courseData.description || '',
          imageUrl: courseData.imageUrl || '',
          isPublished: courseData.isPublished,
          modules: courseData.modules && courseData.modules.length > 0
            ? courseData.modules.map((module: { title: string; summary: string | null; lessons: Array<{ title: string; summary: string | null; contentMDX: string | null; duration: number | null; isPublished: boolean }> }) => ({
                title: module.title,
                summary: module.summary || '',
                lessons: module.lessons.map((lesson: { title: string; summary: string | null; contentMDX: string | null; duration: number | null; isPublished: boolean }) => ({
                  title: lesson.title,
                  summary: lesson.summary || '',
                  contentMdx: lesson.contentMDX || '',
                  duration: lesson.duration || null,
                  isPublished: lesson.isPublished,
                })),
              }))
            : [
                {
                  title: '',
                  summary: '',
                  lessons: [
                    {
                      title: '',
                      summary: '',
                      contentMdx: '',
                      duration: null,
                      isPublished: true,
                    },
                  ],
                },
              ],
        })
      } else {
        // Fallback to basic data
        setFormData({
          title: course.title,
          slug: course.slug,
          summary: course.summary,
          description: course.description || '',
          imageUrl: course.imageUrl || '',
          isPublished: course.isPublished,
          modules: [
            {
              title: '',
              summary: '',
              lessons: [
                {
                  title: '',
                  summary: '',
                  contentMdx: '',
                  duration: null,
                  isPublished: true,
                },
              ],
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      // Fallback to basic data
      setFormData({
        title: course.title,
        slug: course.slug,
        summary: course.summary,
        description: course.description || '',
        imageUrl: course.imageUrl || '',
        isPublished: course.isPublished,
        modules: [
          {
            title: '',
            summary: '',
            lessons: [
              {
                title: '',
                summary: '',
                contentMdx: '',
                duration: null,
                isPublished: true,
              },
            ],
          },
        ],
      })
    }
    
    setShowForm(true)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSlugChange = (title: string) => {
    if (!selectedCourse) {
      // Only auto-generate slug when creating new course
      setFormData(prev => ({
        ...prev,
        title,
        slug: generateSlug(title)
      }))
    } else {
      setFormData(prev => ({ ...prev, title }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const url = selectedCourse 
        ? `/api/admin/courses/${selectedCourse.id}`
        : '/api/admin/courses'
      
      const method = selectedCourse ? 'PATCH' : 'POST'

      // Prepare data for API
      const apiData = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isPublished: formData.isPublished,
        modules: formData.modules,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        const errorMessage = errorData.error || errorData.message || 'Error al guardar el curso'
        console.error('API Error:', errorData)
        throw new Error(errorMessage)
      }

      // Refresh courses
      await fetchCourses()
      setShowForm(false)
      setSelectedCourse(null)
      setFormData({
        title: '',
        slug: '',
        summary: '',
        description: '',
        imageUrl: '',
        isPublished: false,
        modules: [
          {
            title: '',
            summary: '',
            lessons: [
              {
                title: '',
                summary: '',
                contentMdx: '',
                duration: null,
                isPublished: true,
              },
            ],
          },
        ],
      })
    } catch (error) {
      console.error('Error saving course:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar el curso. Por favor, intenta de nuevo.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este curso? Esta acción eliminará permanentemente el curso y todas sus lecciones e inscripciones.'
    )

    if (!confirmed) return

    setActionLoading(courseId)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el curso')
      }

      // Refresh courses
      await fetchCourses()
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar el curso. Por favor, intenta de nuevo.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePublish = async (course: Course) => {
    setActionLoading(course.id)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !course.isPublished
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el curso')
      }

      // Refresh courses
      await fetchCourses()
      if (selectedCourse?.id === course.id) {
        const updatedCourse = await fetch(`/api/admin/courses/${course.id}`).then(r => r.json())
        setSelectedCourse(updatedCourse.course)
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar el curso. Por favor, intenta de nuevo.')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !courses.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="h-4 bg-white/10 rounded w-48"></div>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <GradientText as="h1" className="text-4xl font-bold mb-2">
            Gestión de Cursos
          </GradientText>
          <p className="text-muted-foreground">
            Crea y gestiona los cursos de la academia
          </p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-lg hover:from-mauve-600 hover:to-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Curso
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por título, slug o resumen..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
              />
            </div>

            {/* Published Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="true">Publicados</option>
                <option value="false">No publicados</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      {pagination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {courses.length} de {pagination.total} cursos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm">
                  Página {currentPage} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard className="p-6 hover:scale-105 transition-transform duration-200">
                  <div className="space-y-4">
                    {/* Image */}
                    {course.imageUrl ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-mauve-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Title and Status */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                          {course.title}
                        </h3>
                        <button
                          onClick={() => handleTogglePublish(course)}
                          disabled={actionLoading === course.id}
                          className={cn(
                            "ml-2 p-1.5 rounded-lg transition-colors",
                            course.isPublished
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          )}
                          title={course.isPublished ? 'Ocultar' : 'Publicar'}
                        >
                          {course.isPublished ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.summary}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {course.modulesCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.modulesCount} módulos</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lessonsCount} lecciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollmentsCount} inscripciones</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-sm transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={actionLoading === course.id}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-400"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                        {actionLoading === course.id ? '...' : ''}
                      </button>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Actualizado: {formatDate(course.updatedAt)}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron cursos</p>
          </GlassCard>
        )}
      </motion.div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <GradientText as="h2" className="text-2xl">
                  {selectedCourse ? 'Editar Curso' : 'Nuevo Curso'}
                </GradientText>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedCourse(null)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                    placeholder="Ej: Fundamentos de Mindfulness"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent font-mono text-sm"
                    placeholder="fundamentos-mindfulness"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL amigable (se genera automáticamente desde el título)
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resumen *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent resize-none"
                    placeholder="Breve descripción del curso..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent resize-none"
                    placeholder="Descripción detallada del curso..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/5 border border-white/10 text-mauve-500 focus:ring-2 focus:ring-mauve-500 cursor-pointer"
                  />
                  <label htmlFor="isPublished" className="text-sm cursor-pointer">
                    Publicar curso
                  </label>
                </div>

                {/* Modules and Lessons */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Módulos y Lecciones</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          modules: [
                            ...prev.modules,
                            {
                              title: '',
                              summary: '',
                              lessons: [
                                {
                                  title: '',
                                  summary: '',
                                  contentMdx: '',
                                  duration: null,
                                  isPublished: true,
                                },
                              ],
                            },
                          ],
                        }))
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Módulo
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {formData.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Módulo {moduleIndex + 1}</h4>
                          {formData.modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  modules: prev.modules.filter((_, idx) => idx !== moduleIndex),
                                }))
                              }}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Título del Módulo
                            </label>
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  modules: prev.modules.map((m, idx) =>
                                    idx === moduleIndex ? { ...m, title: e.target.value } : m
                                  ),
                                }))
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent text-sm"
                              placeholder="Ej: Introducción"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Resumen del Módulo
                            </label>
                            <input
                              type="text"
                              value={module.summary}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  modules: prev.modules.map((m, idx) =>
                                    idx === moduleIndex ? { ...m, summary: e.target.value } : m
                                  ),
                                }))
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent text-sm"
                              placeholder="Breve descripción del módulo"
                            />
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Lecciones</h5>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  modules: prev.modules.map((m, idx) =>
                                    idx === moduleIndex
                                      ? {
                                          ...m,
                                          lessons: [
                                            ...m.lessons,
                                            {
                                              title: '',
                                              summary: '',
                                              contentMdx: '',
                                              duration: null,
                                              isPublished: true,
                                            },
                                          ],
                                        }
                                      : m
                                  ),
                                }))
                              }}
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Agregar Lección
                            </button>
                          </div>

                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground">
                                  Lección {lessonIndex + 1}
                                </span>
                                {module.lessons.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        modules: prev.modules.map((m, idx) =>
                                          idx === moduleIndex
                                            ? {
                                                ...m,
                                                lessons: m.lessons.filter((_, lidx) => lidx !== lessonIndex),
                                              }
                                            : m
                                        ),
                                      }))
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      modules: prev.modules.map((m, idx) =>
                                        idx === moduleIndex
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, lidx) =>
                                                lidx === lessonIndex ? { ...l, title: e.target.value } : l
                                              ),
                                            }
                                          : m
                                      ),
                                    }))
                                  }}
                                  className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent text-sm"
                                  placeholder="Título de la lección"
                                />

                                <input
                                  type="text"
                                  value={lesson.summary}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      modules: prev.modules.map((m, idx) =>
                                        idx === moduleIndex
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, lidx) =>
                                                lidx === lessonIndex ? { ...l, summary: e.target.value } : l
                                              ),
                                            }
                                          : m
                                      ),
                                    }))
                                  }}
                                  className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent text-sm"
                                  placeholder="Resumen de la lección"
                                />

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={lesson.duration || ''}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        modules: prev.modules.map((m, idx) =>
                                          idx === moduleIndex
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l, lidx) =>
                                                  lidx === lessonIndex
                                                    ? { ...l, duration: e.target.value ? parseInt(e.target.value) : null }
                                                    : l
                                                ),
                                              }
                                            : m
                                        ),
                                      }))
                                    }}
                                    className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent text-sm"
                                    placeholder="Min"
                                  />
                                  <span className="text-xs text-muted-foreground">minutos</span>
                                </div>

                                <textarea
                                  rows={6}
                                  value={lesson.contentMdx}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      modules: prev.modules.map((m, idx) =>
                                        idx === moduleIndex
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, lidx) =>
                                                lidx === lessonIndex ? { ...l, contentMdx: e.target.value } : l
                                              ),
                                            }
                                          : m
                                      ),
                                    }))
                                  }}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent font-mono text-xs resize-none"
                                  placeholder={`# Contenido de la Lección

Escribe el contenido en formato Markdown (MDX).

## Ejemplo

Puedes incluir:
- Listas
- **Texto en negrita**
- *Texto en cursiva*
- [Enlaces](https://example.com)
- Bloques de código

\`\`\`javascript
const ejemplo = 'Hola!';
\`\`\``}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Usa formato Markdown (MDX) para el contenido
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>Resumen del Curso:</strong> {formData.modules.length} módulo(s),{' '}
                      {formData.modules.reduce((total, module) => total + module.lessons.length, 0)} lección(es)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedCourse(null)
                    }}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-lg hover:from-mauve-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {formLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  )
}
