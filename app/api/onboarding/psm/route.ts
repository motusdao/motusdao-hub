import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const psmOnboardingSchema = z.object({
  // Connection data
  email: z.string().email(),
  eoaAddress: z.string().min(1),
  smartWalletAddress: z.string().optional(),
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
          { eoaAddress: validatedData.eoaAddress }
        ]
      },
      include: {
        profile: true,
        psm: true
      }
    })

    // If user exists, update their information instead of creating new
    if (existingUser) {
      // Check if this is the same user trying to update their smart wallet
      // Allow update if:
      // 1. Same email and EOA, and smart wallet is missing or different
      // 2. Registration is not completed
      const isSameUser = existingUser.email === validatedData.email && 
                         existingUser.eoaAddress === validatedData.eoaAddress
      const needsSmartWalletUpdate = !existingUser.smartWalletAddress || 
                                    (validatedData.smartWalletAddress && 
                                     existingUser.smartWalletAddress !== validatedData.smartWalletAddress)
      const isUpdatingSmartWallet = isSameUser && needsSmartWalletUpdate
      
      // Log for debugging
      console.log('🔍 PSM exists - checking update conditions:', {
        email: validatedData.email,
        eoaAddress: validatedData.eoaAddress,
        smartWalletAddress: validatedData.smartWalletAddress,
        existingSmartWallet: existingUser.smartWalletAddress,
        isSameUser,
        needsSmartWalletUpdate,
        isUpdatingSmartWallet,
        registrationCompleted: existingUser.registrationCompleted,
        willUpdate: isUpdatingSmartWallet || !existingUser.registrationCompleted
      })
      
      if (isUpdatingSmartWallet || !existingUser.registrationCompleted) {
        // Determine the smart wallet address to use
        // If a new smart wallet address is provided, use it; otherwise keep existing
        const smartWalletToSave = validatedData.smartWalletAddress || existingUser.smartWalletAddress
        
        console.log('✅ Updating PSM with smart wallet:', {
          userId: existingUser.id,
          smartWalletToSave,
          provided: validatedData.smartWalletAddress,
          existing: existingUser.smartWalletAddress
        })
        
        // Update user with smart wallet address and mark registration as completed
        const result = await prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: existingUser.id },
            data: {
              eoaAddress: validatedData.eoaAddress,
              smartWalletAddress: smartWalletToSave,
              registrationCompleted: true,
              privyId: validatedData.privyId || existingUser.privyId
            }
          })

          // Update profile if it exists
          if (existingUser.profile) {
            await tx.profile.update({
              where: { userId: existingUser.id },
              data: {
                nombre: validatedData.nombre,
                apellido: validatedData.apellido,
                telefono: validatedData.telefono,
                fechaNacimiento: new Date(validatedData.fechaNacimiento),
                ciudad: validatedData.ciudad,
                pais: validatedData.pais
              }
            })
          } else {
            await tx.profile.create({
              data: {
                userId: existingUser.id,
                nombre: validatedData.nombre,
                apellido: validatedData.apellido,
                telefono: validatedData.telefono,
                fechaNacimiento: new Date(validatedData.fechaNacimiento),
                ciudad: validatedData.ciudad,
                pais: validatedData.pais
              }
            })
          }

          // Update PSM profile if it exists
          if (existingUser.psm) {
            await tx.pSMProfile.update({
              where: { userId: existingUser.id },
              data: {
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
          } else {
            await tx.pSMProfile.create({
              data: {
                userId: existingUser.id,
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
          }

          return user
        })

        return NextResponse.json({
          success: true,
          message: 'Profesional actualizado exitosamente',
          user: {
            id: result.id,
            role: result.role,
            email: result.email,
            eoaAddress: result.eoaAddress,
            smartWalletAddress: result.smartWalletAddress,
            registrationCompleted: result.registrationCompleted
          }
        }, { status: 200 })
      } else {
        // User exists with same email and wallet - might be duplicate registration
        return NextResponse.json(
          { 
            error: 'Ya existe una cuenta con este correo o wallet. Inicia sesión o actualiza tu perfil.',
            code: 'USER_EXISTS'
          },
          { status: 409 }
        )
      }
    }

    // Create new user and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          role: 'psm',
          email: validatedData.email,
          eoaAddress: validatedData.eoaAddress,
          smartWalletAddress: validatedData.smartWalletAddress || null,
          registrationCompleted: true,
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
        eoaAddress: result.eoaAddress,
        smartWalletAddress: result.smartWalletAddress,
        registrationCompleted: result.registrationCompleted
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
