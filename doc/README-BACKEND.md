# QATU Backend - Installation and Execution Guide

## Node.js Backend Project with Docker

This document explains how to install and run the QATU project backend independently.

## Prerequisites

### Required Software:
- Docker version 20.x.x or higher
- Docker Compose version 2.x.x or higher
- Git to clone the repository

### Installation Verification:
```bash
docker --version
docker-compose --version
docker info
```

## Project Setup

### Clone from GitLab:
```bash
# Clone the backend repository
git clone <BACKEND_REPOSITORY_URL>
cd <BACKEND_DIRECTORY_NAME>
```

## Backend Project Structure

```
backend/
├── docker-compose.yml           ← Backend orchestration
├── docker-compose.dev.yml       ← Development configuration
├── .env.template                ← Configuration template
├── docker-helper.sh             → Automation script
├── Dockerfile                   ← Docker configuration
├── package.json                 ← Node.js dependencies
├── src/                         ← Source code
│   ├── index.js                 ← Entry point
│   ├── routes/                  ← API routes
│   ├── models/                  ← Data models
│   ├── controllers/             ← Business logic
│   ├── middleware/              ← Middlewares
│   └── infrastructure/          ← Infrastructure configuration
│       └── database/
│           └── init.sql        ← Database initialization script
├── tests/                       ← Unit tests
└── uploads/                     ← User uploaded files
```

## Step-by-Step Installation

### Step 1: Configure Environment Variables
```bash
# Copy configuration template
cp .env.template .env

# Edit configuration file
nano .env  # or preferred editor
```

### Step 2: Environment Configuration in .env
```bash
# Database Configuration
DB_USER=qatu
DB_PASSWORD=your-secure-password-here
DB_NAME=qatu
DB_HOST=db
DB_PORT=5432

# Backend Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-minimum-32-characters
UPLOAD_MAX_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

# Firebase (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREPLACE_WITH_YOUR_KEY\n-----END PRIVATE KEY-----\n"
```

### Step 3: Verify Structure
```bash
# Check key files
ls -la | grep -E "(docker-compose|\.env|Dockerfile|package.json)"

# Should show:
# docker-compose.yml
# docker-compose.dev.yml
# .env
# .env.template
# Dockerfile
# package.json
```

## Backend Execution

### Method 1: With Integrated Database (Recommended)
```bash
# Build and run backend with database
docker-compose up -d

# Check status
docker-compose ps
```

### Method 2: Backend Only (External Database)
```bash
# Edit docker-compose.yml and comment out 'db' service
# Or use backend-only file
docker-compose -f docker-compose.backend-only.yml up -d
```

### Method 3: Development
```bash
# For development with hot-reload
docker-compose -f docker-compose.dev.yml up -d
```

## Functionality Verification

### Container Verification
```bash
docker ps

# Expected output:
# CONTAINER ID   IMAGE                COMMAND                  CREATED         STATUS                    PORTS
# abc123def456   backend_backend      "node src/index.js"      2 minutes ago   Up 2 minutes (healthy)    0.0.0.0:3000->3000/tcp
# def456ghi789   postgres:15          "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes (healthy)    0.0.0.0:5432->5432/tcp
```

### API Tests
```bash
# Test main endpoint
curl http://localhost:3000/

# Expected output:
# {"name":"QATU API","version":"1.0.0"}

# Test health check
curl http://localhost:3000/api/health

# Test user endpoints
curl http://localhost:3000/api/users

# Check security headers
curl -I http://localhost:3000/
```

### Database Verification
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U qatu -d qatu

# Inside PostgreSQL:
\l                    # List databases
\dt                   # List tables
\q                    # Exit
```

## Useful Commands

### Service Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs db

# Update code
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Development and Debugging
```bash
# Enter backend container
docker-compose exec backend sh

# View files in real time
docker-compose exec backend ls -la src/

# Execute Node.js commands
docker-compose exec backend node -e "console.log(process.env)"
```

### Database Management
```bash
# Database backup
docker-compose exec db pg_dump -U qatu qatu > backup.sql

# Restore database
docker-compose exec -T db psql -U qatu qatu < backup.sql

# Remote connection
psql -h localhost -p 5432 -U qatu -d qatu
```

## Troubleshooting

### Common Issues

#### 1. "Port Already in Use"
```bash
# Kill processes on port 3000 or 5432
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

#### 2. "Permission Denied"
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

#### 3. "Database Connection Failed"
```bash
# Check database status
docker-compose exec db pg_isready -U qatu

# Check configuration
docker-compose exec backend env | grep DB_
```

#### 4. Container Unhealthy
```bash
# If backend is unhealthy but functional, ignore status
curl http://localhost:3000/
# If it responds, it's working correctly

# Or fix health check
docker-compose restart backend
```

#### 5. Build Failures
```bash
# Clean and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

## Advanced Configuration

### Additional Environment Variables
```bash
# For development
NODE_ENV=development

# For production with HTTPS
PORT=3000
HTTPS_ENABLED=true

# For logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# For cache
REDIS_URL=redis://localhost:6379

# For email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Custom Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## API Documentation

### Main Endpoints
```bash
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout

# Users
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id

# Quality Management
GET /api/quality-tests
POST /api/quality-tests
PUT /api/quality-tests/:id
DELETE /api/quality-tests/:id

# Files
POST /api/upload
GET /api/files/:filename
```

### Usage Example
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get users
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Monitoring and Logs

### Application Logs
```bash
# View all logs
docker-compose logs backend

# View logs in real time
docker-compose logs -f backend

# Save logs to file
docker-compose logs backend > backend.log
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# Detailed container information
docker inspect backend_backend
```

## Production Deployment

### Production Checklist
- [ ] Configure production environment variables
- [ ] Change default passwords
- [ ] Configure database backup
- [ ] Configure HTTPS/SSL
- [ ] Configure log rotation
- [ ] Configure monitoring
- [ ] Test backup and restore

### Production Commands
```bash
# Deployment
docker-compose -f docker-compose.production.yml up -d

# Backup
docker-compose exec db pg_dump -U qatu qatu > backup-$(date +%Y%m%d).sql

# Update
docker-compose pull
docker-compose up -d --force-recreate
```

## Support and Contribution

### Issue Reporting
- Include complete logs
- Specify Docker and OS version
- Describe steps to reproduce the issue

### Contribution
1. Fork the repository
2. Create feature branch
3. Write descriptive commits
4. Submit pull request with description

---

## Documentation Structure

This project includes the following documentation in the `doc/` directory:

- **README-BACKEND.md**: Complete installation and configuration guide
- **INSTALACION-BACKEND.sh**: Automated installation script
- **INTEGRACION-COMPLETA.md**: Frontend integration guide

### Recommended Workflow

1. **Clone repository**: `git clone <BACKEND_REPOSITORY_URL>`
2. **Go to doc directory**: `cd doc/`
3. **Review documentation**: Read README-BACKEND.md completely
4. **Install automatically**: Execute `./INSTALACION-BACKEND.sh`
5. **Verify functionality**: Follow verification steps

## Quick Reference Commands

```bash
# Complete installation (using script)
./INSTALACION-BACKEND.sh

# Manual: Start services
docker-compose up -d

# Verify API
curl http://localhost:3000/

# Verify database
docker-compose exec db pg_isready -U qatu

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps

# Stop services
docker-compose down

# Clean completely
docker-compose down -v
```

## Access URLs

- **API Backend**: http://localhost:3000
- **Database**: localhost:5432
- **Health Check**: http://localhost:3000/api/health