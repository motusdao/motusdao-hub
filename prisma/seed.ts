import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'usuario@motusdao.com' },
    update: {},
    create: {
      email: 'usuario@motusdao.com',
      eoaAddress: '0x1234567890123456789012345678901234567890',
      privyId: 'privy_user_1',
      role: 'usuario'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'psm@motusdao.com' },
    update: {},
    create: {
      email: 'psm@motusdao.com',
      eoaAddress: '0x0987654321098765432109876543210987654321',
      privyId: 'privy_psm_1',
      role: 'psm'
    }
  })

  // Create profiles
  await prisma.profile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      nombre: 'Usuario',
      apellido: 'MotusDAO',
      telefono: '+52 55 1234 5678',
      fechaNacimiento: new Date('1990-01-01'),
      ciudad: 'Ciudad de México',
      pais: 'mexico',
      bio: 'Apasionado por el bienestar mental y la tecnología blockchain.',
      language: 'es'
    }
  })

  await prisma.profile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      nombre: 'María',
      apellido: 'González',
      telefono: '+52 55 9876 5432',
      fechaNacimiento: new Date('1985-05-15'),
      ciudad: 'Guadalajara',
      pais: 'mexico',
      bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual.',
      language: 'es'
    }
  })

  // Create patient profile for user1
  await prisma.patientProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      tipoAtencion: 'ansiedad',
      problematica: 'Busco apoyo para manejar la ansiedad en situaciones sociales y laborales. Me siento abrumado por el estrés diario y necesito herramientas para relajarme.',
      preferenciaAsignacion: 'automatica'
    }
  })

  // Create PSM profile for user2
  await prisma.pSMProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      cedulaProfesional: '12345678',
      formacionAcademica: 'Licenciatura en Psicología, Universidad Nacional Autónoma de México',
      experienciaAnios: 8,
      biografia: 'Especialista en terapia cognitivo-conductual con más de 8 años de experiencia ayudando a personas con ansiedad, depresión y trastornos del estado de ánimo.',
      especialidades: JSON.stringify(['ansiedad', 'depresion', 'cognitivo', 'estres']),
      participaSupervision: true,
      participaCursos: true,
      participaInvestigacion: false,
      participaComunidad: true
    }
  })

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'fundamentos-mindfulness' },
    update: {},
    create: {
      id: 'course_fundamentos_mindfulness',
      title: 'Fundamentos de Mindfulness',
      slug: 'fundamentos-mindfulness',
      summary: 'Aprende las bases de la atención plena y cómo aplicarla en tu vida diaria',
      description: 'Un curso completo que te guiará a través de los principios fundamentales del mindfulness, incluyendo técnicas de respiración, meditación y aplicación práctica en situaciones cotidianas.',
      isPublished: true,
      updatedAt: new Date()
    }
  })

  const course2 = await prisma.course.upsert({
    where: { slug: 'manejo-ansiedad-estres' },
    update: {},
    create: {
      id: 'course_manejo_ansiedad_estres',
      title: 'Manejo de Ansiedad y Estrés',
      slug: 'manejo-ansiedad-estres',
      summary: 'Técnicas efectivas para controlar la ansiedad y reducir el estrés',
      description: 'Descubre estrategias probadas para manejar la ansiedad y el estrés, incluyendo técnicas cognitivo-conductuales y herramientas de relajación.',
      isPublished: true,
      updatedAt: new Date()
    }
  })

  const course3 = await prisma.course.upsert({
    where: { slug: 'comunicacion-asertiva' },
    update: {},
    create: {
      id: 'course_comunicacion_asertiva',
      title: 'Comunicación Asertiva',
      slug: 'comunicacion-asertiva',
      summary: 'Mejora tus habilidades de comunicación y relaciones interpersonales',
      description: 'Aprende a comunicarte de manera efectiva, expresar tus necesidades y establecer límites saludables en tus relaciones.',
      isPublished: true,
      updatedAt: new Date()
    }
  })

  // Create module for course 1
  const module1 = await prisma.module.upsert({
    where: {
      courseId_order: {
        courseId: course1.id,
        order: 0
      }
    },
    update: {},
    create: {
      id: `mod_${course1.id}_default`,
      courseId: course1.id,
      title: 'Módulo Principal',
      summary: 'Módulo principal del curso de Fundamentos de Mindfulness',
      order: 0,
      updatedAt: new Date()
    }
  })

  // Create lessons for course 1
  const lessons1 = [
    {
      title: 'Introducción al Mindfulness',
      slug: 'introduccion-mindfulness',
      contentMDX: '# Introducción al Mindfulness\n\nEl mindfulness es la práctica de prestar atención de manera consciente al momento presente...',
      order: 1,
      duration: 15,
      isPublished: true
    },
    {
      title: 'Técnicas de Respiración',
      slug: 'tecnicas-respiracion',
      contentMDX: '# Técnicas de Respiración\n\nLa respiración es una herramienta fundamental en la práctica del mindfulness...',
      order: 2,
      duration: 20,
      isPublished: true
    },
    {
      title: 'Meditación Guiada',
      slug: 'meditacion-guiada',
      contentMDX: '# Meditación Guiada\n\nLa meditación guiada es una excelente forma de comenzar tu práctica...',
      order: 3,
      duration: 25,
      isPublished: true
    },
    {
      title: 'Mindfulness en el Trabajo',
      slug: 'mindfulness-trabajo',
      contentMDX: '# Mindfulness en el Trabajo\n\nAplicar mindfulness en el entorno laboral puede mejorar significativamente...',
      order: 4,
      duration: 18,
      isPublished: true
    }
  ]

  for (const lesson of lessons1) {
    await prisma.lesson.upsert({
      where: { 
        moduleId_slug: {
          moduleId: module1.id,
          slug: lesson.slug
        }
      },
      update: {},
      create: {
        id: `lesson_${course1.id}_${lesson.slug}`,
        moduleId: module1.id,
        ...lesson,
        updatedAt: new Date()
      }
    })
  }

  // Create module for course 2
  const module2 = await prisma.module.upsert({
    where: {
      courseId_order: {
        courseId: course2.id,
        order: 0
      }
    },
    update: {},
    create: {
      id: `mod_${course2.id}_default`,
      courseId: course2.id,
      title: 'Módulo Principal',
      summary: 'Módulo principal del curso de Manejo de Ansiedad y Estrés',
      order: 0,
      updatedAt: new Date()
    }
  })

  // Create lessons for course 2
  const lessons2 = [
    {
      title: 'Entendiendo la Ansiedad',
      slug: 'entendiendo-ansiedad',
      contentMDX: '# Entendiendo la Ansiedad\n\nLa ansiedad es una respuesta natural del cuerpo al estrés...',
      order: 1,
      duration: 20,
      isPublished: true
    },
    {
      title: 'Técnicas de Relajación',
      slug: 'tecnicas-relajacion',
      contentMDX: '# Técnicas de Relajación\n\nExisten diversas técnicas que pueden ayudarte a relajarte...',
      order: 2,
      duration: 25,
      isPublished: true
    },
    {
      title: 'Terapia Cognitivo-Conductual',
      slug: 'terapia-cognitivo-conductual',
      contentMDX: '# Terapia Cognitivo-Conductual\n\nLa TCC es una forma efectiva de tratar la ansiedad...',
      order: 3,
      duration: 30,
      isPublished: true
    }
  ]

  for (const lesson of lessons2) {
    await prisma.lesson.upsert({
      where: { 
        moduleId_slug: {
          moduleId: module2.id,
          slug: lesson.slug
        }
      },
      update: {},
      create: {
        id: `lesson_${course2.id}_${lesson.slug}`,
        moduleId: module2.id,
        ...lesson,
        updatedAt: new Date()
      }
    })
  }

  // Create sample journal entries
  const journalEntries = [
    {
      userId: user1.id,
      content: 'Hoy me sentí muy motivado después de la sesión de meditación. Logré concentrarme mejor en el trabajo y me siento más tranquilo.',
      mood: 'happy',
      tags: JSON.stringify(['meditación', 'trabajo', 'motivación'])
    },
    {
      userId: user1.id,
      content: 'Tuve una conversación difícil con mi familia. Me siento un poco abrumado pero sé que es importante comunicar mis sentimientos.',
      mood: 'anxious',
      tags: JSON.stringify(['familia', 'comunicación', 'emociones'])
    },
    {
      userId: user1.id,
      content: 'Día tranquilo en casa. Disfruté leyendo un libro y cocinando. Me siento en paz conmigo mismo.',
      mood: 'calm',
      tags: JSON.stringify(['lectura', 'cocina', 'paz'])
    }
  ]

  for (const entry of journalEntries) {
    await prisma.journalEntry.upsert({
      where: {
        id: `entry_${entry.userId}_${entry.mood}`
      },
      update: {},
      create: {
        id: `entry_${entry.userId}_${entry.mood}`,
        ...entry
      }
    })
  }

  // Create sample contact messages
  const contactMessages = [
    {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      message: 'Me interesa conocer más sobre los servicios de MotusDAO. ¿Podrían contactarme?',
      userId: user1.id
    },
    {
      name: 'María López',
      email: 'maria.lopez@email.com',
      message: 'Excelente plataforma. Me gustaría saber sobre las opciones de terapia virtual.',
      userId: null
    }
  ]

  for (const message of contactMessages) {
    await prisma.contactMessage.upsert({
      where: {
        id: `contact_${message.email}`
      },
      update: {},
      create: {
        id: `contact_${message.email}`,
        ...message
      }
    })
  }

  // Create enrollments
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user1.id,
        courseId: course1.id
      }
    },
    update: {},
    create: {
      id: `enrollment_${user1.id}_${course1.id}`,
      userId: user1.id,
      courseId: course1.id,
      progress: 50,
      completed: false,
      updatedAt: new Date()
    }
  })

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user1.id,
        courseId: course2.id
      }
    },
    update: {},
    create: {
      id: `enrollment_${user1.id}_${course2.id}`,
      userId: user1.id,
      courseId: course2.id,
      progress: 25,
      completed: false,
      updatedAt: new Date()
    }
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
