import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/admin/courses/[courseId]
 * Get a specific course with lessons (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const lessonsCount = course.modules.reduce((total, module) => total + module.lessons.length, 0)

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        summary: course.summary,
        description: course.description,
        imageUrl: course.imageUrl,
        isPublished: course.isPublished,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        modules: course.modules.map(module => ({
          id: module.id,
          title: module.title,
          summary: module.summary,
          order: module.order,
          lessons: module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            summary: lesson.summary,
            order: lesson.order,
            duration: lesson.duration,
            isPublished: lesson.isPublished,
            contentMDX: lesson.contentMDX,
            createdAt: lesson.createdAt.toISOString(),
            updatedAt: lesson.updatedAt.toISOString(),
          })),
          createdAt: module.createdAt.toISOString(),
          updatedAt: module.updatedAt.toISOString(),
        })),
        enrollments: course.enrollments.map(enrollment => ({
          id: enrollment.id,
          userId: enrollment.userId,
          progress: enrollment.progress,
          completed: enrollment.completed,
          user: enrollment.user,
          createdAt: enrollment.createdAt.toISOString(),
        })),
        modulesCount: course._count.modules,
        lessonsCount,
        enrollmentsCount: course._count.enrollments,
      }
    })
  } catch (error) {
    console.error('Error fetching course:', error)
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
 * PATCH /api/admin/courses/[courseId]
 * Update a course (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params
    const body = await request.json()
    const { title, slug, summary, description, imageUrl, isPublished, modules } = body

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A course with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update course with modules and lessons in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the main course data
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          ...(title && { title }),
          ...(slug && { slug }),
          ...(summary && { summary }),
          ...(description !== undefined && { description: description || null }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
          ...(isPublished !== undefined && { isPublished }),
          updatedAt: new Date(),
        },
      })

      // If modules are provided, update them
      if (modules && Array.isArray(modules)) {
        // First delete existing lessons and modules
        const existingModules = await tx.module.findMany({
          where: { courseId },
          select: { id: true }
        })
        
        // Delete lessons first
        for (const existingModule of existingModules) {
          await tx.lesson.deleteMany({
            where: { moduleId: existingModule.id }
          })
        }
        
        // Then delete modules
        await tx.module.deleteMany({
          where: { courseId }
        })

        // Create new modules and lessons
        for (let i = 0; i < modules.length; i++) {
          const moduleData = modules[i]
          
          const moduleId = `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`
          
          const newModule = await tx.module.create({
            data: {
              id: moduleId,
              courseId,
              title: moduleData.title || `Module ${i + 1}`,
              summary: moduleData.summary || null,
              order: i,
              updatedAt: new Date(),
            },
          })

          // Create lessons for this module
          if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
            for (let j = 0; j < moduleData.lessons.length; j++) {
              const lessonData = moduleData.lessons[j]
              
              // Generate slug from title
              const lessonSlug = lessonData.title
                ? lessonData.title
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                : `lesson-${j + 1}`
              
              const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}_${j}`
              
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

      return updatedCourse
    })

    // Fetch the updated course with relations
    const courseWithRelations = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    })

    if (!courseWithRelations) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const lessonsCount = courseWithRelations.modules.reduce((total, module) => total + module.lessons.length, 0)

    return NextResponse.json({
      success: true,
      course: {
        id: courseWithRelations.id,
        title: courseWithRelations.title,
        slug: courseWithRelations.slug,
        summary: courseWithRelations.summary,
        description: courseWithRelations.description,
        imageUrl: courseWithRelations.imageUrl,
        isPublished: courseWithRelations.isPublished,
        createdAt: courseWithRelations.createdAt.toISOString(),
        updatedAt: courseWithRelations.updatedAt.toISOString(),
        modulesCount: courseWithRelations._count.modules,
        lessonsCount,
        enrollmentsCount: courseWithRelations._count.enrollments,
      }
    })
  } catch (error) {
    console.error('Error updating course:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A course with this slug already exists' },
          { status: 409 }
        )
      }
    }

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
 * DELETE /api/admin/courses/[courseId]
 * Delete a course (admin only)
 * Note: This will cascade delete lessons and enrollments
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Delete course (cascade will delete lessons and enrollments)
    await prisma.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
