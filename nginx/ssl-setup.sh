#!/bin/bash

# ============================================
# SSL Certificate Setup Script (Let's Encrypt)
# Run this ONCE to obtain initial SSL certificates
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Certificate Setup for Let's Encrypt${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if DOMAIN_NAME is set
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: DOMAIN_NAME environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it in Portainer or export it:${NC}"
    echo -e "${YELLOW}export DOMAIN_NAME=yourdomain.com${NC}"
    exit 1
fi

# Check if EMAIL is set
if [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: EMAIL environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it in Portainer or export it:${NC}"
    echo -e "${YELLOW}export EMAIL=your@email.com${NC}"
    exit 1
fi

echo -e "${YELLOW}Domain:${NC} $DOMAIN_NAME"
echo -e "${YELLOW}Email:${NC} $EMAIL\n"

# Create necessary directories
echo -e "${GREEN}Creating certificate directories...${NC}"
mkdir -p ./nginx/certbot/conf
mkdir -p ./nginx/certbot/www

# Download recommended TLS parameters
if [ ! -f "./nginx/certbot/conf/options-ssl-nginx.conf" ]; then
    echo -e "${GREEN}Downloading recommended TLS parameters...${NC}"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./nginx/certbot/conf/options-ssl-nginx.conf"
fi

if [ ! -f "./nginx/certbot/conf/ssl-dhparams.pem" ]; then
    echo -e "${GREEN}Downloading SSL DH parameters...${NC}"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./nginx/certbot/conf/ssl-dhparams.pem"
fi

# Create temporary nginx config for certificate challenge
echo -e "${GREEN}Creating temporary Nginx configuration...${NC}"
cat > ./nginx/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        listen [::]:80;
        server_name DOMAIN_PLACEHOLDER;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 "Certificate challenge server running\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN_NAME/g" ./nginx/nginx-temp.conf

echo -e "${GREEN}Starting temporary Nginx for certificate challenge...${NC}"

# Start temporary Nginx container
docker run -d \
    --name nginx-certbot-temp \
    -p 80:80 \
    -v $(pwd)/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/nginx/certbot/www:/var/www/certbot:ro \
    nginx:1.25-alpine

sleep 5

# Request certificate
echo -e "${GREEN}Requesting SSL certificate from Let's Encrypt...${NC}"
docker run --rm \
    -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/nginx/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN_NAME \
    -d www.$DOMAIN_NAME

# Stop and remove temporary container
echo -e "${GREEN}Cleaning up temporary Nginx container...${NC}"
docker stop nginx-certbot-temp
docker rm nginx-certbot-temp
rm ./nginx/nginx-temp.conf

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Certificate Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Deploy your stack in Portainer"
echo -e "2. Your site will be available at: ${GREEN}https://$DOMAIN_NAME${NC}"
echo -e "3. Certificates will auto-renew via the certbot container\n"

echo -e "${YELLOW}Certificate location:${NC}"
echo -e "./nginx/certbot/conf/live/$DOMAIN_NAME/\n"
