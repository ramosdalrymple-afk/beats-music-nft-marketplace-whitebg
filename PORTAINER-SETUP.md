# Portainer Deployment Setup Guide

This guide will help you deploy the Beats NFT Marketplace to Portainer using the provided tar archive.

---

## What's Included in the Archive

The `beats-nft-marketplace.tar` file contains:
- ✅ `Dockerfile` - Multi-stage build for Next.js app
- ✅ `docker-compose.yml` - Stack configuration (3 services: app, nginx, certbot)
- ✅ `frontend/` - Complete Next.js application with health endpoint
- ✅ `nginx/` - Nginx reverse proxy configuration
- ✅ `.dockerignore` - Build optimization
- ✅ `.env.example` - Environment variable template
- ✅ `DEPLOYMENT.md` - Full deployment guide
- ✅ `QUICKSTART.md` - Local development guide

**Note**: The following are excluded from the archive (as per .dockerignore):
- ❌ `node_modules/` - Will be installed during Docker build
- ❌ `.git/` - Version control not needed in production
- ❌ `.env.local` - Local development only
- ❌ `backend/` - Move smart contracts (not needed in Docker image)

---

## Prerequisites

Before deploying to Portainer:

1. **Portainer Access**
   - Portainer CE 2.0+ installed and running
   - Admin access to create stacks

2. **Server Requirements**
   - Docker Engine 20.10+
   - Docker Compose 2.0+
   - Open ports: 80 (HTTP), 443 (HTTPS)

3. **For Production with Custom Domain** (Optional)
   - Domain name configured
   - DNS A records pointing to your server
   - Email for SSL certificate notifications

---

## Step-by-Step Deployment

### Step 1: Upload to Portainer

#### Option A: Using Portainer Web UI

1. Log in to Portainer: `https://your-portainer-url:9443`
2. Select your Docker environment
3. Go to **Stacks** → **Add Stack**
4. **Name**: `beats-nft-marketplace`
5. **Build method**: Choose **Repository** or **Upload**
   - **Repository**: Point to your Git repository
   - **Upload**: Upload the `docker-compose.yml` file

#### Option B: Upload Full Archive to Server

```bash
# Upload tar file to your server
scp beats-nft-marketplace.tar user@your-server:/opt/

# SSH into server
ssh user@your-server

# Extract the archive
cd /opt
tar -xvf beats-nft-marketplace.tar
cd beats-music-nft-marketplace-whitebg
```

### Step 2: Configure Environment Variables

In Portainer, scroll to **Environment variables** section and add:

#### Required Variables

```bash
# Application Secrets (REQUIRED)
SUI_PRIVATE_KEY=your_sui_wallet_private_key_here
JWT_SECRET=your_generated_jwt_secret_here

# Application URL (Set based on deployment type)
NEXT_PUBLIC_APP_URL=http://your-server-ip:3000
```

#### For Production with Custom Domain (Optional)

```bash
# Domain Configuration
DOMAIN_NAME=yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Optional (Have Defaults)

```bash
# Sui Blockchain Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

### Step 3: Generate Secrets

**JWT Secret:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# XyZ123abc456DEF789ghi012JKL345mnoPQR678stu==
```

**Sui Private Key:**
- Use your existing Sui wallet private key
- Make sure it's for the **testnet** network
- Format: `0x...` (hexadecimal)

### Step 4: Deploy the Stack

1. Click **Deploy the stack**
2. Wait for containers to build and start (2-5 minutes)
3. Monitor the deployment logs

Expected output:
```
Creating beats-nft-app     ... done
Creating beats-nginx       ... done
Creating beats-certbot     ... done
```

### Step 5: Verify Deployment

#### Check Container Status

In Portainer:
1. Go to **Stacks** → `beats-nft-marketplace`
2. Verify all 3 containers are **running** and **healthy**:
   - ✅ `beats-nft-app` - healthy
   - ✅ `beats-nginx` - healthy
   - ✅ `beats-certbot` - running

#### Check Logs

Click on each container to view logs:

**beats-nft-app:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**beats-nginx:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### Test the Application

**Without Domain (Local/IP Access):**
```bash
# Health check
curl http://your-server-ip/api/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}
```

**With Domain (Production):**
```bash
# Health check
curl https://yourdomain.com/api/health

