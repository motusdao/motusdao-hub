const hre = require("hardhat");

async function main() {
  // Dirección del contrato deployado
  const contractAddress = "0x4eB280b21de012FCAe14c9aB2D29b298c0A91d1c";
  const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  
  console.log("💰 Retirando fondos del contrato MNS...\n");
  console.log("📍 Contrato MNS:", contractAddress);
  
  // Get signer (debe ser el owner del contrato)
  const [owner] = await hre.ethers.getSigners();
  console.log("👤 Owner address:", owner.address, "\n");
  
  // Conectar al contrato MNS
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = MotusNameService.attach(contractAddress);
  
  // Conectar al contrato cUSD para ver balance
  const cUSD = await hre.ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)"],
    cUSDAddress
  );
  
  // Ver balance del contrato
  const contractBalance = await cUSD.balanceOf(contractAddress);
  console.log("📊 Balance del contrato:", hre.ethers.formatUnits(contractBalance, 18), "cUSD");
  
  if (contractBalance === 0n) {
    console.log("\n⚠️  El contrato no tiene fondos para retirar");
    return;
  }
  
  // Ver balance del owner antes
  const ownerBalanceBefore = await cUSD.balanceOf(owner.address);
  console.log("📊 Tu balance actual:", hre.ethers.formatUnits(ownerBalanceBefore, 18), "cUSD\n");
  
  // Retirar fondos
  console.log("🔄 Retirando fondos...");
  const tx = await mns.withdraw();
  console.log("📝 Transacción enviada:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transacción confirmada\n");
  
  // Ver balance del owner después
  const ownerBalanceAfter = await cUSD.balanceOf(owner.address);
  console.log("✅ Fondos retirados:", hre.ethers.formatUnits(contractBalance, 18), "cUSD");
  console.log("💰 Tu nuevo balance:", hre.ethers.formatUnits(ownerBalanceAfter, 18), "cUSD");
  console.log("🔗 Explorer:", `https://explorer.celo.org/mainnet/tx/${tx.hash}`);
  
  console.log("\n🎉 ¡Retiro exitoso!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });



