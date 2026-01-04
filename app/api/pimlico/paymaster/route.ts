import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para proxy de Pimlico Paymaster
 * Mantiene la API key segura en el servidor
 */
export async function POST(request: NextRequest) {
  try {
    const pimlicoApiKey = process.env.PIMLICO_API_KEY // Sin NEXT_PUBLIC_ - solo servidor
    
    if (!pimlicoApiKey) {
      console.error('[PIMLICO PAYMASTER PROXY] ❌ PIMLICO_API_KEY not configured in environment variables')
      return NextResponse.json(
        { error: 'Pimlico API key not configured. Please set PIMLICO_API_KEY in Vercel environment variables.' },
        { status: 500 }
      )
    }
    
    // Log that API key is present (but not the actual key)
    console.log('[PIMLICO PAYMASTER PROXY] ✅ API key found, length:', pimlicoApiKey.length)

    const body = await request.json()
    const { chainId, userOperation } = body

    if (!chainId || !userOperation) {
      return NextResponse.json(
        { error: 'Missing chainId or userOperation' },
        { status: 400 }
      )
    }

    // Log the userOperation we received for debugging
    console.log('[PIMLICO PAYMASTER PROXY] 📋 Received userOperation:', {
      sender: userOperation.sender,
      nonce: userOperation.nonce,
      hasFactory: !!userOperation.factory,
      hasFactoryData: !!userOperation.factoryData,
      callDataLength: userOperation.callData?.length || 0,
      hasSignature: !!userOperation.signature,
      signaturePreview: userOperation.signature?.substring(0, 20) || 'none',
    })

    // Pimlico API endpoint
    const pimlicoApiUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoApiKey}`

    // EntryPoint v0.7 address used on Celo (and other chains) for Kernel / ERC-4337
    // This must be passed explicitly to pm_sponsorUserOperation
    const entryPointAddress = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'

    // Forward request to Pimlico
    const response = await fetch(pimlicoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        // Per Pimlico docs for EntryPoint v0.7:
        // params[0]: userOperation object (unpacked format with paymaster/paymasterData/etc set to null)
        // params[1]: entryPoint address as STRING
        // params[2]: optional sponsorshipPolicyId object
        params: [userOperation, entryPointAddress],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PIMLICO PAYMASTER PROXY] ❌ HTTP error:', response.status, errorText)
      
      // Provide helpful error message for 401 Unauthorized
      if (response.status === 401) {
        console.error('[PIMLICO PAYMASTER PROXY] ❌ 401 Unauthorized - API key may be invalid or expired')
        console.error('[PIMLICO PAYMASTER PROXY] 💡 Check: 1) API key is correct in Vercel, 2) API key is active in Pimlico dashboard, 3) API key has access to Celo Mainnet (chain 42220)')
        return NextResponse.json(
          { error: 'Pimlico API authentication failed (401). Please verify PIMLICO_API_KEY is correct and has access to Celo Mainnet (chain 42220). Check your Pimlico dashboard: https://dashboard.pimlico.io' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: `Pimlico API error: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.error) {
      console.error('[PIMLICO PAYMASTER PROXY] ❌ RPC error:', data.error)
      return NextResponse.json(
        { error: `Pimlico API error: ${data.error.message || JSON.stringify(data.error)}` },
        { status: 500 }
      )
    }

    console.log('[PIMLICO PAYMASTER PROXY] ✅ Paymaster response:', {
      hasResult: !!data.result,
      hasPaymaster: !!data.result?.paymaster,
      hasPaymasterData: !!data.result?.paymasterData,
      paymasterAddress: data.result?.paymaster || 'none',
      paymasterDataLength: data.result?.paymasterData?.length || 0,
      callGasLimit: data.result?.callGasLimit,
      verificationGasLimit: data.result?.verificationGasLimit,
      preVerificationGas: data.result?.preVerificationGas,
    })

    // EntryPoint v0.7 returns unpacked format: paymaster, paymasterData, etc.
    // EntryPoint v0.6 returns packed format: paymasterAndData
    if (!data.result) {
      console.error('[PIMLICO PAYMASTER PROXY] ❌ Paymaster response missing result')
      console.error('[PIMLICO PAYMASTER PROXY] 📋 Full response:', JSON.stringify(data, null, 2))
      return NextResponse.json(
        { error: 'Pimlico paymaster returned empty result. Check that your Pimlico account has sufficient funds.' },
        { status: 500 }
      )
    }

    // Check for v0.7 unpacked format (paymaster + paymasterData)
    if (data.result.paymaster && data.result.paymasterData !== undefined) {
      console.log('[PIMLICO PAYMASTER PROXY] ✅ EntryPoint v0.7 response (unpacked format)')
      return NextResponse.json(data.result)
    }

    // Check for v0.6 packed format (paymasterAndData)
    if (data.result.paymasterAndData) {
      console.log('[PIMLICO PAYMASTER PROXY] ✅ EntryPoint v0.6 response (packed format)')
      return NextResponse.json(data.result)
    }

    // If neither format is present, it's an error
    console.error('[PIMLICO PAYMASTER PROXY] ❌ Paymaster response missing both v0.6 and v0.7 paymaster fields')
    console.error('[PIMLICO PAYMASTER PROXY] 📋 Full response:', JSON.stringify(data, null, 2))
    return NextResponse.json(
      { error: 'Pimlico paymaster returned invalid response format. Check that your Pimlico account has sufficient funds.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('[PIMLICO PROXY] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


