import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to check admin access
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkAdminAccess(_request: NextRequest) {
  const { searchParams } = new URL(_request.url)
  const privyId = searchParams.get('privyId') || _request.headers.get('x-privy-id')
  
  if (!privyId) return null

  const user = await prisma.user.findUnique({
    where: { privyId },
    select: { role: true }
  })

  return user?.role === 'admin' ? user : null
}

/**
 * DELETE /api/admin/psm/[psmId]
 * Deletes a PSM user and all related data (admin only, for cleaning test data)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ psmId: string }> }
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

    const { psmId } = await params

    const psm = await prisma.user.findUnique({
      where: { id: psmId },
      include: {
        psmMatches: {
          select: { id: true }
        },
        sessionsAsPSM: {
          select: { id: true }
        }
      }
    })

    if (!psm) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      )
    }

    // Verify it's actually a PSM
    if (psm.role !== 'psm') {
      return NextResponse.json(
        { error: 'El usuario especificado no es un profesional (PSM)' },
        { status: 400 }
      )
    }

    // Note: Since we've already verified the role is 'psm', 
    // we don't need to check for 'admin' as it's impossible at this point

    // Delete the PSM user (cascade will handle related data)
    // Prisma will automatically delete:
    // - Profile, PSMProfile
    // - Matches (as PSM)
    // - Sessions (as PSM)
    // - PaymentPreferences, PaymentLogs
    await prisma.user.delete({
      where: { id: psmId }
    })

    return NextResponse.json({
      success: true,
      message: 'Profesional eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting PSM:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

