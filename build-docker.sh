#!/bin/bash

# ============================================
# Beats NFT Marketplace - Docker Build Script
# ============================================

echo "🚀 Building Beats NFT Marketplace Docker Image..."
echo ""

# Stop and remove existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove old images (optional - comment out if you want to keep old images)
# echo "🗑️  Removing old images..."
# docker rmi beats-nft-marketplace-whitebg-app 2>/dev/null || true

# Build the Docker image
echo "🔨 Building new Docker image..."
docker-compose build --no-cache

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker image built successfully!"
    echo ""
    echo "To run the application, use:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop the application:"
    echo "  docker-compose down"
else
    echo ""
    echo "❌ Docker build failed!"
    exit 1
fi
