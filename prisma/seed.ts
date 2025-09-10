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
      privyId: 'privy_user_1',
      rolePreferred: 'usuario'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'psm@motusdao.com' },
    update: {},
    create: {
      email: 'psm@motusdao.com',
      privyId: 'privy_psm_1',
      rolePreferred: 'psm'
    }
  })

  // Create profiles
  await prisma.profile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      displayName: 'Usuario MotusDAO',
      bio: 'Apasionado por el bienestar mental y la tecnología blockchain.',
      language: 'es'
    }
  })

  await prisma.profile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      displayName: 'Dr. María González',
      bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual.',
      language: 'es'
    }
  })

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'fundamentos-mindfulness' },
    update: {},
    create: {
      title: 'Fundamentos de Mindfulness',
      slug: 'fundamentos-mindfulness',
      summary: 'Aprende las bases de la atención plena y cómo aplicarla en tu vida diaria',
      description: 'Un curso completo que te guiará a través de los principios fundamentales del mindfulness, incluyendo técnicas de respiración, meditación y aplicación práctica en situaciones cotidianas.',
      isPublished: true
    }
  })

  const course2 = await prisma.course.upsert({
    where: { slug: 'manejo-ansiedad-estres' },
    update: {},
    create: {
      title: 'Manejo de Ansiedad y Estrés',
      slug: 'manejo-ansiedad-estres',
      summary: 'Técnicas efectivas para controlar la ansiedad y reducir el estrés',
      description: 'Descubre estrategias probadas para manejar la ansiedad y el estrés, incluyendo técnicas cognitivo-conductuales y herramientas de relajación.',
      isPublished: true
    }
  })

  const course3 = await prisma.course.upsert({
    where: { slug: 'comunicacion-asertiva' },
    update: {},
    create: {
      title: 'Comunicación Asertiva',
      slug: 'comunicacion-asertiva',
      summary: 'Mejora tus habilidades de comunicación y relaciones interpersonales',
      description: 'Aprende a comunicarte de manera efectiva, expresar tus necesidades y establecer límites saludables en tus relaciones.',
      isPublished: true
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
        courseId_slug: {
          courseId: course1.id,
          slug: lesson.slug
        }
      },
      update: {},
      create: {
        courseId: course1.id,
        ...lesson
      }
    })
  }

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
        courseId_slug: {
          courseId: course2.id,
          slug: lesson.slug
        }
      },
      update: {},
      create: {
        courseId: course2.id,
        ...lesson
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
      userId: user1.id,
      courseId: course1.id,
      progress: 50,
      completed: false
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
      userId: user1.id,
      courseId: course2.id,
      progress: 25,
      completed: false
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
