const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250122120000_add_modules_to_courses/migration.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          await prisma.$executeRawUnsafe(statement)
          console.log(`✓ Statement ${i + 1} executed successfully`)
        } catch (error) {
          // Ignore errors for tables/constraints that already exist
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠ Statement ${i + 1} skipped (${error.message.split('\n')[0]})`)
          } else {
            console.error(`✗ Error in statement ${i + 1}:`, error.message)
            throw error
          }
        }
      }
    }
    
    console.log('\n✅ Migration applied successfully!')
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
