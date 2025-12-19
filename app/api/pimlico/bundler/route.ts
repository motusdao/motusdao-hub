import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para proxy de Pimlico Bundler
 * Mantiene la API key segura en el servidor
 * El bundler también requiere autenticación con API key
 * 
 * This proxy accepts JSON-RPC requests from viem and forwards them to Pimlico
 * with the API key added as a query parameter.
 */
export async function POST(request: NextRequest) {
  try {
    const pimlicoApiKey = process.env.PIMLICO_API_KEY // Sin NEXT_PUBLIC_ - solo servidor
    
    if (!pimlicoApiKey) {
      console.error('[PIMLICO BUNDLER PROXY] ❌ PIMLICO_API_KEY not configured in environment variables')
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          id: null,
          error: { 
            code: -32000, 
            message: 'Pimlico API key not configured. Please set PIMLICO_API_KEY in Vercel environment variables.' 
          }
        },
        { status: 500 }
      )
    }
    
    // Log that API key is present (but not the actual key)
    console.log('[PIMLICO BUNDLER PROXY] ✅ API key found, length:', pimlicoApiKey.length)

    // Parse the request body - could be either our custom format or viem's JSON-RPC format
    const body = await request.json()
    
    // Extract chainId - either from body.chainId (our format) or infer from request
    // For Celo Mainnet, chainId is 42220
    const chainId = body.chainId || 42220
    
    // Check if this is a JSON-RPC request from viem (has jsonrpc field)
    // or our custom format (has chainId, method, params separately)
    interface JsonRpcRequest {
      jsonrpc: string
      id: number | string | null
      method: string
      params?: unknown[]
    }
    
    let jsonRpcRequest: JsonRpcRequest
    
    if (body.jsonrpc) {
      // This is a JSON-RPC request from viem - forward it as-is
      jsonRpcRequest = body as JsonRpcRequest
    } else if (body.method) {
      // This is our custom format - convert to JSON-RPC
      jsonRpcRequest = {
        jsonrpc: '2.0',
        id: body.id || 1,
        method: body.method,
        params: body.params || [],
      }
    } else {
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          id: null,
          error: { 
            code: -32600, 
            message: 'Invalid request format' 
          }
        },
        { status: 400 }
      )
    }

    // Pimlico Bundler API endpoint (requires API key)
    const pimlicoApiUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoApiKey}`

    // Forward JSON-RPC request to Pimlico bundler
    const response = await fetch(pimlicoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonRpcRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PIMLICO BUNDLER PROXY] ❌ HTTP error:', response.status, errorText)
      
      // Provide helpful error message for 401 Unauthorized
      if (response.status === 401) {
        console.error('[PIMLICO BUNDLER PROXY] ❌ 401 Unauthorized - API key may be invalid or expired')
        console.error('[PIMLICO BUNDLER PROXY] 💡 Check: 1) API key is correct in Vercel, 2) API key is active in Pimlico dashboard, 3) API key has access to Celo Mainnet (chain 42220)')
        return NextResponse.json(
          { 
            jsonrpc: '2.0',
            id: jsonRpcRequest.id,
            error: { 
              code: -32001, 
              message: 'Pimlico API authentication failed (401). Please verify PIMLICO_API_KEY is correct and has access to Celo Mainnet (chain 42220). Check your Pimlico dashboard: https://dashboard.pimlico.io' 
            }
          },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          id: jsonRpcRequest.id,
          error: { 
            code: response.status, 
            message: `Pimlico bundler API error: ${response.status} ${errorText}` 
          }
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Return the full JSON-RPC response (viem expects this format)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PIMLICO BUNDLER PROXY] Error:', error)
    return NextResponse.json(
      { 
        jsonrpc: '2.0',
        id: null,
        error: { 
          code: -32603, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }
      },
      { status: 500 }
    )
  }
}

