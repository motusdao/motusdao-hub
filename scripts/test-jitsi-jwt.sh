#!/bin/bash

# Script para probar la configuración JWT de Jitsi

echo "🧪 Probando configuración JWT de Jitsi..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar variables en Next.js
echo "📋 Verificando variables en Next.js (.env.local):"
NEXTJS_ENV="$HOME/motusdao-hub/.env.local"

if [ ! -f "$NEXTJS_ENV" ]; then
    echo -e "${RED}❌ No se encontró .env.local${NC}"
    exit 1
fi

JITSI_APP_ID=$(grep "^JITSI_APP_ID=" "$NEXTJS_ENV" | cut -d= -f2)
JITSI_APP_SECRET=$(grep "^JITSI_APP_SECRET=" "$NEXTJS_ENV" | cut -d= -f2)

if [ -z "$JITSI_APP_ID" ] || [ -z "$JITSI_APP_SECRET" ]; then
    echo -e "${RED}❌ Variables JITSI_APP_ID o JITSI_APP_SECRET no encontradas${NC}"
    exit 1
fi

echo -e "${GREEN}✅ JITSI_APP_ID: $JITSI_APP_ID${NC}"
echo -e "${GREEN}✅ JITSI_APP_SECRET: ${JITSI_APP_SECRET:0:20}...${NC}"
echo ""

# Verificar variables en servidor Jitsi
echo "📋 Verificando variables en servidor Jitsi:"
JITSI_DIR="$HOME/jitsi-meet"
JITSI_ENV="$JITSI_DIR/.env"

if [ ! -f "$JITSI_ENV" ]; then
    echo -e "${RED}❌ No se encontró .env en $JITSI_DIR${NC}"
    exit 1
fi

JWT_APP_ID=$(grep "^JWT_APP_ID=" "$JITSI_ENV" | cut -d= -f2)
JWT_APP_SECRET=$(grep "^JWT_APP_SECRET=" "$JITSI_ENV" | cut -d= -f2)

if [ -z "$JWT_APP_ID" ] || [ -z "$JWT_APP_SECRET" ]; then
    echo -e "${RED}❌ Variables JWT_APP_ID o JWT_APP_SECRET no encontradas${NC}"
    exit 1
fi

echo -e "${GREEN}✅ JWT_APP_ID: $JWT_APP_ID${NC}"
echo -e "${GREEN}✅ JWT_APP_SECRET: ${JWT_APP_SECRET:0:20}...${NC}"
echo ""

# Comparar valores
echo "🔍 Comparando valores..."
echo ""

if [ "$JITSI_APP_ID" != "$JWT_APP_ID" ]; then
    echo -e "${RED}❌ ERROR: JITSI_APP_ID ($JITSI_APP_ID) no coincide con JWT_APP_ID ($JWT_APP_ID)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ JITSI_APP_ID coincide con JWT_APP_ID${NC}"
fi

if [ "$JITSI_APP_SECRET" != "$JWT_APP_SECRET" ]; then
    echo -e "${RED}❌ ERROR: JITSI_APP_SECRET no coincide con JWT_APP_SECRET${NC}"
    echo "   Next.js: ${JITSI_APP_SECRET:0:20}..."
    echo "   Servidor: ${JWT_APP_SECRET:0:20}..."
    exit 1
else
    echo -e "${GREEN}✅ JITSI_APP_SECRET coincide con JWT_APP_SECRET${NC}"
fi

echo ""
echo -e "${GREEN}✅ ¡Todas las variables coinciden correctamente!${NC}"
echo ""
echo "📝 Próximos pasos:"
echo "1. Asegúrate de que el servidor Jitsi esté corriendo: cd ~/jitsi-meet && docker-compose ps"
echo "2. Reinicia el servidor si cambiaste variables: docker-compose restart"
echo "3. Prueba en Next.js: npm run dev y navega a /videochat"
echo "4. Abre la consola del navegador (F12) para ver los logs"










