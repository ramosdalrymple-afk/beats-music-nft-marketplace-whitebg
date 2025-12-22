# Beats NFT Marketplace - Deployment Guide

Complete guide for deploying your Next.js application with Nginx reverse proxy and SSL on Portainer.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Testing](#local-testing)
3. [DNS Configuration](#dns-configuration)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Portainer Deployment](#portainer-deployment)
6. [Environment Variables](#environment-variables)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## Prerequisites

### Required Items

- **Domain Name**: Your custom domain (e.g., `beats-nft.com`) - *For production only*
- **Server**: Linux server with Docker and Portainer installed - *For production only*
- **DNS Access**: Ability to configure DNS A records - *For production only*
- **Email**: Valid email for Let's Encrypt certificate notifications - *For production only*
- **Local Development**: Node.js 18+ and npm

### Server Requirements (Production)

- Docker Engine 20.10+
- Docker Compose 2.0+
- Portainer CE 2.0+
- Open ports: 80 (HTTP), 443 (HTTPS)

---

## Local Testing

### Step 1: Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 2: Start Development Server

```bash
# Run development server
npm run dev
```

### Step 3: Access Application

Open your browser and navigate to: `http://localhost:3000`

You should see the Beats NFT Marketplace homepage.

### Step 4: Test Features

- Connect your Sui wallet
- Browse NFT listings on `/beats-tap`
- Check your inventory on `/inventory`
- Explore the marketplace on `/marketplace`
- Test health endpoint: `http://localhost:3000/api/health`

### Step 5: Build for Production (Optional Local Test)

```bash
# Build the application
npm run build

# Start production server
npm run start

# Access at http://localhost:3000
```

---

## DNS Configuration

**Note**: Only needed for production deployment with custom domain.

### Step 1: Configure DNS A Records

Point your domain to your server's IP address:

```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 2: Verify DNS Propagation

```bash
# Check if DNS is propagated
nslookup yourdomain.com
dig yourdomain.com

# Should return your server's IP address
```

**Wait for DNS propagation** (can take 5 minutes to 48 hours depending on your DNS provider).

---

## SSL Certificate Setup

**Note**: Only needed for production deployment with HTTPS.

### Option A: Automated Setup (Recommended)

1. **Upload Files to Server**

```bash
# On your local machine
scp -r . user@your-server:/opt/beats-nft-marketplace/
```

2. **Set Environment Variables**

```bash
# SSH into your server
ssh user@your-server

# Navigate to project directory
cd /opt/beats-nft-marketplace

# Set domain and email
export DOMAIN_NAME=yourdomain.com
export EMAIL=your@email.com
```

3. **Run SSL Setup Script**

```bash
# Make script executable
chmod +x nginx/ssl-setup.sh

# Run the script
./nginx/ssl-setup.sh
```

The script will:
- Create necessary directories
- Download TLS parameters
- Request SSL certificates from Let's Encrypt
- Set up auto-renewal

### Option B: Manual Certificate Setup

If the automated script fails, use this manual approach:

1. **Create Certificate Directories**

```bash
mkdir -p ./nginx/certbot/conf
mkdir -p ./nginx/certbot/www
```

2. **Start Temporary Nginx for ACME Challenge**

```bash
# Create temporary nginx config
cat > nginx-temp.conf << EOF
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }
}
EOF

# Start temporary nginx
docker run -d \
    --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/nginx/certbot/www:/var/www/certbot \
    nginx:1.25-alpine
```

3. **Request Certificate**

```bash
docker run --rm \
    -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/nginx/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your@email.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com \
    -d www.yourdomain.com
```

4. **Clean Up**

```bash
docker stop nginx-temp
docker rm nginx-temp
rm nginx-temp.conf
```

---

## Portainer Deployment

### Step 1: Access Portainer

1. Navigate to your Portainer instance: `https://your-portainer-url:9443`
2. Log in with your credentials
3. Select your Docker environment

### Step 2: Create the Stack

1. Click **Stacks** → **Add Stack**
2. **Name**: `beats-nft-marketplace`
3. **Build method**: Choose one:
   - **Upload**: Upload `docker-compose.yml`
   - **Repository**: Link to your Git repository
   - **Web editor**: Paste the contents of `docker-compose.yml`

### Step 3: Configure Environment Variables

Scroll to **Environment variables** and add:

```bash
# Domain Configuration (Required for production)
DOMAIN_NAME=yourdomain.com

# Sui Blockchain Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Application Secrets
SUI_PRIVATE_KEY=your_sui_private_key_here
JWT_SECRET=your_jwt_secret_generate_with_openssl

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate Strong Secrets:**

```bash
# Generate JWT secret
openssl rand -base64 32

# Or use
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 4: Deploy

1. Click **Deploy the stack**
2. Wait for all services to start (1-2 minutes)
3. Monitor the logs for any errors

---

## Environment Variables

### Complete Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DOMAIN_NAME` | Your domain name | `beats-nft.com` | Production only |
| `SUI_PRIVATE_KEY` | Sui wallet private key | `0x...` | Yes |
| `JWT_SECRET` | JWT signing secret | `base64string` | Yes |
| `NEXT_PUBLIC_SUI_NETWORK` | Sui network (testnet/mainnet) | `testnet` | Yes (has default) |
| `NEXT_PUBLIC_SUI_RPC_URL` | Sui RPC endpoint | `https://fullnode.testnet.sui.io:443` | Yes (has default) |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://yourdomain.com` | Yes |

---

## Verification

### Check Service Status

```bash
# View all containers
docker ps

# Should see:
# - beats-nft-app
# - beats-nginx
# - beats-certbot
```

### Check Logs

```bash
# Application logs
docker logs beats-nft-app

# Nginx logs
docker logs beats-nginx

# Follow logs in real-time
docker logs -f beats-nft-app
```

### Test Endpoints

```bash
# Health check
curl https://yourdomain.com/api/health

# Should return: {"status":"ok","timestamp":"...","uptime":...}

# SSL certificate check
curl -vI https://yourdomain.com 2>&1 | grep -i "SSL certificate verify ok"

# Test redirect HTTP → HTTPS
curl -I http://yourdomain.com
# Should return: 301 Moved Permanently
```

### Access Your Application

Open in browser: `https://yourdomain.com`

You should see:
- ✅ Green padlock (valid SSL)
- ✅ Your Next.js application loads
- ✅ No certificate warnings

---

## Troubleshooting

### Issue: "502 Bad Gateway"

**Cause**: Next.js app not ready or crashed

**Solution**:
```bash
# Check app logs
docker logs beats-nft-app

# Restart app container
docker restart beats-nft-app

# Rebuild if needed
docker-compose up -d --build app
```

### Issue: "SSL Certificate Not Found"

**Cause**: Certificates not generated or wrong path

**Solution**:
```bash
# Check if certificates exist
ls -la ./nginx/certbot/conf/live/yourdomain.com/

# Re-run SSL setup
./nginx/ssl-setup.sh

# Or request manually (see Option B above)
```

### Issue: "DNS Not Resolving"

**Cause**: DNS not propagated yet

**Solution**:
```bash
# Check DNS
nslookup yourdomain.com

# Wait and try again (can take up to 48h)
# Use DNS checker: https://dnschecker.org
```

### Issue: "Port Already in Use"

**Cause**: Another service using port 80/443

**Solution**:
```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop the conflicting service
sudo systemctl stop apache2
# or
sudo systemctl stop nginx
```

### Issue: "Health Check Failing"

**Cause**: Health endpoint not responding

**Solution**:
```bash
# Test health endpoint directly
docker exec beats-nft-app wget -qO- http://localhost:3000/api/health

# Check if Next.js is running
docker exec beats-nft-app ps aux | grep node

# Restart container
docker restart beats-nft-app
```

---

## Maintenance

### SSL Certificate Renewal

Certificates auto-renew via the `certbot` container (runs every 12 hours).

**Manual renewal:**
```bash
docker exec beats-certbot certbot renew
docker restart beats-nginx
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose up -d --build app

# Or in Portainer: Click "Update the stack"
```

### View Nginx Access Logs

```bash
# Real-time access logs
docker exec beats-nginx tail -f /var/log/nginx/access.log

# Error logs
docker exec beats-nginx tail -f /var/log/nginx/error.log
```

### Docker Local Testing

```bash
# Build image
docker build -t beats-nft-app:test .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUI_NETWORK=testnet \
  -e NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443 \
  beats-nft-app:test

# Test with docker-compose (local)
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## Architecture Overview

```
Internet
   ↓
[Port 80/443]
   ↓
Nginx Reverse Proxy
   ├── SSL Termination
   ├── Rate Limiting
   ├── Caching
   └── Headers
   ↓
Next.js App (Port 3000)
   ↓
Sui Blockchain (Testnet)
```

**Security Features:**
- ✅ HTTPS/TLS 1.2-1.3 only
- ✅ HSTS enabled
- ✅ Rate limiting (10 req/s app, 20 req/s API)
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Non-root container users
- ✅ Internal Docker network

**Data Flow:**
- All NFT data fetched directly from Sui blockchain
- No database required (blockchain is the source of truth)
- Frontend uses @mysten/sui.js for blockchain interactions

---

## Support

For issues:
1. Check logs: `docker logs beats-nft-app`
2. Review this guide's troubleshooting section
3. Verify environment variables in Portainer
4. Check DNS and firewall settings
5. Test health endpoint: `/api/health`

---

## Deployment Checklist

### Local Development
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured
- [ ] Development server running (`npm run dev`)
- [ ] Application accessible at localhost:3000
- [ ] Health endpoint working

### Production Deployment
- [ ] DNS A records configured
- [ ] SSL certificates obtained
- [ ] Environment variables set in Portainer
- [ ] Stack deployed successfully
- [ ] All containers running (3 services: app, nginx, certbot)
- [ ] HTTPS working with green padlock
- [ ] Application accessible via custom domain
- [ ] Sui testnet integration working
- [ ] Health checks passing

**Your deployment is complete!** 🚀
