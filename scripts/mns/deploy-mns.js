const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Motus Name Service to Celo Mainnet...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no CELO. Please fund the account first.");
    process.exit(1);
  }
  
  // Deploy contract
  console.log("📦 Deploying contract...");
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = await MotusNameService.deploy();
  
  await mns.waitForDeployment();
  
  const address = await mns.getAddress();
  
  console.log("\n✅ Motus Name Service deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Explorer:", `https://explorer.celo.org/mainnet/address/${address}`);
  console.log("\n📋 Next steps:");
  console.log("1. Update MNS_CONTRACT_ADDRESS in lib/motus-name-service.ts");
  console.log("2. Update lib/celo.ts to include the contract address");
  console.log("3. Verify contract on Celoscan (optional):");
  console.log(`   npx hardhat verify --network celo ${address}`);
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });




