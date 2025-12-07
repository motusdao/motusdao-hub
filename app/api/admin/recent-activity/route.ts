import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function checkAdminAccess(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const privyId = searchParams.get('privyId') || request.headers.get('x-privy-id')
  
  if (!privyId) return null

  const user = await prisma.user.findUnique({
    where: { privyId },
    select: { role: true }
  })

  return user?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
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

    const limit = 10

    // Get recent activities from different sources
    const [recentUsers, recentMatches, recentSessions, recentPayments, recentMessages] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true
        }
      }),
      prisma.match.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { include: { profile: true } },
          psm: { include: { profile: true } }
        }
      }),
      prisma.session.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { include: { profile: true } },
          psm: { include: { profile: true } }
        }
      }),
      prisma.paymentLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: { include: { profile: true } }
        }
      }),
      prisma.contactMessage.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Combine and format activities
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registered' as const,
        title: 'Nuevo usuario registrado',
        description: user.profile
          ? `${user.profile.nombre} ${user.profile.apellido} (${user.email})`
          : user.email,
        timestamp: user.createdAt.toISOString(),
      })),
      ...recentMatches.map(match => ({
        id: `match-${match.id}`,
        type: 'match_created' as const,
        title: 'Nuevo match creado',
        description: `${match.user.profile?.nombre || 'Usuario'} emparejado con ${match.psm.profile?.nombre || 'PSM'}`,
        timestamp: match.createdAt.toISOString(),
      })),
      ...recentSessions.map(session => ({
        id: `session-${session.id}`,
        type: 'session_created' as const,
        title: 'Nueva sesión creada',
        description: `Sesión entre ${session.user.profile?.nombre || 'Usuario'} y ${session.psm.profile?.nombre || 'PSM'}`,
        timestamp: session.createdAt.toISOString(),
      })),
      ...recentPayments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        title: 'Nuevo pago registrado',
        description: `${payment.fromUser.profile?.nombre || 'Usuario'} - ${payment.amount} ${payment.currency}`,
        timestamp: payment.createdAt.toISOString(),
      })),
      ...recentMessages.map(message => ({
        id: `message-${message.id}`,
        type: 'message' as const,
        title: 'Nuevo mensaje de contacto',
        description: `De ${message.name} (${message.email})`,
        timestamp: message.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      activities
    })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

