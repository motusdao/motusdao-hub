import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress es requerido' },
        { status: 400 }
      )
    }

    // Credenciales de Transak
    const apiKey = process.env.TRANSAK_API_KEY || process.env.NEXT_PUBLIC_TRANSAK_API_KEY
    const apiSecret = process.env.TRANSAK_API_SECRET
    const environment = process.env.TRANSAK_ENVIRONMENT || 'STAGING'

    // Debug: Log para verificar qué variables están disponibles (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Verificando variables de entorno:')
      console.log('TRANSAK_API_KEY existe:', !!apiKey)
      console.log('TRANSAK_API_SECRET existe:', !!apiSecret)
    }

    if (!apiKey || !apiSecret) {
      const missing = []
      if (!apiKey) missing.push('TRANSAK_API_KEY')
      if (!apiSecret) missing.push('TRANSAK_API_SECRET')
      
      return NextResponse.json(
        { 
          error: 'Transak API credentials no configuradas',
          missing: missing,
          hint: 'Asegúrate de que las variables estén en .env.local y reinicia el servidor'
        },
        { status: 500 }
      )
    }

    // Transak ahora requiere usar su API para generar el widgetUrl
    // Paso 1: Obtener Access Token
    const tokenResponse = await fetch('https://api.transak.com/api/v2/auth/session', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'access-token': apiSecret,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        environment: environment.toLowerCase(), // 'staging' o 'production'
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Error obteniendo token de Transak:', errorText)
      return NextResponse.json(
        { 
          error: 'Error al autenticar con Transak',
          details: errorText,
          hint: 'Verifica que tu API key esté activa. Puede que necesites completar KYB o contactar a Transak para activar tu cuenta.'
        },
        { status: 500 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.accessToken

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'No se recibió access token de Transak',
          response: tokenData
        },
        { status: 500 }
      )
    }

    // Paso 2: Generar widgetUrl usando la API
    const widgetParams = {
      apiKey,
      referrerDomain: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000',
      walletAddress,
      network: 'celo',
      cryptoCurrencyCode: 'CUSD',
      defaultFiatAmount: '15',
      defaultFiatCurrency: 'USD',
      themeColor: '5b21b6',
      widgetHeight: '650px',
      widgetWidth: '100%',
    }

    if (email) {
      widgetParams.userEmailAddress = email
    }

    const widgetResponse = await fetch('https://api.transak.com/api/v2/widget-url', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        widgetParams,
        landingPage: 'HomePage',
      }),
    })

    if (!widgetResponse.ok) {
      const errorText = await widgetResponse.text()
      console.error('Error generando widgetUrl de Transak:', errorText)
      return NextResponse.json(
        { 
          error: 'Error al generar widget URL de Transak',
          details: errorText,
          hint: 'Verifica que tu API key esté activa y que hayas completado el proceso de verificación necesario.'
        },
        { status: 500 }
      )
    }

    const widgetData = await widgetResponse.json()
    const transakUrl = widgetData.transakUrl || widgetData.url

    if (!transakUrl) {
      return NextResponse.json(
        { 
          error: 'No se recibió widgetUrl de Transak',
          response: widgetData
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: transakUrl })
  } catch (error) {
    console.error('Error generando URL de Transak:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

