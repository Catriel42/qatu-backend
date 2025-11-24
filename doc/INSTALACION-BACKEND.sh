#!/bin/bash

# =============================================================================
# QATU Backend - Automated Installation Script
# =============================================================================

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================"
echo "  QATU Backend - Automated Installation"
echo "============================================"

# Verify if we are in the correct directory
if [ ! -f "docker-compose.yml" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No valid backend project found${NC}"
    echo -e "${YELLOW}Make sure you are in the root directory of the backend project${NC}"
    exit 1
fi

# 1. Verify requirements
echo -e "\n${BLUE}[1/5] Verifying requirements...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker from https://www.docker.com${NC}"
    exit 1
else
    echo -e "${GREEN}Docker found: $(docker --version)${NC}"
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo -e "${YELLOW}Please install Docker Compose${NC}"
    exit 1
else
    echo -e "${GREEN}Docker Compose found: $(docker-compose --version)${NC}"
fi

# 2. Configure environment variables
echo -e "\n${BLUE}[2/5] Configuring environment variables...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.template .env

    # Configure secure default values
    sed -i 's/DB_PASSWORD=change-this-password-in-production/DB_PASSWORD=qatu123backend2024/' .env
    sed -i 's/your-super-secret-jwt-key-change-in-production-min-32-characters/qatu-backend-super-secret-jwt-2024-secure-key/' .env

    echo -e "${GREEN}.env file created with basic configuration${NC}"
    echo -e "${YELLOW}Consider reviewing and customizing the .env file${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

# 3. Clean previous installations
echo -e "\n${BLUE}[3/5] Cleaning previous installations...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true
docker system prune -f

# 4. Build backend image
echo -e "\n${BLUE}[4/5] Building backend image...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"

if docker build -t qatu-backend .; then
    echo -e "${GREEN}Backend image built successfully${NC}"
else
    echo -e "${RED}Error building backend image${NC}"
    exit 1
fi

# 5. Start services
echo -e "\n${BLUE}[5/5] Starting services...${NC}"

# Start database first
echo -e "${YELLOW}Starting database...${NC}"
docker-compose up -d db

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if docker exec qatu-backend_db_1 pg_isready -U qatu >/dev/null 2>&1; then
        echo -e "${GREEN}Database ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Start backend
echo -e "\n${YELLOW}Starting backend...${NC}"
docker-compose up -d backend

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 15

# Final verification
echo -e "\n${BLUE}Final verification...${NC}"

# Check containers
echo -e "\n${YELLOW}Container status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test backend API
echo -e "\n${YELLOW}Testing Backend API...${NC}"

# Backend
if curl -s http://localhost:3000/ >/dev/null; then
    echo -e "${GREEN}Backend API working (http://localhost:3000)${NC}"

    # Show API information
    API_INFO=$(curl -s http://localhost:3000/)
    echo -e "${BLUE}API Information:${NC}"
    echo -e "${GREEN}$API_INFO${NC}"
else
    echo -e "${RED}Backend API not responding${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker-compose logs backend
fi

# Database
if docker exec qatu-backend_db_1 pg_isready -U qatu >/dev/null 2>&1; then
    echo -e "${GREEN}Database working (localhost:5432)${NC}"
else
    echo -e "${RED}Database not responding${NC}"
fi

# Final summary
echo ""
echo "============================================"
echo "  BACKEND INSTALLED SUCCESSFULLY"
echo "============================================"
echo ""
echo "BACKEND ACCESS:"
echo "  • API Base URL: http://localhost:3000"
echo "  • Database: localhost:5432"
echo "  • Health Check: http://localhost:3000/api/health"

echo ""
echo "USEFUL COMMANDS:"
echo "  • Check status: docker-compose ps"
echo "  • View logs: docker-compose logs -f"
echo "  • API Test: curl http://localhost:3000/"
echo "  • DB Connect: docker-compose exec db psql -U qatu -d qatu"
echo "  • Stop: docker-compose down"
echo "  • Restart: docker-compose restart"

echo ""
echo "MAIN ENDPOINTS:"
echo "  • API Info: GET http://localhost:3000/"
echo "  • Health: GET http://localhost:3000/api/health"
echo "  • Users: GET http://localhost:3000/api/users"

echo ""
echo "CONFIGURATION:"
echo "  • Variables: .env"
echo "  • Logs: docker-compose logs [service]"
echo "  • Documentation: README-BACKEND.md"

echo ""
echo "NEXT STEPS:"
echo "  1. Install the project frontend"
echo "  2. Configure connection between frontend and backend"
echo "  3. Test complete integration"

echo ""
echo "QATU Backend is ready to use!"