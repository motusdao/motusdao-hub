# Guía de Integración: Privy On-Ramp

## 📋 Resumen

Privy **no tiene un on-ramp directo**. En su lugar, facilita la integración con proveedores externos de on-ramp como:
- **Ramp Network**
- **Coinbase Pay**
- **MoonPay**
- **Coinflow**
- **Hifi**
- **Bridge**

## 🎯 Pasos para Completar la Integración

### Paso 1: Elegir un Proveedor de On-Ramp

Elige uno de los proveedores compatibles con Privy. **Recomendación**: **Ramp Network** (ya lo intentaste antes) o **Coinbase Pay**.

### Paso 2: Crear Cuenta y Obtener Credenciales

1. **Si eliges Ramp Network**:
   - Ve a [ramp.network](https://ramp.network)
   - Crea una cuenta de desarrollador
   - Obtén tu **API Key** y **Secret Key**
   - Configura tu aplicación en el dashboard

2. **Si eliges Coinbase Pay**:
   - Ve a [coinbase.com/cloud](https://www.coinbase.com/cloud)
   - Crea un proyecto
   - Obtén tus credenciales de API

3. **Si eliges MoonPay**:
   - Ve a [moonpay.com](https://www.moonpay.com)
   - Regístrate como partner
   - Obtén API Key y Secret Key

### Paso 3: Configurar Variables de Entorno

Añade las siguientes variables a tu `.env.local`:

```env
# Privy On-Ramp Provider (elige uno: 'ramp', 'coinbase', 'moonpay', 'coinflow', 'hifi', 'bridge')
NEXT_PUBLIC_PRIVY_ONRAMP_PROVIDER=ramp

# Credenciales del proveedor elegido (ejemplo para Ramp)
PRIVY_ONRAMP_RAMP_API_KEY=tu_ramp_api_key
PRIVY_ONRAMP_RAMP_SECRET_KEY=tu_ramp_secret_key

# O para Coinbase:
# PRIVY_ONRAMP_COINBASE_API_KEY=tu_coinbase_api_key
# PRIVY_ONRAMP_COINBASE_SECRET_KEY=tu_coinbase_secret_key
```

### Paso 4: Crear API Route en el Backend

Crea el archivo `/app/api/privy-onramp/route.ts` con el siguiente código (ajusta según el proveedor elegido):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email, provider } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress es requerido' },
        { status: 400 }
      )
    }

    const selectedProvider = provider || process.env.NEXT_PUBLIC_PRIVY_ONRAMP_PROVIDER || 'ramp'

    let onrampUrl: string

    switch (selectedProvider) {
      case 'ramp': {
        const apiKey = process.env.PRIVY_ONRAMP_RAMP_API_KEY
        const secretKey = process.env.PRIVY_ONRAMP_RAMP_SECRET_KEY

        if (!apiKey || !secretKey) {
          return NextResponse.json(
            { error: 'Ramp API credentials no configuradas' },
            { status: 500 }
          )
        }

        // Construir URL de Ramp con parámetros
        const params = new URLSearchParams({
          hostApiKey: apiKey,
          userAddress: walletAddress,
          defaultAsset: 'CELO_CUSD', // Ajusta según necesites
          fiatCurrency: 'USD',
          fiatValue: '15', // Monto mínimo
        })

        if (email) {
          params.set('userEmailAddress', email)
        }

        // Generar firma (si Ramp lo requiere)
        // Consulta la documentación de Ramp para el método exacto de firma
        const url = `https://buy.ramp.network/?${params.toString()}`
        onrampUrl = url
        break
      }

      case 'coinbase': {
        const apiKey = process.env.PRIVY_ONRAMP_COINBASE_API_KEY
        const secretKey = process.env.PRIVY_ONRAMP_COINBASE_SECRET_KEY

        if (!apiKey || !secretKey) {
          return NextResponse.json(
            { error: 'Coinbase API credentials no configuradas' },
            { status: 500 }
          )
        }

        // Construir URL de Coinbase Pay
        // Consulta la documentación de Coinbase Pay para los parámetros exactos
        const params = new URLSearchParams({
          destinationWallets: JSON.stringify([{
            address: walletAddress,
            assets: ['CELO', 'CUSD'],
            supportedNetworks: ['celo']
          }])
        })

        onrampUrl = `https://pay.coinbase.com/buy/select-asset?${params.toString()}`
        break
      }

      case 'moonpay': {
        const apiKey = process.env.PRIVY_ONRAMP_MOONPAY_API_KEY
        const secretKey = process.env.PRIVY_ONRAMP_MOONPAY_SECRET_KEY

        if (!apiKey || !secretKey) {
          return NextResponse.json(
            { error: 'MoonPay API credentials no configuradas' },
            { status: 500 }
          )
        }

        // Construir URL de MoonPay con firma
        const params = new URLSearchParams({
          apiKey,
          walletAddress,
          defaultCurrencyCode: 'usd',
          defaultCryptoCurrencyCode: 'cusd',
          colorCode: '5b21b6', // Color morado de MotusDAO
        })

        if (email) {
          params.set('email', email)
        }

        // Generar firma para MoonPay (requerido)
        const queryString = params.toString()
        const signature = crypto
          .createHmac('sha256', secretKey)
          .update(queryString)
          .digest('hex')

        params.set('signature', signature)
        onrampUrl = `https://buy.moonpay.com/?${params.toString()}`
        break
      }

      default:
        return NextResponse.json(
          { error: `Proveedor ${selectedProvider} no soportado` },
          { status: 400 }
        )
    }

    return NextResponse.json({ url: onrampUrl })
  } catch (error) {
    console.error('Error generando URL de on-ramp:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

### Paso 5: Configurar Parámetros Específicos

Ajusta los parámetros en el API route según:
- **Red**: Celo Mainnet (42220)
- **Token**: cUSD o CELO
- **Moneda fiat**: USD, MXN, etc.
- **Monto mínimo**: $15 USD (o el que prefieras)

### Paso 6: Probar la Integración

1. Asegúrate de tener las variables de entorno configuradas
2. Reinicia tu servidor de desarrollo (`npm run dev`)
3. Ve a `/pagos` en tu aplicación
4. Selecciona un destino de fondos
5. Haz clic en "Privy (via Ramp/Coinbase)"
6. Debería abrirse el widget del proveedor en una nueva pestaña

## 📚 Recursos Adicionales

- **Documentación de Privy On-Ramp**: [docs.privy.io/recipes/custom-fiat-onramp](https://docs.privy.io/recipes/react/custom-fiat-onramp)
- **Ramp Network Docs**: [docs.ramp.network](https://docs.ramp.network)
- **Coinbase Pay Docs**: [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com)
- **MoonPay Docs**: [developers.moonpay.com](https://developers.moonpay.com)

## ⚠️ Notas Importantes

1. **Seguridad**: Nunca expongas las `Secret Key` en el cliente. Solo úsalas en el backend (API route).

2. **Firmas**: Algunos proveedores (como MoonPay) requieren firmar las URLs con HMAC. Asegúrate de implementar esto correctamente.

3. **Callbacks**: Configura webhooks/callbacks en el dashboard del proveedor para recibir notificaciones de transacciones completadas.

4. **Testing**: Usa las credenciales de staging/sandbox primero antes de pasar a producción.

## 🔄 Alternativa: Usar Mt Pelerin o Transak Directamente

Si prefieres evitar la complejidad de configurar Privy on-ramp, puedes usar directamente:
- **Mt Pelerin**: Ya está integrado y funcionando
- **Transak**: Cuando tengas la API key activa

Estos proveedores funcionan sin necesidad de backend adicional.

