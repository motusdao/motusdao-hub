#!/bin/bash

# Script para iniciar Jitsi con túnel público (ngrok/localtunnel)
# Permite probar en "producción" desde tu computadora

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Jitsi con Túnel Público${NC}"
echo -e "${BLUE}  Para pruebas con tu equipo HOY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Jitsi is running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Jitsi no está corriendo. Iniciando...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Esperando 10 segundos para que Jitsi inicie...${NC}"
    sleep 10
else
    echo -e "${GREEN}✅ Jitsi ya está corriendo${NC}"
fi

# Check for ngrok
if command -v ngrok &> /dev/null; then
    TUNNEL_TYPE="ngrok"
    echo -e "${GREEN}✅ ngrok encontrado${NC}"
elif command -v lt &> /dev/null; then
    TUNNEL_TYPE="localtunnel"
    echo -e "${GREEN}✅ localtunnel encontrado${NC}"
else
    echo -e "${RED}❌ No se encontró ngrok ni localtunnel${NC}"
    echo ""
    echo "Instala uno de estos:"
    echo "  ngrok:     brew install ngrok"
    echo "  localtunnel: npm install -g localtunnel"
    echo ""
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Configurando túnel...${NC}"
echo ""

if [ "$TUNNEL_TYPE" = "ngrok" ]; then
    echo -e "${BLUE}Iniciando ngrok en puerto 8080...${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Copia la URL 'Forwarding' que aparece${NC}"
    echo -e "${YELLOW}   Ejemplo: https://abc123.ngrok.io${NC}"
    echo ""
    echo -e "${BLUE}Presiona Ctrl+C para detener${NC}"
    echo ""
    ngrok http 8080
else
    echo -e "${BLUE}Iniciando localtunnel en puerto 8080...${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Copia la URL que aparece${NC}"
    echo -e "${YELLOW}   Ejemplo: https://motusdao-jitsi.loca.lt${NC}"
    echo ""
    echo -e "${BLUE}Presiona Ctrl+C para detener${NC}"
    echo ""
    lt --port 8080
fi









