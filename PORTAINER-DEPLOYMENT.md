# Portainer Deployment Guide - Beats NFT Marketplace

This guide covers deploying the Beats NFT Marketplace to Portainer with stack management.

## 🚀 Quick Deployment to Portainer

### Step 1: Prepare Your Stack

1. **Login to Portainer**
   - Access your Portainer instance
   - Navigate to **Stacks** → **Add Stack**

2. **Name Your Stack**
   ```
   beats-nft-marketplace
   ```

### Step 2: Upload Configuration

You have two options:

#### Option A: Git Repository (Recommended)

1. Select **Git Repository**
2. Enter your repository URL
3. Set **Compose path**: `docker-compose.yml`
4. Add environment variables (see Step 3)

#### Option B: Web Editor

1. Select **Web editor**
2. Copy the contents of `docker-compose.yml`
3. Paste into the editor
4. Add environment variables (see Step 3)

### Step 3: Configure Environment Variables

In Portainer, add these environment variables:

```env
# Domain Configuration
DOMAIN_NAME=your-domain.com

# Sui Blockchain
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security Secrets (IMPORTANT!)
JWT_SECRET=your_generated_jwt_secret_here
SUI_PRIVATE_KEY=your_sui_private_key_here
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Step 4: Deploy the Stack

1. Click **Deploy the stack**
2. Wait for containers to start
3. Check container logs for any issues

## 🔧 Common Issues and Fixes

### Issue 1: Unhealthy Container (ECONNREFUSED)

**Error:**
```
Error: connect ECONNREFUSED ::1:3000
```

**Cause:** Healthcheck using IPv6 localhost instead of IPv4

**Fix:** ✅ Already fixed in updated Dockerfile and docker-compose.yml
- Changed from `localhost` to `127.0.0.1`
- Increased `start_period` to 60s
- Increased `retries` to 5

### Issue 2: Container Fails to Start

**Check logs in Portainer:**
```
Container → Logs → View full logs
```

**Common causes:**
1. Missing environment variables
2. Port conflicts (80/443 already in use)
3. Insufficient memory

**Solutions:**
```yaml
# If ports are in use, change them in docker-compose.yml:
ports:
  - "8080:80"   # Use 8080 instead of 80
  - "8443:443"  # Use 8443 instead of 443
```

### Issue 3: Build Failures

**Error:** npm install fails or build crashes

**Solutions:**
1. **Increase container memory** in Portainer:
   - Stack → Edit → Resource Limits
   - Set memory to at least 2GB

2. **Check build logs:**
   ```
   Container → Console → Select shell → bash
   ```

### Issue 4: Environment Variables Not Working

**In Portainer:**
1. Stack → Editor
2. Verify environment variables are set correctly
3. **Important:** Remove quotes around values
   ```yaml
   # ❌ Wrong
   DOMAIN_NAME: "example.com"

   # ✅ Correct
   DOMAIN_NAME: example.com
   ```

### Issue 5: SSL Certificate Issues

**For production with domain:**

1. **First deployment** - Use HTTP first:
   ```bash
   # In Portainer console
   docker-compose run --rm certbot certonly --webroot \
     --webroot-path=/var/www/certbot \
     --email your-email@example.com \
     --agree-tos \
     -d your-domain.com
   ```

2. **After certificate obtained** - Restart nginx:
   ```bash
   docker-compose restart nginx
   ```

## 📊 Monitoring in Portainer

### Check Container Status

1. Navigate to **Containers**
2. Check health status indicators:
   - 🟢 Green = Healthy
   - 🟡 Yellow = Starting
   - 🔴 Red = Unhealthy

### View Logs

**Real-time logs:**
```
Container → Logs → Auto-refresh ON
```

**Specific service logs:**
- `beats-nft-app` - Application logs
- `beats-nginx` - Web server logs
- `beats-certbot` - SSL certificate logs

### Resource Usage

**Monitor in Portainer:**
```
Containers → Container name → Stats
```

**Recommended resources:**
- CPU: 1-2 cores
- Memory: 2-4 GB
- Storage: 10 GB

## 🔄 Updating the Application

### Method 1: Portainer UI (Easiest)

1. **Stack → Editor**
2. Click **Pull and redeploy**
3. Wait for update to complete

### Method 2: Manual Update

1. **Stop the stack:**
   ```
   Stack → Stop
   ```

2. **Update from Git:**
   - If using Git repository, just click **Pull latest**

3. **Rebuild and start:**
   ```
   Stack → Start
   ```

### Method 3: Force Rebuild

If you made code changes:

1. **Remove the stack:**
   ```
   Stack → Remove
   ```

2. **Re-deploy** following Step 1-4 above

## 🛡️ Security Best Practices

### 1. Environment Variables

**Never commit these to Git:**
- `.env`
- `.env.local`
- `.env.production`

**Store securely in Portainer:**
- Use Portainer's environment variable UI
- Or use Portainer secrets

### 2. Secrets Management

**Create secrets in Portainer:**
```
Secrets → Add secret
Name: sui_private_key
Secret: your_private_key_here
```

**Reference in docker-compose.yml:**
```yaml
services:
  app:
    secrets:
      - sui_private_key
    environment:
      SUI_PRIVATE_KEY_FILE: /run/secrets/sui_private_key

secrets:
  sui_private_key:
    external: true
```

### 3. Network Security

**Restrict access:**
```yaml
networks:
  beats-network:
    driver: bridge
    internal: false  # Set to true for internal-only access
```

## 📝 Portainer Stack Template

Here's the complete stack configuration for Portainer:

```yaml
version: '3.8'

services:
  app:
    image: your-registry/beats-nft-marketplace:latest  # Or build from source
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SUI_NETWORK: ${NEXT_PUBLIC_SUI_NETWORK:-testnet}
    container_name: beats-nft-app
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SUI_NETWORK: ${NEXT_PUBLIC_SUI_NETWORK:-testnet}
      NEXT_PUBLIC_SUI_RPC_URL: ${NEXT_PUBLIC_SUI_RPC_URL:-https://fullnode.testnet.sui.io:443}
      SUI_PRIVATE_KEY: ${SUI_PRIVATE_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-https://${DOMAIN_NAME}}
    networks:
      - beats-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://127.0.0.1:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  nginx:
    image: nginx:1.25-alpine
    container_name: beats-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certbot/conf:/etc/letsencrypt:ro
      - ./nginx/certbot/www:/var/www/certbot:ro
      - nginx_logs:/var/log/nginx
    environment:
      DOMAIN_NAME: ${DOMAIN_NAME:-localhost}
    depends_on:
      app:
        condition: service_healthy
    networks:
      - beats-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s

volumes:
  nginx_logs:
    driver: local

networks:
  beats-network:
    driver: bridge
```

## 🔍 Troubleshooting Commands

**Access container shell:**
```bash
# In Portainer Console
/bin/sh  # or /bin/bash
```

**Check app logs:**
```bash
# View last 100 lines
docker logs beats-nft-app --tail 100

# Follow logs
docker logs beats-nft-app -f
```

**Test health endpoint:**
```bash
# From inside container
wget -O- http://127.0.0.1:3000/api/health

# From host
curl http://localhost:3000/api/health
```

**Restart specific service:**
```bash
docker-compose restart app
docker-compose restart nginx
```

## ✅ Deployment Checklist

Before deploying to Portainer:

- [ ] Environment variables configured
- [ ] JWT_SECRET generated (use `openssl rand -base64 32`)
- [ ] SUI_PRIVATE_KEY added
- [ ] DOMAIN_NAME set (or use localhost for testing)
- [ ] Ports 80 and 443 available (or changed)
- [ ] DNS records configured (for production)
- [ ] SSL certificates obtained (for production)
- [ ] Health check endpoint verified (`/api/health`)
- [ ] Resource limits appropriate for your server

## 📞 Support

**Check health status:**
```bash
docker ps
docker inspect beats-nft-app | grep -A 10 Health
```

**View all container logs:**
```bash
docker-compose logs -f --tail=100
```

**Reset everything:**
```bash
docker-compose down -v
docker system prune -a
# Then redeploy
```

## 🎯 Production Deployment Tips

1. **Use a reverse proxy** (nginx is included)
2. **Enable SSL/TLS** with Let's Encrypt (certbot is included)
3. **Set up monitoring** via Portainer dashboards
4. **Configure backups** for volumes (especially SSL certs)
5. **Use secrets** instead of environment variables for sensitive data
6. **Set resource limits** to prevent resource exhaustion
7. **Enable auto-restart** (`restart: unless-stopped`)
8. **Monitor logs** regularly via Portainer

---

**Need help?** Check the main [README](README.md) or [Docker Deployment Guide](DOCKER-DEPLOYMENT.md)
