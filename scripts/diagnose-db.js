#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de base de datos en Vercel
 * Ejecuta: node scripts/diagnose-db.js
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

console.log('🔍 MotusDAO Database Diagnostic Tool\n')
console.log('=' .repeat(50))

// 1. Verificar DATABASE_URL
console.log('\n1️⃣ Verificando DATABASE_URL...')
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada')
  console.log('\n💡 Solución:')
  console.log('   - Configura DATABASE_URL en Vercel Environment Variables')
  console.log('   - Para Supabase en Vercel, usa Transaction mode (puerto 6543)')
  console.log('   - Formato: postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1')
  process.exit(1)
}

console.log('✅ DATABASE_URL está configurada')

// 2. Analizar formato de URL
console.log('\n2️⃣ Analizando formato de DATABASE_URL...')
const url = new URL(databaseUrl)

console.log(`   Protocolo: ${url.protocol}`)
console.log(`   Host: ${url.hostname}`)
console.log(`   Puerto: ${url.port || 'default (5432)'}`)
console.log(`   Base de datos: ${url.pathname.replace('/', '') || 'postgres'}`)

// Verificar si es connection pooler
const isPooler = url.hostname.includes('pooler.supabase.com')
const isTransactionMode = url.port === '6543'
const hasPgbouncer = url.searchParams.has('pgbouncer') && url.searchParams.get('pgbouncer') === 'true'
const hasConnectionLimit = url.searchParams.has('connection_limit')

console.log(`\n   📊 Análisis:`)
console.log(`   ${isPooler ? '✅' : '❌'} Usa Connection Pooler: ${isPooler}`)
console.log(`   ${isTransactionMode ? '✅' : '❌'} Transaction Mode (puerto 6543): ${isTransactionMode}`)
console.log(`   ${hasPgbouncer ? '✅' : '❌'} Tiene pgbouncer=true: ${hasPgbouncer}`)
console.log(`   ${hasConnectionLimit ? '✅' : '⚠️ '} Tiene connection_limit: ${hasConnectionLimit}`)

if (!isPooler || !isTransactionMode) {
  console.log('\n⚠️  ADVERTENCIA: Esta URL puede no funcionar correctamente en Vercel')
  console.log('   Para Vercel (serverless), necesitas:')
  console.log('   - Connection Pooler (pooler.supabase.com)')
  console.log('   - Transaction Mode (puerto 6543)')
  console.log('   - Parámetro ?pgbouncer=true')
  console.log('   - Parámetro &connection_limit=1')
}

// 3. Probar conexión
console.log('\n3️⃣ Probando conexión a la base de datos...')

const prisma = new PrismaClient({
  log: ['error'],
})

async function testConnection() {
  try {
    // Test básico
    console.log('   Intentando conectar...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('   ✅ Conexión exitosa!')

    // Test de tablas
    console.log('\n4️⃣ Verificando tablas...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log(`   ✅ Encontradas ${tables.length} tablas:`)
      tables.slice(0, 10).forEach((t) => {
        console.log(`      - ${t.table_name}`)
      })
      if (tables.length > 10) {
        console.log(`      ... y ${tables.length - 10} más`)
      }
    } else {
      console.log('   ⚠️  No se encontraron tablas en el schema public')
    }

    // Test de query real
    console.log('\n5️⃣ Probando query real...')
    try {
      const userCount = await prisma.user.count()
      console.log(`   ✅ Query exitosa: ${userCount} usuarios encontrados`)
    } catch (err) {
      if (err.message.includes('does not exist') || err.message.includes('relation')) {
        console.log('   ⚠️  Las tablas aún no existen. Ejecuta: npm run db:push')
      } else {
        throw err
      }
    }

    console.log('\n✅ Diagnóstico completado: Base de datos funciona correctamente')
    console.log('\n💡 Si aún tienes problemas en Vercel:')
    console.log('   1. Verifica que DATABASE_URL esté configurada en Vercel')
    console.log('   2. Asegúrate de usar Transaction mode (puerto 6543)')
    console.log('   3. Agrega ?pgbouncer=true&connection_limit=1 a la URL')
    console.log('   4. Haz redeploy después de cambiar variables de entorno')

  } catch (error) {
    console.error('\n❌ Error de conexión:')
    console.error(`   Mensaje: ${error.message}`)
    
    // Diagnóstico específico
    if (error.message.includes('P1001') || error.message.includes("Can't reach database server")) {
      console.log('\n💡 Diagnóstico: No se puede alcanzar el servidor de base de datos')
      console.log('   Posibles causas:')
      console.log('   - URL incorrecta')
      console.log('   - Base de datos pausada (Supabase plan gratuito)')
      console.log('   - Problemas de red/firewall')
      console.log('\n   Solución:')
      console.log('   - Verifica la URL en Supabase Dashboard → Connect')
      console.log('   - Asegúrate de que la base de datos esté activa')
    } else if (error.message.includes('P1003') || error.message.includes('Database does not exist')) {
      console.log('\n💡 Diagnóstico: Base de datos no existe')
      console.log('   Solución: Verifica el nombre de la base de datos en la URL (debe ser "postgres")')
    } else if (error.message.includes('P1017') || error.message.includes('Server has closed the connection')) {
      console.log('\n💡 Diagnóstico: Conexión cerrada por el servidor')
      console.log('   Esto suele pasar cuando usas conexión directa en lugar de connection pooling')
      console.log('\n   Solución:')
      console.log('   - Usa Transaction mode (puerto 6543)')
      console.log('   - Agrega ?pgbouncer=true a la URL')
    } else if (error.message.includes('authentication') || error.message.includes('password')) {
      console.log('\n💡 Diagnóstico: Error de autenticación')
      console.log('   Solución: Verifica el usuario y password en DATABASE_URL')
    } else {
      console.log('\n💡 Revisa los logs completos arriba para más detalles')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

