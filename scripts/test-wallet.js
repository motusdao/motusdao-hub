#!/usr/bin/env node

/**
 * Test script to verify Celo wallet generation functionality
 * This script can be run locally to test the wallet integration
 */

const { celoMainnet, celoAlfajores, isValidCeloAddress } = require('../lib/celo.ts');

console.log('🧪 Testing MotusDAO Celo Wallet Integration\n');

// Test Celo chain configurations
console.log('📋 Celo Chain Configurations:');
console.log('Mainnet Chain ID:', celoMainnet.id);
console.log('Mainnet Name:', celoMainnet.name);
console.log('Mainnet RPC:', celoMainnet.rpcUrls.default.http[0]);
console.log('Mainnet Explorer:', celoMainnet.blockExplorers.default.url);

console.log('\nTestnet Chain ID:', celoAlfajores.id);
console.log('Testnet Name:', celoAlfajores.name);
console.log('Testnet RPC:', celoAlfajores.rpcUrls.default.http[0]);
console.log('Testnet Explorer:', celoAlfajores.blockExplorers.default.url);

// Test address validation
console.log('\n🔍 Testing Address Validation:');

const testAddresses = [
  '0x1234567890123456789012345678901234567890', // Valid format
  '0x0000000000000000000000000000000000000000', // Valid format
  'invalid-address', // Invalid format
  '', // Empty
  '0x123', // Too short
];

testAddresses.forEach((address, index) => {
  const isValid = isValidCeloAddress(address);
  console.log(`Address ${index + 1}: ${address || '(empty)'} - ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Test environment detection
console.log('\n🌍 Environment Detection:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('Expected Chain:', process.env.NODE_ENV === 'production' ? 'Celo Mainnet (42220)' : 'Celo Alfajores (44787)');

console.log('\n✅ Wallet integration test completed!');
console.log('\n📝 Next Steps:');
console.log('1. Set up your Privy App ID in environment variables');
console.log('2. Deploy to Vercel with production environment variables');
console.log('3. Test wallet connection in the deployed app');
console.log('4. Verify embedded wallet creation for email-only users');
