import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para proxy de Pimlico Paymaster
 * Mantiene la API key segura en el servidor
 */
export async function POST(request: NextRequest) {
  try {
    const pimlicoApiKey = process.env.PIMLICO_API_KEY // Sin NEXT_PUBLIC_ - solo servidor
    
    if (!pimlicoApiKey) {
      return NextResponse.json(
        { error: 'Pimlico API key not configured' },
        { status: 500 }
      )
    }

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
      console.error('[PIMLICO PROXY] HTTP error:', response.status, errorText)
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


