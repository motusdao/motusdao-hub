import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// TEMPORAL: Autenticación deshabilitada para desarrollo
// TODO: Re-habilitar antes de producción

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Get all PSM users with related data
    const psms = await prisma.user.findMany({
      where: {
        role: 'psm'
      },
      include: {
        profile: true,
        psm: true,
        psmMatches: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        sessionsAsPSM: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        paymentsReceived: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform and filter PSMs
    let psmsData = psms.map(psm => {
      // Parse especialidades from JSON string
      let especialidades: string[] = []
      if (psm.psm?.especialidades) {
        try {
          especialidades = JSON.parse(psm.psm.especialidades) as string[]
        } catch {
          especialidades = []
        }
      }

      const activeMatches = psm.psmMatches.filter(m => m.status === 'active')
      const totalMatches = psm.psmMatches.length
      const completedSessions = psm.sessionsAsPSM.filter(s => s.status === 'completed').length
      const totalSessions = psm.sessionsAsPSM.length
      
      // Calculate total revenue
      const totalRevenue = psm.paymentsReceived.reduce((sum, payment) => {
        try {
          const amount = parseFloat(payment.amount) || 0
          return sum + amount
        } catch {
          return sum
        }
      }, 0)

      return {
        id: psm.id,
        email: psm.email,
        eoaAddress: psm.eoaAddress,
        smartWalletAddress: psm.smartWalletAddress,
        privyId: psm.privyId,
        nombre: psm.profile?.nombre || '',
        apellido: psm.profile?.apellido || '',
        telefono: psm.profile?.telefono || '',
        avatarUrl: psm.profile?.avatarUrl || null,
        ciudad: psm.profile?.ciudad || '',
        pais: psm.profile?.pais || '',
        bio: psm.psm?.biografia || psm.profile?.bio || '',
        cedulaProfesional: psm.psm?.cedulaProfesional || '',
        formacionAcademica: psm.psm?.formacionAcademica || '',
        experienciaAnios: psm.psm?.experienciaAnios || 0,
        especialidades: especialidades,
        participaSupervision: psm.psm?.participaSupervision || false,
        participaCursos: psm.psm?.participaCursos || false,
        participaInvestigacion: psm.psm?.participaInvestigacion || false,
        participaComunidad: psm.psm?.participaComunidad || false,
        registrationCompleted: psm.registrationCompleted,
        activeMatches: activeMatches.length,
        totalMatches: totalMatches,
        completedSessions,
        totalSessions,
        totalRevenue,
        capacity: {
          current: activeMatches.length,
          max: 10,
          available: 10 - activeMatches.length
        },
        createdAt: psm.createdAt,
        updatedAt: psm.updatedAt
      }
    })

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      psmsData = psmsData.filter(psm => 
        psm.nombre.toLowerCase().includes(searchLower) ||
        psm.apellido.toLowerCase().includes(searchLower) ||
        psm.email.toLowerCase().includes(searchLower) ||
        psm.cedulaProfesional.toLowerCase().includes(searchLower) ||
        psm.especialidades.some(esp => esp.toLowerCase().includes(searchLower))
      )
    }

    // Get total count for pagination
    const total = psmsData.length

    // Apply pagination
    const paginatedPsms = psmsData.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      psms: paginatedPsms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching PSMs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}







