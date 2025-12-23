# Docker Deployment Guide - Beats NFT Marketplace

This guide explains how to build and deploy the Beats NFT Marketplace using Docker.

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd beats-music-nft-marketplace-whitebg
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Required: Your domain or localhost
DOMAIN_NAME=localhost

# Required: Sui blockchain network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Required: Application secrets (CHANGE THESE!)
JWT_SECRET=your_generated_jwt_secret_here
SUI_PRIVATE_KEY=your_sui_private_key_here
```

### 3. Build the Docker Image

#### Windows:
```bash
./build-docker.bat
```

#### Linux/Mac:
```bash
chmod +x build-docker.sh
./build-docker.sh
```

Or manually:
```bash
docker-compose build --no-cache
```

### 4. Run the Application

```bash
docker-compose up -d
```

The application will be available at:
- **HTTP**: http://localhost
- **App Direct**: http://localhost:3000

## 📦 Docker Architecture

The deployment consists of 3 services:

### 1. **app** - Next.js Application
- Built with multi-stage Dockerfile for optimization
- Runs on port 3000 (internal)
- Standalone output for minimal image size
- Health checks enabled

### 2. **nginx** - Reverse Proxy
- Routes traffic to the app
- Handles SSL/TLS termination
- Serves on ports 80 (HTTP) and 443 (HTTPS)
- Auto-renews SSL certificates

### 3. **certbot** - SSL Certificate Manager
- Automatic Let's Encrypt certificate issuance
- Auto-renewal every 12 hours
- Only needed for production with a domain

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
```

### Stop the Application
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Remove Everything (Including Volumes)
```bash
docker-compose down -v
```

## 🔧 Configuration

### Dockerfile

The multi-stage Dockerfile optimizes the build:

1. **Stage 1 (deps)**: Installs production dependencies
2. **Stage 2 (builder)**: Builds the Next.js app
3. **Stage 3 (runner)**: Creates minimal production image

### docker-compose.yml

Key configurations:

- **Health Checks**: Ensures services are running properly
- **Networks**: Isolated network for service communication
- **Volumes**: Persists nginx logs and SSL certificates
- **Environment**: Configurable via .env file

## 🌐 Production Deployment

### 1. Set Your Domain

In `.env`:
```env
DOMAIN_NAME=beats.yourdomain.com
NEXT_PUBLIC_APP_URL=https://beats.yourdomain.com
```

### 2. Configure DNS

Point your domain to your server's IP address:
```
A    beats.yourdomain.com    →    your.server.ip
```

### 3. Obtain SSL Certificate

First, make sure ports 80 and 443 are open, then:

```bash
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d beats.yourdomain.com
```

### 4. Update Nginx Configuration

The nginx configuration will automatically use SSL when certificates are available.

### 5. Deploy

```bash
docker-compose up -d
```

## 🔒 Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong JWT secrets**: Generate with `openssl rand -base64 32`
3. **Protect SUI_PRIVATE_KEY**: This controls blockchain transactions
4. **Use HTTPS in production**: Always enable SSL
5. **Regular updates**: Keep Docker images updated

## 📊 Monitoring

### Health Checks

The application includes built-in health checks:

```bash
# Check app health
curl http://localhost:3000/api/health

# Check nginx health
curl http://localhost/api/health
```

### View Container Status

```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

### Port Already in Use

```bash
# Find what's using the port
netstat -ano | findstr :80
netstat -ano | findstr :443

# Or change ports in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
  - "8443:443" # Use port 8443 instead
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if health check is failing
docker inspect beats-nft-app
```

### SSL Certificate Issues

```bash
# Test certificate renewal
docker-compose run --rm certbot renew --dry-run

# Check certificate status
docker-compose exec certbot certbot certificates
```

## 📁 File Structure

```
beats-music-nft-marketplace-whitebg/
├── Dockerfile                 # Multi-stage build configuration
├── docker-compose.yml        # Service orchestration
├── .dockerignore             # Files to exclude from build
├── .env.example              # Environment template
├── build-docker.sh           # Build script (Linux/Mac)
├── build-docker.bat          # Build script (Windows)
├── frontend/                 # Next.js application
│   ├── pages/               # Application pages
│   ├── components/          # React components
│   ├── styles/              # CSS styles
│   └── package.json         # Dependencies
└── nginx/                    # Nginx configuration
    ├── nginx.conf           # Nginx settings
    └── certbot/             # SSL certificates
```

## 🔄 Updates and Maintenance

### Update Application Code

```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update Dependencies

```bash
cd frontend
npm update
cd ..
docker-compose build --no-cache
docker-compose up -d
```

### Backup Important Data

```bash
# Backup SSL certificates
docker cp beats-certbot:/etc/letsencrypt ./backup/letsencrypt

# Backup nginx logs
docker cp beats-nginx:/var/log/nginx ./backup/nginx-logs
```

## 🌟 Features

- ✅ **Multi-stage builds** for optimized image size
- ✅ **Health checks** for all services
- ✅ **Auto SSL renewal** via Let's Encrypt
- ✅ **Reverse proxy** with nginx
- ✅ **Production-ready** configuration
- ✅ **Easy deployment** with docker-compose
- ✅ **Secure** non-root user execution

## 📞 Support

For issues or questions:
- Check the [main README](README.md)
- Review application logs: `docker-compose logs -f`
- Check Docker status: `docker-compose ps`

## 📝 License

See LICENSE file in the repository.
