const hre = require("hardhat");

async function main() {
  console.log("🧪 Deploying Motus Name Service to Alfajores Testnet...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no CELO. Get testnet CELO from:");
    console.error("   https://faucet.celo.org");
    process.exit(1);
  }
  
  // Deploy contract
  console.log("📦 Deploying contract...");
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = await MotusNameService.deploy();
  
  await mns.waitForDeployment();
  
  const address = await mns.getAddress();
  
  console.log("\n✅ Motus Name Service deployed to Alfajores!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Explorer:", `https://alfajores.celoscan.io/address/${address}`);
  console.log("\n📋 Next steps:");
  console.log("1. Test the contract with the deployed address");
  console.log("2. Verify contract on Celoscan:");
  console.log(`   npx hardhat verify --network alfajores ${address}`);
  console.log("\n🎉 Testnet deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });




