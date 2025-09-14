import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const psmOnboardingSchema = z.object({
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
  
  // Professional data
  cedulaProfesional: z.string().min(1),
  formacionAcademica: z.string().min(1),
  experienciaAnios: z.number().min(0),
  biografia: z.string().optional(),
  especialidades: z.array(z.string()).min(1),
  participaSupervision: z.boolean().default(false),
  participaCursos: z.boolean().default(false),
  participaInvestigacion: z.boolean().default(false),
  participaComunidad: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = psmOnboardingSchema.parse(body)
    
    // Check if user already exists
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

    // Create user and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          role: 'psm',
          email: validatedData.email,
          walletAddress: validatedData.walletAddress,
          privyId: validatedData.privyId
        }
      })

      // Create profile
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

      // Create PSM profile
      await tx.pSMProfile.create({
        data: {
          userId: user.id,
          cedulaProfesional: validatedData.cedulaProfesional,
          formacionAcademica: validatedData.formacionAcademica,
          experienciaAnios: validatedData.experienciaAnios,
          biografia: validatedData.biografia,
          especialidades: JSON.stringify(validatedData.especialidades),
          participaSupervision: validatedData.participaSupervision,
          participaCursos: validatedData.participaCursos,
          participaInvestigacion: validatedData.participaInvestigacion,
          participaComunidad: validatedData.participaComunidad
        }
      })

      return user
    })

    return NextResponse.json({
      success: true,
      message: 'Profesional registrado exitosamente',
      user: {
        id: result.id,
        role: result.role,
        email: result.email,
        walletAddress: result.walletAddress
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating PSM:', error)
    
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
