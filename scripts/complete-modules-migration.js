const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting modules migration...\n')

    // Step 1: Create modules table
    console.log('Step 1: Creating modules table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "modules" (
        "id" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
      )
    `)
    console.log('✓ Modules table created\n')

    // Step 2: Create unique constraint for modules
    console.log('Step 2: Creating unique constraint for modules...')
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "modules_courseId_order_key" ON "modules"("courseId", "order")
      `)
      console.log('✓ Unique constraint created\n')
    } catch (e) {
      if (!e.message.includes('already exists')) throw e
      console.log('⚠ Constraint already exists\n')
    }

    // Step 3: Add moduleId and summary columns to lessons if they don't exist
    console.log('Step 3: Adding moduleId and summary columns to lessons...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "moduleId" TEXT
      `)
      console.log('✓ moduleId column added')
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('duplicate')) throw e
      console.log('⚠ moduleId column already exists')
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "summary" TEXT
      `)
      console.log('✓ summary column added\n')
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('duplicate')) throw e
      console.log('⚠ summary column already exists\n')
    }

    // Step 4: Check if lessons still have courseId
    console.log('Step 4: Checking for courseId in lessons...')
    const hasCourseId = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'lessons' AND column_name = 'courseId'
    `)
    
    if (hasCourseId.length > 0) {
      console.log('Found courseId column, migrating data...')
      
      // Get all unique courseIds from lessons
      const courses = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT "courseId" FROM "lessons" WHERE "courseId" IS NOT NULL
      `)
      
      console.log(`Found ${courses.length} courses with lessons`)
      
      // Create default module for each course
      for (const course of courses) {
        const courseId = course.courseId
        const moduleId = `mod_${courseId}_default`
        
        // Create default module
        await prisma.$executeRawUnsafe(`
          INSERT INTO "modules" ("id", "courseId", "title", "summary", "order", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `, moduleId, courseId, 'Módulo Principal', 'Módulo por defecto para lecciones existentes')
        
        // Update lessons to reference the module
        await prisma.$executeRawUnsafe(`
          UPDATE "lessons" 
          SET "moduleId" = $1 
          WHERE "courseId" = $2 AND "moduleId" IS NULL
        `, moduleId, courseId)
      }
      
      console.log('✓ Data migrated to modules\n')
      
      // Remove courseId foreign key constraint if exists
      console.log('Step 5: Removing courseId from lessons...')
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_courseId_fkey"
        `)
        console.log('✓ Foreign key constraint removed')
      } catch (e) {
        console.log('⚠ No foreign key to remove')
      }
      
      // Drop courseId column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "lessons" DROP COLUMN IF EXISTS "courseId"
      `)
      console.log('✓ courseId column removed')
      
      // Drop old unique constraint if exists
      try {
        await prisma.$executeRawUnsafe(`
          DROP INDEX IF EXISTS "lessons_courseId_slug_key"
        `)
        console.log('✓ Old unique constraint removed\n')
      } catch (e) {
        console.log('⚠ No old constraint to remove\n')
      }
    } else {
      console.log('✓ No courseId column found (already migrated)\n')
    }

    // Step 6: Add foreign key constraint for moduleId
    console.log('Step 6: Adding foreign key constraint...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "lessons" 
        ADD CONSTRAINT "lessons_moduleId_fkey" 
        FOREIGN KEY ("moduleId") REFERENCES "modules"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `)
      console.log('✓ Foreign key constraint added')
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('duplicate')) throw e
      console.log('⚠ Foreign key already exists')
    }

    // Step 7: Create unique constraint for lessons
    console.log('\nStep 7: Creating unique constraint for lessons...')
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "lessons_moduleId_slug_key" ON "lessons"("moduleId", "slug")
      `)
      console.log('✓ Unique constraint created')
    } catch (e) {
      if (!e.message.includes('already exists')) throw e
      console.log('⚠ Constraint already exists')
    }

    // Step 8: Add foreign key for modules -> courses
    console.log('\nStep 8: Adding foreign key for modules -> courses...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "modules" 
        ADD CONSTRAINT "modules_courseId_fkey" 
        FOREIGN KEY ("courseId") REFERENCES "courses"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `)
      console.log('✓ Foreign key constraint added')
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('duplicate')) throw e
      console.log('⚠ Foreign key already exists')
    }

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
