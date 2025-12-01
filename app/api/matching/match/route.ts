import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/matching/match
 * Creates an automatic match between a user and a PSM
 * 
 * Body: { userId: string }
 * 
 * Matching algorithm:
 * - Finds available PSMs (less than 10 active matches)
 * - Scores PSMs based on problematica vs especialidades
 * - Creates match with best scoring PSM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Get user with profile and patient data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        patient: true,
        userMatches: {
          where: { status: 'active' },
          include: {
            psm: {
              include: {
                profile: true,
                psm: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.role !== 'usuario') {
      return NextResponse.json(
        { error: 'Solo los usuarios pueden ser emparejados automáticamente' },
        { status: 400 }
      )
    }

    if (!user.patient) {
      return NextResponse.json(
        { error: 'El usuario no tiene perfil de paciente completo' },
        { status: 400 }
      )
    }

    // Check if user already has an active match
    if (user.userMatches.length > 0) {
      return NextResponse.json(
        { 
          error: 'El usuario ya tiene un emparejamiento activo',
          match: user.userMatches[0]
        },
        { status: 400 }
      )
    }

    // Find all PSMs with their active matches
    const allPSMs = await prisma.user.findMany({
      where: {
        role: 'psm',
        registrationCompleted: true
      },
      include: {
        profile: true,
        psm: true,
        psmMatches: {
          where: { status: 'active' }
        }
      }
    })

    // Filter PSMs with less than 10 active matches (capacity check)
    const availablePSMs = allPSMs.filter(
      psm => psm.psmMatches.length < 10
    )

    if (availablePSMs.length === 0) {
      return NextResponse.json(
        { error: 'No hay profesionales disponibles en este momento' },
        { status: 404 }
      )
    }

    // Score PSMs based on matching criteria
    const userProblematica = user.patient.problematica.toLowerCase()
    const scoredPSMs = availablePSMs.map(psm => {
      let score = 0

      // Check especialidades match
      if (psm.psm && psm.psm.especialidades) {
        try {
          const especialidades = JSON.parse(psm.psm.especialidades) as string[]
          const especialidadesLower = especialidades.map(e => e.toLowerCase())
          
          // Exact match
          if (especialidadesLower.includes(userProblematica)) {
            score += 10
          }
          
          // Partial match (contains keyword)
          especialidadesLower.forEach(esp => {
            if (userProblematica.includes(esp) || esp.includes(userProblematica)) {
              score += 5
            }
          })
        } catch {
          // If JSON parsing fails, skip this scoring
        }
      }

      // Geographic proximity bonus (same city)
      if (user.profile && psm.profile) {
        if (user.profile.ciudad.toLowerCase() === psm.profile.ciudad.toLowerCase()) {
          score += 3
        }
        if (user.profile.pais.toLowerCase() === psm.profile.pais.toLowerCase()) {
          score += 2
        }
      }

      // Experience bonus (more years = slightly better)
      if (psm.psm) {
        score += Math.min(psm.psm.experienciaAnios / 10, 2) // Max 2 points
      }

      // Capacity bonus (more available slots = slightly better for load balancing)
      const activeMatches = psm.psmMatches.length
      score += (10 - activeMatches) * 0.1 // Max 1 point

      return { psm, score }
    })

    // Sort by score (highest first)
    scoredPSMs.sort((a, b) => b.score - a.score)

    // Create match with top scoring PSM
    const topPSM = scoredPSMs[0].psm

    const match = await prisma.match.create({
      data: {
        userId: user.id,
        psmId: topPSM.id,
        status: 'active',
        matchedAt: new Date()
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        psm: {
          include: {
            profile: true,
            psm: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Emparejamiento creado exitosamente',
      match: {
        id: match.id,
        userId: match.userId,
        psmId: match.psmId,
        status: match.status,
        matchedAt: match.matchedAt,
        user: {
          id: match.user.id,
          email: match.user.email,
          nombre: match.user.profile?.nombre,
          apellido: match.user.profile?.apellido
        },
        psm: {
          id: match.psm.id,
          email: match.psm.email,
          nombre: match.psm.profile?.nombre,
          apellido: match.psm.profile?.apellido,
          especialidades: match.psm.psm?.especialidades,
          smartWalletAddress: match.psm.smartWalletAddress
        },
        score: scoredPSMs[0].score
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

