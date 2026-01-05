const hre = require("hardhat");

async function main() {
  console.log("🧪 Deploying Motus Name Service to Celo Sepolia Testnet...\n");
  console.log("ℹ️  Celo Sepolia is the new official testnet (replaces Alfajores)");
  console.log("📋 Chain ID: 11142220");
  console.log("🔗 Explorer: https://sepolia.celoscan.io\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no CELO. Get testnet CELO from:");
    console.error("   https://faucet.celo.org");
    console.error("   https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    process.exit(1);
  }
  
  // Deploy contract
  console.log("📦 Deploying contract...");
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = await MotusNameService.deploy();
  
  await mns.waitForDeployment();
  
  const address = await mns.getAddress();
  
  console.log("\n✅ Motus Name Service deployed to Celo Sepolia!");
  console.log("📍 Contract address:", address);
  console.log("🔗 Explorer:", `https://sepolia.celoscan.io/address/${address}`);
  console.log("\n📋 Next steps:");
  console.log("1. Update MNS_CONTRACT_ADDRESS in lib/motus-name-service.ts:");
  console.log(`   export const MNS_CONTRACT_ADDRESS = '${address}' as const`);
  console.log("\n2. Update lib/celo.ts:");
  console.log(`   motusNameService: '${address}',`);
  console.log("\n3. Test the contract:");
  console.log(`   npm run mns:test ${address}`);
  console.log("\n4. (Optional) Verify contract on Celoscan:");
  console.log(`   npx hardhat verify --network celoSepolia ${address}`);
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });



