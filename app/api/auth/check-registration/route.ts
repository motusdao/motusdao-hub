import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const privyId = searchParams.get('privyId')

    if (!email && !privyId) {
      return NextResponse.json(
        { error: 'Email or Privy ID is required' },
        { status: 400 }
      )
    }

    // Find user by email or privyId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          privyId ? { privyId } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      },
      select: {
        id: true,
        email: true,
        registrationCompleted: true
      }
    })

    if (!user) {
      return NextResponse.json({
        registered: false,
        registrationCompleted: false
      })
    }

    return NextResponse.json({
      registered: true,
      registrationCompleted: user.registrationCompleted,
      userId: user.id
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