# Test HTTPS
curl -I https://yourdomain.com
# Should return: 200 OK
```

**In Browser:**
- Open: `http://your-server-ip:3000` (without domain)
- Or: `https://yourdomain.com` (with domain)
- You should see the Beats NFT Marketplace homepage

---

## SSL Certificate Setup (For Production with Domain)

If deploying with a custom domain, you need to generate SSL certificates:

### Option 1: Before Stack Deployment (Recommended)

```bash
# On your server (before deploying to Portainer)
cd /opt/beats-music-nft-marketplace-whitebg

# Set environment variables
export DOMAIN_NAME=yourdomain.com
export EMAIL=your@email.com

# Run SSL setup script
chmod +x nginx/ssl-setup.sh
./nginx/ssl-setup.sh

# Then deploy the stack in Portainer
```

### Option 2: After Stack Deployment

```bash
# On your server
cd /opt/beats-music-nft-marketplace-whitebg

# Stop the stack temporarily
docker-compose down

# Generate certificates
export DOMAIN_NAME=yourdomain.com
export EMAIL=your@email.com
./nginx/ssl-setup.sh

# Restart the stack in Portainer
```

---

## Environment Variables Reference

### Complete List

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUI_PRIVATE_KEY` | ✅ Yes | - | Your Sui wallet private key |
| `JWT_SECRET` | ✅ Yes | - | JWT signing secret (base64) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | - | Public URL of your app |
| `DOMAIN_NAME` | ⚠️ Production only | `localhost` | Your domain name |
| `NEXT_PUBLIC_SUI_NETWORK` | ❌ No | `testnet` | Sui network (testnet/mainnet) |
| `NEXT_PUBLIC_SUI_RPC_URL` | ❌ No | `https://fullnode.testnet.sui.io:443` | Sui RPC endpoint |

### Example Configurations

**Testing on Server IP (No Domain):**
```env
SUI_PRIVATE_KEY=0xYourPrivateKeyHere
JWT_SECRET=XyZ123abc456DEF789ghi012JKL345mnoPQR678stu==
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
NEXT_PUBLIC_SUI_NETWORK=testnet
```

**Production with Domain:**
```env
DOMAIN_NAME=beats-nft.com
SUI_PRIVATE_KEY=0xYourPrivateKeyHere
JWT_SECRET=XyZ123abc456DEF789ghi012JKL345mnoPQR678stu==
NEXT_PUBLIC_APP_URL=https://beats-nft.com
NEXT_PUBLIC_SUI_NETWORK=testnet
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs beats-nft-app
docker logs beats-nginx
```

**Common issues:**
- Missing required environment variables
- Port 80/443 already in use
- Build errors in Dockerfile

**Solution:**
```bash
# In Portainer, update environment variables
# Then click "Update the stack"
```

### Health Check Failing

**Symptoms:**
- Container shows as "unhealthy" in Portainer

**Check:**
```bash
# SSH into server
docker exec beats-nft-app wget -qO- http://localhost:3000/api/health
```

**Solution:**
- Wait 60 seconds for app to fully start (start_period)
- Check app logs for errors
- Restart the container

### Can't Access Application

**Symptoms:**
- Browser can't connect to the app

**Check:**
```bash
# Verify containers are running
docker ps | grep beats

# Check nginx is listening
docker exec beats-nginx netstat -tulpn | grep :80
docker exec beats-nginx netstat -tulpn | grep :443
```

**Solution:**
- Verify firewall allows ports 80 and 443
- Check if other services are using these ports
- Ensure DNS is pointing to correct server IP

