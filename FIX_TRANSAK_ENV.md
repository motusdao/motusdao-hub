# 🔧 Corrección de Variables de Entorno para Transak Lite

## ❌ Problema Detectado

En tu `.env.local` tienes:
```env
NEXT_PUBLIC_TRANSAK_API_KEY=96241fda-7a58-4d46-8c9c-4b92e076e805
TRANSAK_API_SECRET="2NQXOpnN046DWERRTw2KDw=="
```

**El problema**: 
- El API route busca `TRANSAK_API_KEY` (sin `NEXT_PUBLIC_`)
- Las variables con `NEXT_PUBLIC_` están disponibles en el cliente, pero el API route corre en el servidor
- `TRANSAK_API_SECRET` tiene comillas que pueden causar problemas

## ✅ Solución

### Opción 1: Añadir la variable sin NEXT_PUBLIC_ (Recomendado)

Añade esta línea a tu `.env.local`:

```env
# Transak Lite - Variables para el servidor (API routes)
TRANSAK_API_KEY=96241fda-7a58-4d46-8c9c-4b92e076e805
TRANSAK_API_SECRET=2NQXOpnN046DWERRTw2KDw==
TRANSAK_ENVIRONMENT=STAGING

# Transak Lite - Variables para el cliente (opcional, para futuras mejoras)
NEXT_PUBLIC_TRANSAK_API_KEY=96241fda-7a58-4d46-8c9c-4b92e076e805
NEXT_PUBLIC_TRANSAK_ENVIRONMENT=STAGING
NEXT_PUBLIC_TRANSAK_ENABLED=true

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante**: 
- **NO** pongas comillas alrededor de los valores
- **NO** dejes espacios antes o después del `=`
- `TRANSAK_API_SECRET` debe estar **sin comillas**

### Opción 2: Ya actualicé el código (Fallback)

Ya actualicé el código para que también busque `NEXT_PUBLIC_TRANSAK_API_KEY` como fallback, pero es mejor tener ambas variables.

## 🔄 Pasos para Aplicar la Corrección

1. **Edita tu `.env.local`** y añade:
   ```env
   TRANSAK_API_KEY=96241fda-7a58-4d46-8c9c-4b92e076e805
   TRANSAK_API_SECRET=2NQXOpnN046DWERRTw2KDw==
   ```

2. **Quita las comillas** de `TRANSAK_API_SECRET` si las tiene:
   ```env
   # ❌ Incorrecto
   TRANSAK_API_SECRET="2NQXOpnN046DWERRTw2KDw=="
   
   # ✅ Correcto
   TRANSAK_API_SECRET=2NQXOpnN046DWERRTw2KDw==
   ```

3. **Reinicia el servidor** (MUY IMPORTANTE):
   ```bash
   # Detén el servidor (Ctrl+C)
   # Luego reinicia:
   npm run dev
   ```

4. **Verifica** que funcione:
   - Ve a `/pagos`
   - Selecciona un destino
   - Haz clic en "Transak Lite"
   - Debería abrirse el widget

## 🔍 Verificación

Después de reiniciar, revisa la consola del servidor (donde corre `npm run dev`). Deberías ver logs de debug que muestran:
```
🔍 Verificando variables de entorno:
TRANSAK_API_KEY existe: true
TRANSAK_API_SECRET existe: true
```

Si ves `false` en alguno, las variables no se están leyendo correctamente.

## 📝 Nota sobre Seguridad

- `TRANSAK_API_KEY`: Puede estar en `NEXT_PUBLIC_` porque es pública
- `TRANSAK_API_SECRET`: **NUNCA** debe tener `NEXT_PUBLIC_` porque es secreta
- El API route usa el secret solo en el servidor, nunca se expone al cliente

