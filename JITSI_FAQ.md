# Preguntas Frecuentes sobre Jitsi Setup

## 1. ¿Necesito contratar un servicio o puedo usar Docker en mi computadora?

### ✅ Para Desarrollo Local
**Puedes usar Docker en tu computadora** - Es suficiente y recomendado.

```bash
# En tu Mac/PC
cd jitsi
./setup.sh
docker-compose up -d
```

Esto iniciará Jitsi en `localhost:8080` y funcionará perfectamente para:
- Probar la funcionalidad
- Desarrollo
- Testing local

### ⚠️ Para Producción
**Sí necesitas un servidor siempre accesible** (24/7), porque:

- Jitsi debe estar corriendo constantemente
- Los usuarios necesitan conectarse en cualquier momento
- Tu computadora no está siempre encendida/accesible

**Opciones de servidor:**
- **DigitalOcean Droplet:** ~$12/mes (4GB RAM) - Recomendado
- **AWS EC2:** ~$10-20/mes
- **Google Cloud:** Similar a AWS
- **Tu servidor propio:** Si ya tienes uno con Docker

**Resumen:**
- ✅ Desarrollo: Docker en tu computadora = **Suficiente**
- ⚠️ Producción: Necesitas servidor dedicado = **Recomendado contratar servicio**

---

## 2. ¿Puedo usar el dominio de Vercel (motusdao-hub.vercel.app)?

### ❌ NO - No puedes usar el dominio de Vercel para Jitsi

**Razones:**

1. **Vercel no permite Docker**
   - Vercel es serverless (funciones sin servidor)
   - Jitsi necesita un servidor siempre corriendo
   - No son compatibles

2. **Jitsi necesita puertos específicos**
   - Puerto 80 (HTTP)
   - Puerto 443 (HTTPS)
   - Puerto 10000/udp (media)
   - Puerto 4443/tcp (fallback)
   - Vercel no permite controlar estos puertos

3. **Jitsi necesita estar siempre activo**
   - No puede ser "serverless"
   - Debe estar corriendo 24/7

### ✅ Soluciones

#### Opción A: Desarrollo Local (Recomendado para empezar)
```env
# En jitsi/.env
PUBLIC_URL=http://localhost:8080

# En .env.local (Next.js)
NEXT_PUBLIC_JITSI_DOMAIN=localhost:8080
```

**Ventajas:**
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Perfecto para desarrollo y pruebas
- ✅ No necesitas dominio

**Limitaciones:**
- ⚠️ Solo funciona en tu computadora
- ⚠️ No accesible desde internet
- ⚠️ Vercel (producción) no puede conectarse a localhost

#### Opción B: Subdominio de motusdao.org (Para producción)
```env
# En jitsi/.env (en servidor)
PUBLIC_URL=https://videochat.motusdao.org

# En Vercel (Environment Variables)
NEXT_PUBLIC_JITSI_DOMAIN=videochat.motusdao.org
```

**Configuración necesaria:**
1. Crear subdominio `videochat.motusdao.org`
2. Apuntar DNS al servidor donde corre Jitsi
3. Configurar SSL con Let's Encrypt

**Pasos:**
```bash
# En tu proveedor de DNS (donde gestionas motusdao.org)
# Agregar registro A:
videochat.motusdao.org → IP_DEL_SERVIDOR_JITSI
```

**Ventajas:**
- ✅ Funciona en producción
- ✅ Accesible desde internet
- ✅ Vercel puede conectarse
- ✅ SSL automático con Let's Encrypt

**Desventajas:**
- ⚠️ Necesitas servidor dedicado
- ⚠️ Necesitas configurar DNS

### 📋 Resumen de Dominios

| Componente | Dominio | Dónde Corre |
|------------|---------|-------------|
| **Next.js App** | `motusdao-hub.vercel.app` | Vercel (serverless) |
| **Jitsi (Local)** | `localhost:8080` | Tu computadora |
| **Jitsi (Producción)** | `videochat.motusdao.org` | Servidor dedicado |

---

## 3. ¿El JITSI_APP_SECRET es el mismo que tengo en .env.local?

### ✅ SÍ - Debe ser EXACTAMENTE igual

**Importante:** Los nombres son diferentes, pero el VALOR debe ser idéntico:

### En `jitsi/.env` (Servidor Jitsi):
```env
JWT_APP_SECRET=abc123def456...  # ← Este valor
JWT_APP_ID=motusdao
```

### En `.env.local` (Next.js):
```env
JITSI_APP_SECRET=abc123def456...  # ← MISMO valor
JITSI_APP_ID=motusdao              # ← MISMO valor
```

### ⚠️ CRÍTICO: Deben coincidir exactamente

- ✅ Mismo valor (sin espacios extra)
- ✅ Sin comillas
- ✅ Sin saltos de línea
- ✅ Case-sensitive (mayúsculas/minúsculas importan)

### 🔍 Cómo verificar que coinciden:

```bash
# Ver valor en jitsi/.env
cd jitsi
grep JWT_APP_SECRET .env

# Ver valor en .env.local
cd ..
grep JITSI_APP_SECRET .env.local

# Comparar (deben ser idénticos)
```

### 📝 Flujo de Configuración:

1. **Ejecutar setup.sh:**
   ```bash
   cd jitsi
   ./setup.sh
   ```
   Esto genera un `JWT_APP_SECRET` automáticamente

2. **Copiar el secret generado:**
   El script te mostrará algo como:
   ```
   ✅ Generated JWT secret: abc123def456...
   ⚠️  IMPORTANT: Copy this JWT secret to your Next.js .env.local:
      JITSI_APP_SECRET=abc123def456...
   ```

3. **Agregar a .env.local:**
   ```env
   JITSI_APP_SECRET=abc123def456...  # ← Copiar aquí
   JITSI_APP_ID=motusdao
   ```

---

## Resumen Rápido

### Para Empezar (Desarrollo):
1. ✅ Usa Docker en tu computadora
2. ✅ Usa `localhost:8080` (no necesitas dominio)
3. ✅ Copia el `JWT_APP_SECRET` de `jitsi/.env` a `.env.local` como `JITSI_APP_SECRET`

### Para Producción:
1. ⚠️ Necesitas servidor dedicado (DigitalOcean, AWS, etc.)
2. ⚠️ Necesitas subdominio (ej: `videochat.motusdao.org`)
3. ✅ Mismo `JITSI_APP_SECRET` en Vercel y servidor Jitsi

---

## Próximos Pasos Recomendados

### 1. Empezar con Desarrollo Local
```bash
cd jitsi
./setup.sh
# Copiar el JWT_APP_SECRET que genera
# Agregarlo a .env.local como JITSI_APP_SECRET
```

### 2. Probar Localmente
```bash
# Terminal 1: Jitsi
cd jitsi
docker-compose up -d

# Terminal 2: Next.js
npm run dev
# Visitar http://localhost:3000/videochat
```

### 3. Cuando esté listo para producción:
- Contratar servidor (DigitalOcean recomendado)
- Configurar subdominio `videochat.motusdao.org`
- Configurar variables en Vercel

