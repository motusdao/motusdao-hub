import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get privyId from query params (passed by client)
    const { searchParams } = new URL(request.url)
    const privyId = searchParams.get('privyId')
    
    if (!privyId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Privy ID is required' },
        { status: 400 }
      )
    }

    // Find user in database (only active users)
    const user = await prisma.user.findUnique({
      where: { privyId },
      select: { role: true, deletedAt: true }
    })

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const isAdmin = user.role === 'admin'

    return NextResponse.json({
      isAdmin,
      role: user.role
    })
  } catch (error) {
    console.error('Error checking admin access:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

