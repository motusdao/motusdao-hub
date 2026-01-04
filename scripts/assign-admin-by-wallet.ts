import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Direcciones proporcionadas
  const eoaMetaMask = '0x979b2363895FC246ce5eafDe5f6785a2F364CbB0'
  const smartWalletZeroDev = '0xf4161CeC600885D11dAD862e41E6FcF00421e79f'
  
  console.log(`🔍 Buscando usuario con las siguientes direcciones:`)
  console.log(`   - EOA MetaMask: ${eoaMetaMask}`)
  console.log(`   - Smart Wallet ZeroDev: ${smartWalletZeroDev}`)
  console.log(`\n`)
  
  // Buscar usuario por cualquiera de las direcciones
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { eoaAddress: eoaMetaMask },
        { smartWalletAddress: smartWalletZeroDev }
      ]
    },
    include: {
      profile: true
    }
  })
  
  if (!user) {
    console.log(`❌ No se encontró ningún usuario con esas direcciones.`)
    console.log(`\n💡 Opciones:`)
    console.log(`1. Asegúrate de que el usuario ya esté registrado en la plataforma`)
    console.log(`2. El usuario debe haber completado el onboarding`)
    console.log(`3. Verifica que las direcciones sean correctas`)
    console.log(`\n📝 Si necesitas crear el usuario, necesitarás también el privyId.`)
    console.log(`   Puedes obtenerlo desde la consola del navegador cuando estés logueado:`)
    console.log(`   - Abre la consola (F12)`)
    console.log(`   - Ejecuta: window.privy?.user?.id`)
    process.exit(1)
  }
  
  console.log(`✅ Usuario encontrado:`)
  console.log(`   - ID: ${user.id}`)
  console.log(`   - Email: ${user.email}`)
  console.log(`   - Nombre: ${user.profile?.nombre || 'N/A'} ${user.profile?.apellido || ''}`)
  console.log(`   - Rol actual: ${user.role}`)
  console.log(`   - EOA Address: ${user.eoaAddress}`)
  console.log(`   - Smart Wallet: ${user.smartWalletAddress || 'N/A'}`)
  console.log(`   - Privy ID: ${user.privyId || '⚠️ NO ASIGNADO'}`)
  
  if (!user.privyId) {
    console.log(`\n⚠️ ADVERTENCIA: El usuario no tiene privyId asignado.`)
    console.log(`   El acceso al dashboard admin requiere privyId.`)
    console.log(`   Necesitarás actualizar el privyId después de iniciar sesión.`)
  }
  
  if (user.role === 'admin') {
    console.log(`\n✅ El usuario ya tiene rol admin. No se requiere cambio.`)
    if (!user.privyId) {
      console.log(`\n💡 Para obtener el privyId:`)
      console.log(`   1. Inicia sesión en la plataforma con esta wallet`)
      console.log(`   2. Abre la consola del navegador (F12)`)
      console.log(`   3. Ejecuta: window.privy?.user?.id`)
      console.log(`   4. Luego ejecuta este script con el privyId para actualizarlo`)
    }
    process.exit(0)
  }
  
  // Actualizar rol a admin
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'admin' }
  })
  
  console.log(`\n🎉 ¡Rol admin asignado exitosamente!`)
  console.log(`   - Email: ${updatedUser.email}`)
  console.log(`   - Nuevo rol: ${updatedUser.role}`)
  
  if (!updatedUser.privyId) {
    console.log(`\n⚠️ IMPORTANTE: Necesitas asignar el privyId para acceder al dashboard.`)
    console.log(`\n📝 Pasos para obtener y asignar privyId:`)
    console.log(`   1. Inicia sesión en la plataforma con esta wallet`)
    console.log(`   2. Abre la consola del navegador (F12)`)
    console.log(`   3. Ejecuta: window.privy?.user?.id`)
    console.log(`   4. Copia el privyId que aparece`)
    console.log(`   5. Ejecuta: npm run update-privy-id -- <privyId>`)
    console.log(`\n   O actualiza manualmente en la base de datos.`)
  } else {
    console.log(`\n✨ Ahora puedes acceder a /admin con esta cuenta`)
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })







