import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/sync-privy-id
 * Sincroniza el privyId de un usuario existente basado en su eoaAddress
 * Útil para usuarios admin que fueron creados antes de tener privyId
 * 
 * Body: { eoaAddress: string, privyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eoaAddress, privyId } = body

    if (!eoaAddress || !privyId) {
      return NextResponse.json(
        { error: 'eoaAddress y privyId son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por eoaAddress
    const user = await prisma.user.findUnique({
      where: { eoaAddress },
      select: { id: true, email: true, role: true, privyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si ya tiene privyId y es diferente, verificar que no esté en uso
    if (user.privyId && user.privyId !== privyId) {
      const existingUserWithPrivyId = await prisma.user.findUnique({
        where: { privyId }
      })

      if (existingUserWithPrivyId && existingUserWithPrivyId.id !== user.id) {
        return NextResponse.json(
          { error: 'Este privyId ya está asignado a otro usuario' },
          { status: 409 }
        )
      }
    }

    // Actualizar privyId
    const updatedUser = await prisma.user.update({
      where: { eoaAddress },
      data: { privyId }
    })

    return NextResponse.json({
      success: true,
      message: 'PrivyId sincronizado exitosamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        privyId: updatedUser.privyId
      }
    })
  } catch (error: any) {
    console.error('Error syncing privyId:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este privyId ya está asignado a otro usuario' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

