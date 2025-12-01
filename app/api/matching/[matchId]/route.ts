import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PUT /api/matching/[matchId]
 * Updates match status (pause, end)
 * 
 * Body: { status: 'paused' | 'ended', reason?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params
    const body = await request.json()
    const { status, reason } = body

    if (!status || !['paused', 'ended'].includes(status)) {
      return NextResponse.json(
        { error: 'status debe ser "paused" o "ended"' },
        { status: 400 }
      )
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Emparejamiento no encontrado' },
        { status: 404 }
      )
    }

    const updateData: {
      status: 'paused' | 'ended'
      endedAt?: Date
      reason?: string
    } = {
      status: status as 'paused' | 'ended'
    }

    if (status === 'ended') {
      updateData.endedAt = new Date()
      if (reason) {
        updateData.reason = reason
      }
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        user: {
          include: {
            profile: true
          }
        },
        psm: {
          include: {
            profile: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Emparejamiento ${status === 'paused' ? 'pausado' : 'finalizado'} exitosamente`,
      match: {
        id: updatedMatch.id,
        userId: updatedMatch.userId,
        psmId: updatedMatch.psmId,
        status: updatedMatch.status,
        matchedAt: updatedMatch.matchedAt,
        endedAt: updatedMatch.endedAt,
        reason: updatedMatch.reason
      }
    })

  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

