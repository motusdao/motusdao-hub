import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const eoaAddress = '0x4a5ce41ed6383ee58a97eb3f0163d92562b2e0ae'
  
  console.log(`🔍 Buscando usuario con wallet: ${eoaAddress}...`)
  
  // Buscar usuario por eoaAddress
  const user = await prisma.user.findUnique({
    where: { eoaAddress },
    include: {
      profile: true
    }
  })
  
  if (!user) {
    console.log(`❌ No se encontró ningún usuario con la wallet ${eoaAddress}`)
    console.log(`\n💡 Opciones:`)
    console.log(`1. Asegúrate de que el usuario ya esté registrado en la plataforma`)
    console.log(`2. El usuario debe haber completado el onboarding y conectado MetaMask`)
    console.log(`3. Verifica que la dirección sea correcta: ${eoaAddress}`)
    process.exit(1)
  }
  
  console.log(`✅ Usuario encontrado:`)
  console.log(`   - Email: ${user.email}`)
  console.log(`   - Nombre: ${user.profile?.nombre || 'N/A'} ${user.profile?.apellido || ''}`)
  console.log(`   - Rol actual: ${user.role}`)
  console.log(`   - Wallet: ${user.eoaAddress}`)
  
  if (user.role === 'admin') {
    console.log(`\n✅ El usuario ya tiene rol admin. No se requiere cambio.`)
    process.exit(0)
  }
  
  // Actualizar rol a admin
  const updatedUser = await prisma.user.update({
    where: { eoaAddress },
    data: { role: 'admin' }
  })
  
  console.log(`\n🎉 ¡Rol admin asignado exitosamente!`)
  console.log(`   - Email: ${updatedUser.email}`)
  console.log(`   - Nuevo rol: ${updatedUser.role}`)
  console.log(`\n✨ Ahora puedes acceder a /admin con esta cuenta`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