### SSL Certificate Issues

**Symptoms:**
- "Certificate not found" error
- "Connection not secure" in browser

**Solution:**
```bash
# Check if certificates exist
ls -la nginx/certbot/conf/live/yourdomain.com/

# If not, run SSL setup
export DOMAIN_NAME=yourdomain.com
export EMAIL=your@email.com
./nginx/ssl-setup.sh

# Restart nginx
docker restart beats-nginx
```

---

## Updating the Application

### Option 1: Update via Portainer UI

1. Go to **Stacks** → `beats-nft-marketplace`
2. Click **Editor**
3. Make your changes
4. Click **Update the stack**
5. Select "Re-pull image and redeploy"

### Option 2: Update via Git Repository

If using Git repository build:
1. Push changes to your repository
2. In Portainer: **Stacks** → `beats-nft-marketplace`
3. Click **Update the stack**
4. Enable "Re-pull and redeploy"

### Option 3: Manual Update

```bash
# SSH into server
ssh user@your-server

# Navigate to project
cd /opt/beats-music-nft-marketplace-whitebg

# Pull latest changes (if using git)
git pull origin main

# Rebuild and restart
docker-compose up -d --build app
```

---

## Monitoring & Maintenance

### View Logs

**In Portainer:**
1. Go to **Containers**
2. Click on container name
3. Click **Logs**

**Via Command Line:**
```bash
# Real-time logs
docker logs -f beats-nft-app
docker logs -f beats-nginx

# Last 100 lines
docker logs --tail 100 beats-nft-app
```

### Check Resource Usage

**In Portainer:**
- Go to **Containers**
- View CPU and memory usage graphs

**Via Command Line:**
```bash
docker stats beats-nft-app beats-nginx beats-certbot
```

### SSL Certificate Auto-Renewal

Certificates automatically renew via the `beats-certbot` container:
- Runs every 12 hours
- Checks for certificates expiring in 30 days
- Automatically renews if needed

**Manual renewal:**
```bash
docker exec beats-certbot certbot renew
docker restart beats-nginx
```

---

## Stack Configuration Summary

### Services (3 Total)

1. **beats-nft-app**
   - Next.js application
   - Port: 3000 (internal)
   - Health check: `/api/health`

2. **beats-nginx**
   - Reverse proxy
   - Ports: 80 (HTTP), 443 (HTTPS)
   - SSL termination
   - Rate limiting

3. **beats-certbot**
   - SSL certificate management
   - Auto-renewal every 12 hours

### Volumes (1 Total)

- `beats_nginx_logs` - Nginx access/error logs

### Network

- `beats-network` - Internal bridge network

---

## Security Checklist

Before going to production:

- [ ] Strong JWT secret generated (32+ characters)
- [ ] Sui private key properly secured
- [ ] SSL certificates generated and valid
- [ ] Firewall configured (only 80, 443 open)
- [ ] Portainer access secured with strong password
- [ ] Environment variables not exposed in logs
- [ ] Regular updates scheduled
- [ ] Backup plan for certificates

---

## Support Resources

- **Quick Start**: See `QUICKSTART.md` for local development
- **Full Deployment Guide**: See `DEPLOYMENT.md` for detailed instructions
- **Environment Variables**: See `.env.example` for all options
- **Health Check**: `http://your-domain/api/health`

---

## Quick Commands

```bash
# Check stack status
docker ps | grep beats

# Restart a service
docker restart beats-nft-app

# View logs
docker logs -f beats-nft-app

# Execute command in container
docker exec -it beats-nft-app sh

# Check health endpoint
curl http://localhost:3000/api/health

# Update stack (in project directory)
docker-compose up -d --build

# Stop stack
docker-compose down

# Start stack
docker-compose up -d
```

---

**Your Beats NFT Marketplace is ready for Portainer!** 🚀

Deploy with confidence - all critical files are included and configured.
