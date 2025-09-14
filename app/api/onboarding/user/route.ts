import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const userOnboardingSchema = z.object({
  // Connection data
  email: z.string().email(),
  walletAddress: z.string().min(1),
  privyId: z.string().optional(),
  
  // Personal data
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  telefono: z.string().min(1),
  fechaNacimiento: z.string().min(1),
  ciudad: z.string().min(1),
  pais: z.string().min(1),
  
  // Patient profile
  tipoAtencion: z.string().min(1),
  problematica: z.string().min(10),
  preferenciaAsignacion: z.enum(['automatica', 'explorar'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = userOnboardingSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { walletAddress: validatedData.walletAddress }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Ya existe una cuenta con este correo o wallet. Inicia sesión o actualiza tu perfil.',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: 'usuario',
          email: validatedData.email,
          walletAddress: validatedData.walletAddress,
          privyId: validatedData.privyId
        }
      })

      await tx.profile.create({
        data: {
          userId: user.id,
          nombre: validatedData.nombre,
          apellido: validatedData.apellido,
          telefono: validatedData.telefono,
          fechaNacimiento: new Date(validatedData.fechaNacimiento),
          ciudad: validatedData.ciudad,
          pais: validatedData.pais
        }
      })

      await tx.patientProfile.create({
        data: {
          userId: user.id,
          tipoAtencion: validatedData.tipoAtencion,
          problematica: validatedData.problematica,
          preferenciaAsignacion: validatedData.preferenciaAsignacion
        }
      })

      return user
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.id,
        role: result.role,
        email: result.email,
        walletAddress: result.walletAddress
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Log detailed error for debugging
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    )
  }
}
