require('dotenv').config({ path: '.env.local' });

async function checkPimlicoCredits() {
  const apiKey = process.env.PIMLICO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ PIMLICO_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  console.log('🔍 Verificando créditos de Pimlico...\n');
  
  // Chain ID de Celo Mainnet
  const chainId = 42220;
  
  try {
    // Test paymaster con un userOperation dummy
    const dummyUserOp = {
      sender: '0x3B926D3E21c539Df9ADf7c2436F17D304C889c2A',
      nonce: '0x0',
      callData: '0x',
      callGasLimit: '0x10000',
      verificationGasLimit: '0x10000',
      preVerificationGas: '0x5000',
      maxFeePerGas: '0x3b9aca00',
      maxPriorityFeePerGas: '0x3b9aca00',
      paymaster: null,
      paymasterData: null,
      paymasterVerificationGasLimit: null,
      paymasterPostOpGasLimit: null,
      signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
    };
    
    const url = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [dummyUserOp, '0x0000000071727De22E5E9d8BAf0edAc6f37da032']
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Respuesta de Pimlico:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.error) {
      console.error('❌ Error:', data.error.message);
      console.log('');
      
      if (data.error.message && data.error.message.includes('insufficient')) {
        console.log('💡 Solución:');
        console.log('1. Ve a: https://dashboard.pimlico.io');
        console.log('2. Agrega créditos a tu cuenta');
        console.log('3. O configura una Sponsorship Policy');
        console.log('');
      } else if (data.error.message && data.error.message.includes('rate limit')) {
        console.log('💡 Alcanzaste el límite de rate');
        console.log('Espera un momento o actualiza tu plan');
        console.log('');
      } else {
        console.log('💡 Revisa tu dashboard de Pimlico:');
        console.log('https://dashboard.pimlico.io');
        console.log('');
      }
      
      process.exit(1);
    }
    
    if (data.result) {
      console.log('✅ Pimlico está funcionando correctamente');
      console.log('✅ Tienes créditos/sponsorship activo');
      console.log('');
      console.log('📋 Detalles del paymaster:');
      console.log('  Paymaster:', data.result.paymaster || 'N/A');
      console.log('  Verification Gas:', data.result.paymasterVerificationGasLimit || 'N/A');
      console.log('  PostOp Gas:', data.result.paymasterPostOpGasLimit || 'N/A');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar Pimlico:', error.message);
    console.log('');
    console.log('💡 Verifica:');
    console.log('1. Tu API key es válida');
    console.log('2. Tienes acceso a Celo Mainnet (chain 42220)');
    console.log('3. Dashboard: https://dashboard.pimlico.io');
    console.log('');
    process.exit(1);
  }
}

checkPimlicoCredits();



