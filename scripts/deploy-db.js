#!/usr/bin/env node

/**
 * Script para hacer deploy de la base de datos después del deployment de Vercel
 * Este script debe ejecutarse manualmente después de que la aplicación esté desplegada
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MotusDAO Database Deployment Script\n');

// Verificar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.log('Please set DATABASE_URL in your environment variables');
  process.exit(1);
}

console.log('📋 Database Configuration:');
console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

try {
  console.log('\n🔄 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n📊 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n🌱 Seeding database (optional)...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Seed script failed or not configured, continuing...');
  }
  
  console.log('\n✅ Database deployment completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify your application is working correctly');
  console.log('2. Test wallet connections and user registration');
  console.log('3. Check that all features are functional');
  
} catch (error) {
  console.error('\n❌ Database deployment failed:');
  console.error(error.message);
  process.exit(1);
}
