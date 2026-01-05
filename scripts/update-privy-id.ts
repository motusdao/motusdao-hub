import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const privyId = process.argv[2]
  const eoaAddress = '0x979b2363895FC246ce5eafDe5f6785a2F364CbB0'
  
  if (!privyId) {
    console.log(`❌ Error: Se requiere privyId como argumento`)
    console.log(`\n📝 Uso:`)
    console.log(`   npm run update-privy-id -- <privyId>`)
    console.log(`\n💡 Para obtener el privyId:`)
    console.log(`   1. Inicia sesión en la plataforma`)
    console.log(`   2. Abre la consola del navegador (F12)`)
    console.log(`   3. Ejecuta: window.privy?.user?.id`)
    process.exit(1)
  }
  
  console.log(`🔍 Buscando usuario con EOA: ${eoaAddress}...`)
  
  // Buscar usuario por eoaAddress
  const user = await prisma.user.findUnique({
    where: { eoaAddress },
    include: {
      profile: true
    }
  })
  
  if (!user) {
    console.log(`❌ No se encontró ningún usuario con la wallet ${eoaAddress}`)
    process.exit(1)
  }
  
  console.log(`✅ Usuario encontrado:`)
  console.log(`   - Email: ${user.email}`)
  console.log(`   - PrivyId actual: ${user.privyId || 'N/A'}`)
  console.log(`   - Nuevo PrivyId: ${privyId}`)
  
  // Actualizar privyId
  const updatedUser = await prisma.user.update({
    where: { eoaAddress },
    data: { privyId }
  })
  
  console.log(`\n🎉 ¡PrivyId actualizado exitosamente!`)
  console.log(`   - Email: ${updatedUser.email}`)
  console.log(`   - PrivyId: ${updatedUser.privyId}`)
  console.log(`   - Rol: ${updatedUser.role}`)
  
  if (updatedUser.role === 'admin') {
    console.log(`\n✨ Ahora puedes acceder a /admin con esta cuenta`)
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    if (error.code === 'P2002') {
      console.error('\n💡 Este privyId ya está asignado a otro usuario.')
    }
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })










