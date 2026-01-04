# 🚀 Iniciar Jitsi HOY para Probar con tu Equipo

## Solución Rápida: Docker + Túnel (5 minutos)

**No necesitas contratar un servicio.** Puedes usar Docker en tu computadora + un túnel gratuito.

---

## Paso 1: Instalar Túnel (Elige uno)

### Opción A: ngrok (Recomendado)

```bash
# macOS
brew install ngrok

# O descarga desde: https://ngrok.com/download
```

### Opción B: localtunnel (Alternativa)

```bash
npm install -g localtunnel
```

---

## Paso 2: Configurar Jitsi

```bash
cd jitsi
./setup.sh
```

Esto creará el `.env` y generará el JWT secret automáticamente.

---

## Paso 3: Iniciar Jitsi

```bash
docker-compose up -d
```

Espera 10-15 segundos para que inicie.

---

## Paso 4: Crear Túnel Público

### Con ngrok:

```bash
ngrok http 8080
```

Verás algo como:
```
Forwarding: https://abc123-def456.ngrok-free.app -> http://localhost:8080
```

**Copia la URL:** `https://abc123-def456.ngrok-free.app`

### Con localtunnel:

```bash
lt --port 8080
```

Verás algo como:
```
your url is: https://motusdao-jitsi.loca.lt
```

**Copia la URL:** `https://motusdao-jitsi.loca.lt`

---

## Paso 5: Configurar URLs

### Editar `jitsi/.env`:

```bash
nano jitsi/.env
```

Cambia:
```env
PUBLIC_URL=https://abc123-def456.ngrok-free.app
# O la URL que te dio localtunnel
```

### Editar `.env.local` (en la raíz del proyecto):

```bash
nano .env.local
```

Agrega/actualiza:
```env
NEXT_PUBLIC_JITSI_DOMAIN=abc123-def456.ngrok-free.app
JITSI_APP_ID=motusdao
JITSI_APP_SECRET=<copiar-de-jitsi/.env-JWT_APP_SECRET>
```

**⚠️ IMPORTANTE:** El `JITSI_APP_SECRET` debe ser el mismo que `JWT_APP_SECRET` en `jitsi/.env`

---

## Paso 6: Reiniciar Jitsi

```bash
cd jitsi
docker-compose restart
```

---

## Paso 7: Iniciar Next.js

```bash
npm run dev
```

---

## Paso 8: Probar

1. Visita: `http://localhost:3000/videochat`
2. Comparte la URL del túnel con tu equipo
3. Todos pueden conectarse desde internet

---

## ⚡ Script Automatizado (Más Fácil)

También puedes usar el script:

```bash
cd jitsi
./start-with-tunnel.sh
```

Este script:
- Verifica que Jitsi esté corriendo
- Detecta ngrok o localtunnel
- Inicia el túnel automáticamente

---

## 📋 Checklist Rápido

- [ ] Instalar ngrok o localtunnel
- [ ] Ejecutar `./setup.sh` en `jitsi/`
- [ ] Iniciar túnel: `ngrok http 8080` o `lt --port 8080`
- [ ] Copiar URL del túnel
- [ ] Actualizar `jitsi/.env` con `PUBLIC_URL=https://tunel-url`
- [ ] Actualizar `.env.local` con `NEXT_PUBLIC_JITSI_DOMAIN=tunel-url`
- [ ] Copiar `JWT_APP_SECRET` de `jitsi/.env` a `JITSI_APP_SECRET` en `.env.local`
- [ ] Reiniciar Jitsi: `docker-compose restart`
- [ ] Iniciar Next.js: `npm run dev`
- [ ] Probar: `http://localhost:3000/videochat`

---

## ⚠️ Notas Importantes

1. **URL cambia** (ngrok gratis): Si reinicias ngrok, la URL cambia. Necesitarás actualizar las configuraciones.

2. **Tu PC debe estar encendida**: Si apagas tu computadora, el túnel se cae.

3. **Solo para pruebas**: Esta solución es perfecta para probar HOY, pero para producción real necesitarás un servidor dedicado.

4. **URL fija**: Si quieres URL que no cambie, puedes:
   - Usar cuenta ngrok Pro ($8/mes)
   - O usar localtunnel con subdominio: `lt --port 8080 --subdomain motusdao-jitsi`

---

## 🎯 Para Producción Real (Después)

Cuando estés listo:

1. Contratar servidor (DigitalOcean ~$12/mes)
2. Configurar dominio (`videochat.motusdao.org`)
3. Migrar la configuración

---

## 🆘 Troubleshooting

### El túnel no funciona
- Verifica que Jitsi esté corriendo: `docker-compose ps`
- Verifica el puerto: `lsof -i :8080`

### No puedo conectarme desde otro dispositivo
- Verifica que la URL del túnel sea HTTPS (no HTTP)
- Asegúrate de haber actualizado `PUBLIC_URL` en `jitsi/.env`
- Reinicia Jitsi después de cambiar `.env`

### Error de autenticación
- Verifica que `JITSI_APP_SECRET` en `.env.local` sea igual a `JWT_APP_SECRET` en `jitsi/.env`
- Sin espacios, sin comillas, exactamente igual

---

## ✅ Listo!

Ahora puedes probar con tu equipo HOY sin contratar ningún servicio. 🎉






