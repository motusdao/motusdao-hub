import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const eoaAddress = '0x4a5ce41ed6383ee58a97eb3f0163d92562b2e0ae'
  
  // Email temporal - el usuario puede cambiarlo después
  const email = `admin-${eoaAddress.slice(2, 10)}@motusdao.local`
  
  console.log(`🔍 Buscando usuario con wallet: ${eoaAddress}...`)
  
  // Buscar usuario por eoaAddress
  let user = await prisma.user.findUnique({
    where: { eoaAddress },
    include: {
      profile: true
    }
  })
  
  if (user) {
    console.log(`✅ Usuario encontrado:`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Nombre: ${user.profile?.nombre || 'N/A'} ${user.profile?.apellido || ''}`)
    console.log(`   - Rol actual: ${user.role}`)
    
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
  } else {
    console.log(`\n📝 Usuario no encontrado. Creando nuevo usuario admin...`)
    
    // Crear usuario admin directamente
    const newUser = await prisma.user.create({
      data: {
        email,
        eoaAddress,
        role: 'admin',
        registrationCompleted: true, // Marcar como completado para acceso inmediato
      }
    })
    
    console.log(`\n🎉 ¡Usuario admin creado exitosamente!`)
    console.log(`   - Email: ${newUser.email}`)
    console.log(`   - Wallet: ${newUser.eoaAddress}`)
    console.log(`   - Rol: ${newUser.role}`)
    console.log(`\n💡 Nota: Este es un usuario temporal.`)
    console.log(`   Puedes actualizar el email después desde el panel de admin.`)
    console.log(`   O el usuario puede completar su perfil cuando se registre.`)
  }
  
  console.log(`\n✨ Ahora puedes acceder a /admin con esta wallet conectada en MetaMask`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    if (error.code === 'P2002') {
      console.error('\n💡 El email o wallet ya existe. Intenta con otro email o actualiza el usuario existente.')
    }
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })










