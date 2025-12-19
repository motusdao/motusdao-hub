#!/bin/bash

# Script para habilitar JWT en el servidor Jitsi

JITSI_DIR="$HOME/jitsi-meet"
DOCKER_COMPOSE="$JITSI_DIR/docker-compose.yml"

if [ ! -f "$DOCKER_COMPOSE" ]; then
    echo "❌ No se encontró docker-compose.yml en $JITSI_DIR"
    exit 1
fi

echo "🔧 Habilitando JWT en docker-compose.yml..."
echo ""

# Crear backup
cp "$DOCKER_COMPOSE" "$DOCKER_COMPOSE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup creado"

# Actualizar ENABLE_AUTH=0 a ENABLE_AUTH=1
sed -i '' 's/ENABLE_AUTH=0/ENABLE_AUTH=1/g' "$DOCKER_COMPOSE"
echo "✅ ENABLE_AUTH actualizado a 1"

# Actualizar AUTH_TYPE=anonymous a AUTH_TYPE=jwt
sed -i '' 's/AUTH_TYPE=anonymous/AUTH_TYPE=jwt/g' "$DOCKER_COMPOSE"
echo "✅ AUTH_TYPE actualizado a jwt"

# Agregar variables JWT si no existen
if ! grep -q "JWT_APP_ID" "$DOCKER_COMPOSE"; then
    # Buscar la sección de environment en prosody y agregar JWT variables
    # Esto es más complejo, mejor hacerlo manualmente o con un script más sofisticado
    echo "⚠️  Necesitas agregar manualmente JWT_APP_ID y JWT_APP_SECRET a las variables de entorno en docker-compose.yml"
    echo "   Busca la sección 'environment:' en 'prosody:' y agrega:"
    echo "   - JWT_APP_ID=\${JWT_APP_ID}"
    echo "   - JWT_APP_SECRET=\${JWT_APP_SECRET}"
fi

echo ""
echo "✅ Cambios aplicados. Ahora necesitas:"
echo "1. Verificar que docker-compose.yml tenga JWT_APP_ID y JWT_APP_SECRET en las variables de entorno"
echo "2. Reiniciar el servidor: cd ~/jitsi-meet && docker-compose restart"
echo ""
echo "📝 Para verificar, ejecuta: ./scripts/test-jitsi-jwt.sh"


