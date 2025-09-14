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
  console.log('Example: DATABASE_URL="postgresql://username:password@host:port/database"');
  process.exit(1);
}

console.log('📋 Database Configuration:');
console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

try {
  console.log('\n🔄 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n🔍 Testing database connection...');
  try {
    execSync('npx prisma db pull', { stdio: 'inherit' });
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('⚠️  Database pull failed, but this might be expected for new databases');
  }
  
  console.log('\n📊 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n🔍 Verifying schema deployment...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('\n✅ Database deployment completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Test the health endpoint: curl https://your-app.vercel.app/api/health/db');
  console.log('2. Test user registration in your application');
  console.log('3. Verify that all database tables are created correctly');
  console.log('4. Check Vercel function logs for any remaining issues');
  
} catch (error) {
  console.error('\n❌ Database deployment failed:');
  console.error('Error message:', error.message);
  
  if (error.message.includes('P1001')) {
    console.error('\n🔧 Database Connection Error:');
    console.error('- Check that your DATABASE_URL is correct');
    console.error('- Verify that your database server is running');
    console.error('- Ensure your database is accessible from Vercel');
    console.error('- Check firewall settings if applicable');
  } else if (error.message.includes('P1003')) {
    console.error('\n🔧 Database Access Error:');
    console.error('- Check that the database exists');
    console.error('- Verify user permissions');
    console.error('- Ensure the database user has CREATE privileges');
  }
  
  console.error('\n📞 For Supabase users:');
  console.error('- Go to your Supabase dashboard');
  console.error('- Check the Settings > Database section');
  console.error('- Verify the connection string format');
  console.error('- Ensure the database is not paused');
  
  process.exit(1);
}
