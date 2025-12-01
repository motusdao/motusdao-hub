import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/matching/user/[userId]
 * Gets the current active match for a user, plus match history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userMatches: {
          include: {
            psm: {
              include: {
                profile: true,
                psm: true
              }
            }
          },
          orderBy: {
            matchedAt: 'desc'
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

    // Separate active and history
    const activeMatch = user.userMatches.find(m => m.status === 'active')
    const matchHistory = user.userMatches.filter(m => m.status !== 'active')

    return NextResponse.json({
      activeMatch: activeMatch ? {
        id: activeMatch.id,
        psmId: activeMatch.psmId,
        status: activeMatch.status,
        matchedAt: activeMatch.matchedAt,
        psm: {
          id: activeMatch.psm.id,
          email: activeMatch.psm.email,
          nombre: activeMatch.psm.profile?.nombre,
          apellido: activeMatch.psm.profile?.apellido,
          telefono: activeMatch.psm.profile?.telefono,
          ciudad: activeMatch.psm.profile?.ciudad,
          pais: activeMatch.psm.profile?.pais,
          avatarUrl: activeMatch.psm.profile?.avatarUrl,
          biografia: activeMatch.psm.psm?.biografia,
          especialidades: activeMatch.psm.psm?.especialidades,
          experienciaAnios: activeMatch.psm.psm?.experienciaAnios,
          smartWalletAddress: activeMatch.psm.smartWalletAddress,
          eoaAddress: activeMatch.psm.eoaAddress
        }
      } : null,
      matchHistory: matchHistory.map(m => ({
        id: m.id,
        psmId: m.psmId,
        status: m.status,
        matchedAt: m.matchedAt,
        endedAt: m.endedAt,
        reason: m.reason,
        psm: {
          id: m.psm.id,
          nombre: m.psm.profile?.nombre,
          apellido: m.psm.profile?.apellido
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching user matches:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

