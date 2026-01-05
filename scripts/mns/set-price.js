const hre = require("hardhat");

async function main() {
  // Dirección del contrato deployado
  const contractAddress = "0x4eB280b21de012FCAe14c9aB2D29b298c0A91d1c";
  
  // Nuevo precio (en wei - 18 decimals para cUSD)
  // Usar variable de entorno o default a 0 (gratis)
  const newPriceInCUSD = process.env.MNS_PRICE || "0"; // Default: gratis
  const newPriceInWei = hre.ethers.parseUnits(newPriceInCUSD, 18);
  
  console.log("🔧 Actualizando precio de registro en MNS...\n");
  console.log("📍 Contrato:", contractAddress);
  console.log("💰 Nuevo precio:", newPriceInCUSD, "cUSD\n");
  
  // Get signer (debe ser el owner del contrato)
  const [owner] = await hre.ethers.getSigners();
  console.log("👤 Owner address:", owner.address);
  
  // Verificar balance
  const balance = await hre.ethers.provider.getBalance(owner.address);
  console.log("💰 Owner balance:", hre.ethers.formatEther(balance), "CELO\n");
  
  // Conectar al contrato
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = MotusNameService.attach(contractAddress);
  
  // Obtener precio actual
  const currentPrice = await mns.registrationPrice();
  console.log("📊 Precio actual:", hre.ethers.formatUnits(currentPrice, 18), "cUSD");
  
  // Actualizar precio
  console.log("🔄 Actualizando precio...");
  const tx = await mns.setRegistrationPrice(newPriceInWei);
  console.log("📝 Transacción enviada:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transacción confirmada\n");
  
  // Verificar nuevo precio
  const updatedPrice = await mns.registrationPrice();
  console.log("✅ Nuevo precio:", hre.ethers.formatUnits(updatedPrice, 18), "cUSD");
  console.log("🔗 Explorer:", `https://explorer.celo.org/mainnet/tx/${tx.hash}`);
  
  if (newPriceInCUSD === "0") {
    console.log("\n🎉 ¡Registros ahora son GRATIS!");
    console.log("💡 Perfecto para tu focus group");
  }
  
  console.log("\n🎯 Los usuarios ahora pueden registrar nombres por:", newPriceInCUSD, "cUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

