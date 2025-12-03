# Configuración de Transak Lite

## ✅ Credenciales Configuradas

Ya tienes las credenciales de Transak Lite:
- **API Key**: `96241fda-7a58-4d46-8c9c-4b92e076e805`
- **API Secret**: `2NQXOpnN046DWERRTw2KDw==`

## 🔧 Pasos de Configuración

### Paso 1: Añadir Variables de Entorno

Añade estas variables a tu `.env.local`:

```env
# Transak Lite Configuration
TRANSAK_API_KEY=96241fda-7a58-4d46-8c9c-4b92e076e805
TRANSAK_API_SECRET=2NQXOpnN046DWERRTw2KDw==
TRANSAK_ENVIRONMENT=STAGING  # Cambia a PRODUCTION cuando estés listo

# Flag para habilitar Transak en la UI
NEXT_PUBLIC_TRANSAK_ENABLED=true

# URL de tu aplicación (para callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # En producción: https://motusdao.com
```

**⚠️ IMPORTANTE**: 
- **NUNCA** expongas `TRANSAK_API_SECRET` en el cliente
- Solo usa `NEXT_PUBLIC_*` para variables que el cliente necesita ver
- Las credenciales secretas (`TRANSAK_API_SECRET`) solo se usan en el backend

### Paso 2: Verificar el API Route

El API route ya está creado en `/app/api/transak-lite/route.ts`. Este archivo:
- Genera URLs firmadas de Transak Lite usando HMAC-SHA256
- Configura los parámetros para Celo Mainnet, cUSD, USD
- Añade la firma requerida por Transak

### Paso 3: Configurar Parámetros (Opcional)

Si quieres cambiar la configuración (por ejemplo, usar MXN en lugar de USD), edita `/app/api/transak-lite/route.ts`:

```typescript
// Cambiar moneda fiat
defaultFiatCurrency: 'MXN', // En lugar de 'USD'

// Cambiar monto mínimo
defaultFiatAmount: '300', // $300 MXN en lugar de $15 USD

// Cambiar token (si Transak soporta otros en Celo)
cryptoCurrencyCode: 'CELO', // En lugar de 'CUSD'
```

### Paso 4: Probar la Integración

1. **Reinicia tu servidor**:
   ```bash
   npm run dev
   ```

2. **Ve a `/pagos`** en tu aplicación

3. **Selecciona un destino de fondos** (tu wallet, psicólogo, o DAO)

4. **Haz clic en "Transak Lite"**

5. **Debería abrirse** el widget de Transak en una nueva pestaña, ya configurado con:
   - Red: Celo Mainnet
   - Token: cUSD
   - Moneda fiat: USD (o MXN si lo cambiaste)
   - Monto mínimo: $15 USD
   - Dirección destino: La que seleccionaste

## 🔍 Verificación

### Verificar que las credenciales funcionan:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz clic en "Transak Lite"
4. Busca la petición a `/api/transak-lite`
5. Verifica que la respuesta tenga una `url` válida

### Si hay errores:

- **Error 500**: Verifica que `TRANSAK_API_KEY` y `TRANSAK_API_SECRET` estén en `.env.local`
- **URL no se abre**: Verifica que la URL generada sea válida (copia y pégala en el navegador)
- **Widget no carga**: Verifica que `TRANSAK_ENVIRONMENT` sea correcto (STAGING o PRODUCTION)

## 📝 Notas Importantes

1. **STAGING vs PRODUCTION**:
   - Usa `STAGING` para pruebas (no procesa pagos reales)
   - Cambia a `PRODUCTION` cuando estés listo para usuarios reales

2. **Firma HMAC**:
   - Transak requiere que las URLs estén firmadas con HMAC-SHA256
   - El API route ya hace esto automáticamente
   - No necesitas hacer nada adicional

3. **Callbacks/Webhooks** (Opcional):
   - Puedes configurar webhooks en el dashboard de Transak para recibir notificaciones cuando se complete una transacción
   - Esto es útil para actualizar el estado en tu base de datos

## 🚀 Próximos Pasos

Una vez que Transak Lite esté funcionando:

1. **Probar con una transacción pequeña** en STAGING
2. **Verificar que los fondos lleguen** a la dirección correcta
3. **Cambiar a PRODUCTION** cuando estés listo
4. **Configurar webhooks** (opcional) para tracking de transacciones

## 📚 Recursos

- **Documentación de Transak Lite**: [docs.transak.com](https://docs.transak.com)
- **Dashboard de Transak**: [app.transak.com](https://app.transak.com)
- **Soporte**: Contacta a Transak si tienes problemas con las credenciales

