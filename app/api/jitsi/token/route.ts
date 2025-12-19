import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * POST /api/jitsi/token
 * Generates a JWT token for Jitsi Meet room access
 * 
 * Body: { roomName: string, userId: string, userName?: string, userEmail?: string }
 * 
 * Returns: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomName, userId, userName, userEmail } = body as {
      roomName?: string
      userId?: string
      userName?: string
      userEmail?: string
    }

    if (!roomName) {
      return NextResponse.json(
        { error: 'roomName es requerido' },
        { status: 400 }
      )
    }

    // JWT secret for Jitsi (must match your Jitsi server configuration)
    const jitsiAppSecret = process.env.JITSI_APP_SECRET
    const jitsiAppId = process.env.JITSI_APP_ID

    // If JWT is not configured, return error
    if (!jitsiAppSecret || !jitsiAppId) {
      return NextResponse.json(
        {
          error: 'Jitsi JWT no está configurado',
          hint: 'Configura JITSI_APP_SECRET y JITSI_APP_ID en tus variables de entorno',
        },
        { status: 500 }
      )
    }

    // Jitsi JWT payload structure
    const payload = {
      iss: jitsiAppId, // Issuer (your Jitsi App ID)
      aud: 'jitsi', // Audience
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // Expires in 2 hours
      nbf: Math.floor(Date.now() / 1000) - 10, // Not before (10 seconds ago)
      room: roomName,
      sub: jitsiAppId, // Subject
      context: {
        user: {
          id: userId || 'anonymous',
          name: userName || 'Usuario',
          email: userEmail || '',
          moderator: false, // Set to true if user should be moderator
        },
        features: {
          livestreaming: false,
          recording: false,
          'outbound-call': false,
        },
      },
    }

    // Generate JWT token
    const token = jwt.sign(payload, jitsiAppSecret, {
      algorithm: 'HS256',
    })

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('Error generating Jitsi JWT token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al generar token' },
      { status: 500 }
    )
  }
}



