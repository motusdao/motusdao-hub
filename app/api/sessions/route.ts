import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper: build random Jitsi room URL (configurable for producción)
const buildJitsiUrl = () => {
  const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
  const roomPrefix = process.env.NEXT_PUBLIC_JITSI_ROOM_PREFIX || 'motusdao-'
  const random = Math.random().toString(36).substring(2, 10)
  const roomName = `${roomPrefix}${random}`
  return `https://${domain}/${roomName}`
}

/**
 * POST /api/sessions
 * Crea una nueva sesión de terapia para un usuario ya emparejado
 *
 * Body: { userId: string, externalUrl?: string }
 *
 * - Verifica que el usuario exista y sea role === 'usuario'
 * - Verifica que tenga un Match activo con un PSM
 * - Si ya existe una sesión en estado requested/accepted, la devuelve
 * - Si no, crea una nueva sesión con modo video_external y un link de Jitsi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, externalUrl } = body as { userId?: string; externalUrl?: string }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userMatches: {
          where: { status: 'active' },
          include: {
            psm: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.role !== 'usuario') {
      return NextResponse.json(
        { error: 'Solo los usuarios pueden solicitar sesiones de terapia' },
        { status: 400 }
      )
    }

    const activeMatch = user.userMatches[0]

    if (!activeMatch) {
      return NextResponse.json(
        { error: 'No tienes un profesional emparejado actualmente' },
        { status: 400 }
      )
    }

    // Check if there is already a pending/accepted session for this user
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['requested', 'accepted'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: { profile: true },
        },
        psm: {
          include: { profile: true },
        },
        match: true,
      },
    })

    if (existingSession) {
      return NextResponse.json(
        {
          session: existingSession,
          message: 'Ya tienes una sesión pendiente o aceptada',
        },
        { status: 200 }
      )
    }

    const url = externalUrl || buildJitsiUrl()

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        psmId: activeMatch.psmId,
        matchId: activeMatch.id,
        status: 'requested',
        mode: 'video_external',
        externalUrl: url,
        requestedAt: new Date(),
      },
      include: {
        user: {
          include: { profile: true },
        },
        psm: {
          include: { profile: true },
        },
        match: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Sesión creada correctamente',
        session,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions
 * Obtiene la sesión activa (requested/accepted) para un usuario o PSM
 *
 * Query params:
 * - userId: string (prioridad)
 * - psmId: string (alternativa para vista del terapeuta)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const psmId = searchParams.get('psmId')

    if (!userId && !psmId) {
      return NextResponse.json(
        { error: 'Se requiere userId o psmId' },
        { status: 400 }
      )
    }

    const where = userId
      ? { userId, status: { in: ['requested', 'accepted'] as const } }
      : { psmId: psmId!, status: { in: ['requested', 'accepted'] as const } }

    const session = await prisma.session.findFirst({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: { profile: true },
        },
        psm: {
          include: { profile: true },
        },
        match: true,
      },
    })

    return NextResponse.json({
      activeSession: session || null,
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



