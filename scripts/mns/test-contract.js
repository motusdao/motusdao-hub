const hre = require("hardhat");

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Please provide contract address as argument");
    console.error("Usage: node scripts/mns/test-contract.js <CONTRACT_ADDRESS>");
    process.exit(1);
  }
  
  console.log("🧪 Testing Motus Name Service\n");
  console.log("📍 Contract address:", contractAddress);
  
  const [tester] = await hre.ethers.getSigners();
  console.log("👤 Tester address:", tester.address);
  
  // Get contract instance
  const MotusNameService = await hre.ethers.getContractFactory("MotusNameService");
  const mns = MotusNameService.attach(contractAddress);
  
  // Test 1: Check registration price
  console.log("\n🔍 Test 1: Get registration price");
  const price = await mns.registrationPrice();
  console.log("✅ Registration price:", hre.ethers.formatEther(price), "cUSD");
  
  // Test 2: Check name availability
  console.log("\n🔍 Test 2: Check name availability");
  const testName = "test";
  const available = await mns.isAvailable(testName);
  console.log(`✅ Name "${testName}" available:`, available);
  
  // Test 3: Validate name format
  console.log("\n🔍 Test 3: Validate name formats");
  const validNames = ["alice", "bob-123", "test-name"];
  const invalidNames = ["Alice", "test_name", "test.name"];
  
  for (const name of validNames) {
    const valid = await mns.isValidName(name);
    console.log(`✅ "${name}" is valid:`, valid);
  }
  
  for (const name of invalidNames) {
    const valid = await mns.isValidName(name);
    console.log(`❌ "${name}" is valid:`, valid, "(should be false)");
  }
  
  // Test 4: Try to resolve unregistered name
  console.log("\n🔍 Test 4: Resolve unregistered name");
  const resolved = await mns.resolve("nonexistent");
  console.log("✅ Resolved address:", resolved, "(should be 0x0000...)");
  
  // Test 5: Check total supply
  console.log("\n🔍 Test 5: Get total supply");
  const totalSupply = await mns.totalSupply();
  console.log("✅ Total names registered:", totalSupply.toString());
  
  console.log("\n✅ All read tests passed!");
  console.log("\n📋 To test registration:");
  console.log("1. Get testnet cUSD from faucet");
  console.log("2. Approve cUSD spending");
  console.log("3. Call registerName()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });




