#!/bin/bash

# Motus Name Service - Compile Script
# Este script compila el contrato Solidity usando Hardhat

echo "🔨 Compilando Motus Name Service..."
echo ""

# Verificar que hardhat esté instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx no está instalado"
    exit 1
fi

# Agregar temporalmente type: module al package.json
echo "📝 Configurando entorno temporal..."
BACKUP_FILE=".package.json.backup"
cp package.json "$BACKUP_FILE"

# Usar jq si está disponible, sino usar sed
if command -v jq &> /dev/null; then
    jq '. + {"type": "module"}' package.json > package.json.tmp && mv package.json.tmp package.json
else
    # Agregar manualmente con sed (menos confiable pero funciona)
    sed -i.bak '2i\
  "type": "module",' package.json
fi

# Compilar
echo "🔨 Compilando contratos..."
npx hardhat compile

# Guardar el resultado
COMPILE_RESULT=$?

# Restaurar package.json original
echo "📝 Restaurando configuración..."
mv "$BACKUP_FILE" package.json

if [ $COMPILE_RESULT -eq 0 ]; then
    echo ""
    echo "✅ Compilación exitosa!"
    echo "📁 Artifacts: artifacts/contracts/MotusNameService.sol/MotusNameService.json"
else
    echo ""
    echo "❌ Error en la compilación"
    exit 1
fi




