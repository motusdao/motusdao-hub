#!/bin/bash

# Script para verificar y corregir configuración de Jitsi

echo "🔍 Verificando configuración de Jitsi..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si existe el directorio de Jitsi
JITSI_DIR="$HOME/jitsi-meet"
if [ ! -d "$JITSI_DIR" ]; then
    echo -e "${RED}❌ No se encontró el directorio de Jitsi en $JITSI_DIR${NC}"
    echo "   Por favor, crea el directorio y configura docker-compose.yml primero"
    exit 1
fi

echo -e "${GREEN}✅ Directorio de Jitsi encontrado: $JITSI_DIR${NC}"
echo ""

# Verificar archivo .env del servidor Jitsi
ENV_FILE="$JITSI_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env en el servidor Jitsi${NC}"
    echo "   Creando archivo .env con valores por defecto..."
    cat > "$ENV_FILE" << EOF
# JWT Configuration
JWT_APP_SECRET=c6b107c1299735a3f3b24c518febdc72de379d2181777d671603c78da6836ab1
JWT_APP_ID=motusdao

# JVB Authentication
JVB_AUTH_PASSWORD=$(openssl rand -hex 16)
JVB_AUTH_TOKEN=$(openssl rand -hex 16)
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

echo ""
echo "📋 Configuración actual del servidor Jitsi:"
echo "----------------------------------------"
if [ -f "$ENV_FILE" ]; then
    echo "JWT_APP_ID: $(grep JWT_APP_ID "$ENV_FILE" | cut -d= -f2 || echo 'NO CONFIGURADO')"
    echo "JWT_APP_SECRET: $(grep JWT_APP_SECRET "$ENV_FILE" | cut -d= -f2 | cut -c1-20 || echo 'NO CONFIGURADO')..."
fi

echo ""
echo "📋 Configuración actual de Next.js:"
echo "----------------------------------------"
NEXTJS_ENV="$HOME/motusdao-hub/.env.local"
if [ -f "$NEXTJS_ENV" ]; then
    echo "JITSI_APP_ID: $(grep JITSI_APP_ID "$NEXTJS_ENV" | cut -d= -f2 || echo 'NO CONFIGURADO')"
    echo "JITSI_APP_SECRET: $(grep JITSI_APP_SECRET "$NEXTJS_ENV" | cut -d= -f2 | cut -c1-20 || echo 'NO CONFIGURADO')..."
else
    echo -e "${RED}❌ No se encontró .env.local en Next.js${NC}"
fi

echo ""
echo "🔧 Verificando docker-compose.yml..."
if [ -f "$JITSI_DIR/docker-compose.yml" ]; then
    # Verificar si tiene ENABLE_AUTH y AUTH_TYPE configurados
    if grep -q "ENABLE_AUTH" "$JITSI_DIR/docker-compose.yml"; then
        echo -e "${GREEN}✅ docker-compose.yml tiene configuración de autenticación${NC}"
    else
        echo -e "${YELLOW}⚠️  docker-compose.yml podría necesitar configuración de autenticación${NC}"
    fi
else
    echo -e "${RED}❌ No se encontró docker-compose.yml${NC}"
fi

echo ""
echo "📝 Próximos pasos:"
echo "1. Verifica que JWT_APP_SECRET en el servidor Jitsi sea igual a JITSI_APP_SECRET en Next.js"
echo "2. Verifica que JWT_APP_ID en el servidor Jitsi sea igual a JITSI_APP_ID en Next.js"
echo "3. Reinicia el servidor Jitsi: cd $JITSI_DIR && docker-compose restart"
echo "4. Reinicia Next.js: npm run dev"



