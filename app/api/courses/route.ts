import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/courses
 * Get all published courses (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Build where clause - only published courses
    const where: Prisma.courseWhereInput = {
      isPublished: true,
    }

    // Search filter
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get published courses with modules and lessons
    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: {
          include: {
            lessons: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
                duration: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format courses data
    const formattedCourses = courses.map((course) => {
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

      return {
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
      }
    })

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
    })
  } catch (error) {
    console.error('Error fetching published courses:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
