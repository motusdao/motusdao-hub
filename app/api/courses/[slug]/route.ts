import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/courses/[slug]
 * Get a specific published course by slug (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get published course by slug with modules and lessons
    const course = await prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        modules: {
          include: {
            lessons: {
              where: {
                isPublished: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Calculate total lessons and duration
    const lessonsCount = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    )
    
    const duration = course.modules.reduce((total, module) => {
      return (
        total +
        module.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + (lesson.duration || 0),
          0
        )
      )
    }, 0)

    // Format course data
    const formattedCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      summary: course.summary,
      description: course.description,
      imageUrl: course.imageUrl,
      duration, // in minutes
      lessons: lessonsCount,
      students: course.enrollments.length,
      isPublished: course.isPublished,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        summary: module.summary,
        order: module.order,
        lessons: module.lessons.map((lesson) => ({
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
    }

    return NextResponse.json({
      success: true,
      course: formattedCourse,
    })
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
