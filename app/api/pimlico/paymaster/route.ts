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

    // Pimlico API endpoint
    const pimlicoApiUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoApiKey}`

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
        params: [userOperation, { chainId }],
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
      console.error('[PIMLICO PROXY] RPC error:', data.error)
      return NextResponse.json(
        { error: `Pimlico API error: ${data.error.message || JSON.stringify(data.error)}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data.result)
  } catch (error) {
    console.error('[PIMLICO PROXY] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


