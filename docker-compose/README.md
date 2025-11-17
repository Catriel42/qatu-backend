# Docker Compose Configuration

## Archivos

- `compose.yml` - Backend + Base de datos PostgreSQL
- `docker-compose.frontend.yml` - Frontend + Load balancer Nginx
- `nginx/nginx.conf` - Configuración de Nginx con SSL
- `certs/` - Certificados SSL
- `scripts/generate-certs.sh` - Script para generar certificados

## Uso

1. **Levantar servicios:**
   ```bash
   # Backend + Base de datos
   docker-compose -f compose.yml up -d
   
   # Frontend + Load balancer
   docker-compose -f docker-compose.frontend.yml up -d
   ```

2. **Acceder:**
   - HTTP: http://localhost:8080/
   - HTTPS: https://localhost:8443/
   - API: http://localhost:8080/api/

3. **Detener:**
   ```bash
   docker-compose -f compose.yml down
   docker-compose -f docker-compose.frontend.yml down
   ```
