import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Direcciones proporcionadas
  const eoaMetaMask = '0x979b2363895FC246ce5eafDe5f6785a2F364CbB0'
  const smartWalletZeroDev = '0xf4161CeC600885D11dAD862e41E6FcF00421e79f'
  
  // Email temporal basado en la wallet
  const email = `admin-${eoaMetaMask.slice(2, 10)}@motusdao.local`
  
  console.log(`🔍 Buscando usuario con las siguientes direcciones:`)
  console.log(`   - EOA MetaMask: ${eoaMetaMask}`)
  console.log(`   - Smart Wallet ZeroDev: ${smartWalletZeroDev}`)
  console.log(`\n`)
  
  // Buscar usuario existente
  const existingUser = await prisma.user.findFirst({
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
  
  if (existingUser) {
    console.log(`✅ Usuario encontrado:`)
    console.log(`   - Email: ${existingUser.email}`)
    console.log(`   - Rol actual: ${existingUser.role}`)
    console.log(`   - PrivyId: ${existingUser.privyId || '⚠️ NO ASIGNADO'}`)
    
    if (existingUser.role === 'admin') {
      console.log(`\n✅ El usuario ya tiene rol admin.`)
      if (!existingUser.privyId) {
        console.log(`\n⚠️ IMPORTANTE: Necesitas asignar el privyId para acceder al dashboard.`)
        console.log(`   Cuando inicies sesión, el privyId se actualizará automáticamente.`)
      } else {
        console.log(`\n✨ Ya puedes acceder a /admin`)
      }
      process.exit(0)
    }
    
    // Actualizar rol a admin
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: 'admin' }
    })
    
    console.log(`\n🎉 ¡Rol admin asignado exitosamente!`)
    console.log(`   - Email: ${updatedUser.email}`)
    console.log(`   - Nuevo rol: ${updatedUser.role}`)
    
    if (!updatedUser.privyId) {
      console.log(`\n⚠️ IMPORTANTE: Necesitas iniciar sesión para que se asigne el privyId.`)
      console.log(`   El privyId se actualizará automáticamente cuando inicies sesión.`)
    } else {
      console.log(`\n✨ Ahora puedes acceder a /admin`)
    }
    
    process.exit(0)
  }
  
  // Crear nuevo usuario admin
  console.log(`📝 Usuario no encontrado. Creando nuevo usuario admin...`)
  
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        eoaAddress: eoaMetaMask,
        smartWalletAddress: smartWalletZeroDev,
        role: 'admin',
        registrationCompleted: true, // Marcar como completado para acceso inmediato
        // privyId se actualizará automáticamente cuando el usuario inicie sesión
      }
    })
    
    console.log(`\n🎉 ¡Usuario admin creado exitosamente!`)
    console.log(`   - Email: ${newUser.email}`)
    console.log(`   - EOA MetaMask: ${newUser.eoaAddress}`)
    console.log(`   - Smart Wallet ZeroDev: ${newUser.smartWalletAddress}`)
    console.log(`   - Rol: ${newUser.role}`)
    console.log(`\n⚠️ IMPORTANTE:`)
    console.log(`   1. Inicia sesión en la plataforma con MetaMask`)
    console.log(`   2. El privyId se actualizará automáticamente durante el proceso de login`)
    console.log(`   3. Una vez que tengas el privyId, podrás acceder a /admin`)
    console.log(`\n💡 Si el privyId no se actualiza automáticamente:`)
    console.log(`   - Abre la consola del navegador (F12)`)
    console.log(`   - Ejecuta: window.privy?.user?.id`)
    console.log(`   - Copia el privyId y ejecuta: npm run update-privy-id -- <privyId>`)
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`\n❌ Error: Ya existe un usuario con esta dirección.`)
      console.log(`   Intenta ejecutar: npm run assign-admin-wallet`)
    } else {
      throw error
    }
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

