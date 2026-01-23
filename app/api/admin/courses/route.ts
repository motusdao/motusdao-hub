import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/admin/courses
 * Get all courses with pagination and filtering (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TEMPORAL: Autenticación deshabilitada para desarrollo
    // TODO: Re-habilitar antes de producción
    // const adminUser = await checkAdminAccess(request)
    // if (!adminUser) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const published = searchParams.get('published')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.courseWhereInput = {}
    
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true'
    }

    // Search filter
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get courses with modules and lessons count
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.course.count({ where })
    ])

    // Format courses data and get counts
    const formattedCourses = await Promise.all(
      courses.map(async (course) => {
        // Calculate total lessons across all modules
        const lessonsCount = course.modules.reduce((total, module) => total + module.lessons.length, 0)
        
        // Get counts separately
        const [modulesCount, enrollmentsCount] = await Promise.all([
          prisma.module.count({ where: { courseId: course.id } }),
          prisma.enrollment.count({ where: { courseId: course.id } })
        ])
        
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          summary: course.summary,
          description: course.description,
          imageUrl: course.imageUrl,
          isPublished: course.isPublished,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
          modulesCount,
          lessonsCount,
          enrollmentsCount,
        }
      })
    )

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/courses
 * Create a new course (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TEMPORAL: Autenticación deshabilitada para desarrollo
    // TODO: Re-habilitar antes de producción
    // const adminUser = await checkAdminAccess(request)
    // if (!adminUser) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    console.log('Received course data:', {
      title: body.title,
      slug: body.slug,
      hasModules: !!body.modules,
      modulesCount: body.modules?.length || 0,
    })
    
    const { title, slug, summary, description, imageUrl, isPublished, modules } = body

    // Validate required fields
    if (!title || !slug || !summary) {
      return NextResponse.json(
        { error: 'Title, slug, and summary are required' },
        { status: 400 }
      )
    }

    // Generate ID from slug
    const id = `course_${slug.replace(/[^a-z0-9]/g, '_')}`

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 409 }
      )
    }

    // Create course with modules and lessons in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // Create the course
      const newCourse = await tx.course.create({
        data: {
          id,
          title,
          slug,
          summary,
          description: description || null,
          imageUrl: imageUrl || null,
          isPublished: isPublished || false,
          updatedAt: new Date(),
        },
      })

      // Create modules and lessons if provided
      // Filter out empty modules (no title and no lessons)
      const validModules = modules && Array.isArray(modules) 
        ? modules.filter(m => m.title || (m.lessons && Array.isArray(m.lessons) && m.lessons.length > 0))
        : []
      
      if (validModules.length > 0) {
        const baseTimestamp = Date.now()
        for (let i = 0; i < validModules.length; i++) {
          const moduleData = validModules[i]
          
          // Use a more unique ID generation to avoid collisions
          const moduleId = `mod_${baseTimestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`
          
          const newModule = await tx.module.create({
            data: {
              id: moduleId,
              courseId: newCourse.id,
              title: moduleData.title || `Module ${i + 1}`,
              summary: moduleData.summary || null,
              order: i,
              updatedAt: new Date(),
            },
          })

          // Create lessons for this module
          // Filter out empty lessons
          const validLessons = moduleData.lessons && Array.isArray(moduleData.lessons)
            ? moduleData.lessons.filter((l: { title?: string; contentMdx?: string; contentMDX?: string }) => l.title || l.contentMdx || l.contentMDX)
            : []
          
          if (validLessons.length > 0) {
            for (let j = 0; j < validLessons.length; j++) {
              const lessonData = validLessons[j]
              
              // Generate slug from title
              const lessonSlug = lessonData.title
                ? lessonData.title
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                : `lesson-${j + 1}`
              
              const lessonId = `lesson_${baseTimestamp}_${i}_${j}_${Math.random().toString(36).substr(2, 9)}`
              
              await tx.lesson.create({
                data: {
                  id: lessonId,
                  moduleId: newModule.id,
                  title: lessonData.title || `Lesson ${j + 1}`,
                  slug: lessonSlug,
                  summary: lessonData.summary || null,
                  contentMDX: lessonData.contentMdx || lessonData.contentMDX || null,
                  order: j,
                  duration: lessonData.duration || null,
                  isPublished: lessonData.isPublished !== undefined ? lessonData.isPublished : true,
                  updatedAt: new Date(),
                },
              })
            }
          }
        }
      }

      return newCourse
    })

    // Fetch the created course with relations
    const createdCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!createdCourse) {
      return NextResponse.json(
        { error: 'Failed to fetch created course' },
        { status: 500 }
      )
    }

    // Get counts separately to avoid Prisma client cache issues
    const [modulesCount, enrollmentsCount] = await Promise.all([
      prisma.module.count({ where: { courseId: course.id } }),
      prisma.enrollment.count({ where: { courseId: course.id } })
    ])

    const lessonsCount = createdCourse.modules.reduce((total, module) => total + module.lessons.length, 0)

    return NextResponse.json({
      success: true,
      course: {
        id: createdCourse.id,
        title: createdCourse.title,
        slug: createdCourse.slug,
        summary: createdCourse.summary,
        description: createdCourse.description,
        imageUrl: createdCourse.imageUrl,
        isPublished: createdCourse.isPublished,
        createdAt: createdCourse.createdAt.toISOString(),
        updatedAt: createdCourse.updatedAt.toISOString(),
        modulesCount,
        lessonsCount,
        enrollmentsCount,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
      meta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined,
    })
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A course with this slug already exists' },
          { status: 409 }
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Foreign key constraint failed. Please check that all related data is valid.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined,
        })
      },
      { status: 500 }
    )
  }
}
