#!/bin/bash

# Jitsi Meet Docker Setup Script
# This script helps you set up a self-hosted Jitsi Meet server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Jitsi Meet Docker Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Configuration Steps:${NC}"
echo ""
echo "1. Edit the .env file with your configuration:"
echo "   - Set PUBLIC_URL (e.g., http://localhost:8080 for local, https://videochat.motusdao.org for production)"
echo "   - Generate JWT_APP_SECRET: openssl rand -hex 32"
echo "   - Set JWT_APP_ID (e.g., motusdao)"
echo ""
echo "2. For production with SSL:"
echo "   - Set ENABLE_LETSENCRYPT=1"
echo "   - Set LETSENCRYPT_DOMAIN to your domain"
echo "   - Set LETSENCRYPT_EMAIL to your email"
echo ""
echo -e "${BLUE}Press Enter to continue after configuring .env...${NC}"
read

# Generate JWT secret if not set
if grep -q "your-secret-here" .env; then
    echo ""
    echo -e "${YELLOW}🔐 Generating JWT secret...${NC}"
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_APP_SECRET=your-secret-here-min-32-characters/JWT_APP_SECRET=$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_APP_SECRET=your-secret-here-min-32-characters/JWT_APP_SECRET=$JWT_SECRET/" .env
    fi
    
    echo -e "${GREEN}✅ Generated JWT secret: ${JWT_SECRET:0:20}...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Copy this JWT secret to your Next.js .env.local:${NC}"
    echo "   JITSI_APP_SECRET=$JWT_SECRET"
    echo "   JITSI_APP_ID=motusdao"
    echo ""
fi

# Create config directory
echo -e "${BLUE}📁 Creating configuration directory...${NC}"
mkdir -p jitsi-meet-cfg/{web,prosody,jvb}
echo -e "${GREEN}✅ Configuration directory created${NC}"
echo ""

# Start Jitsi
echo -e "${BLUE}🚀 Starting Jitsi Meet server...${NC}"
echo ""

# Use docker-compose or docker compose depending on what's available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

$COMPOSE_CMD up -d

echo ""
echo -e "${GREEN}✅ Jitsi Meet server is starting!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Wait a few moments for services to start (check with: $COMPOSE_CMD ps)"
echo ""
echo "2. View logs: $COMPOSE_CMD logs -f"
echo ""
echo "3. For local development, access at: http://localhost:8080"
echo ""
echo "4. Update your Next.js .env.local with:"
echo "   NEXT_PUBLIC_JITSI_DOMAIN=localhost:8080  (for local)"
echo "   JITSI_APP_SECRET=<the secret generated above>"
echo "   JITSI_APP_ID=motusdao"
echo ""
echo "5. Test the setup:"
echo "   - Open http://localhost:8080 in your browser"
echo "   - Create a test room"
echo "   - Join from multiple devices"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"

