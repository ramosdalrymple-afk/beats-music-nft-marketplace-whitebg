@echo off
REM ============================================
REM Beats NFT Marketplace - Docker Build Script (Windows)
REM ============================================

echo.
echo Building Beats NFT Marketplace Docker Image...
echo.

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose down

REM Remove old images (optional - comment out if you want to keep old images)
REM echo Removing old images...
REM docker rmi beats-nft-marketplace-whitebg-app 2>NUL

REM Build the Docker image
echo Building new Docker image...
docker-compose build --no-cache

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Docker image built successfully!
    echo.
    echo To run the application, use:
    echo   docker-compose up -d
    echo.
    echo To view logs:
    echo   docker-compose logs -f
    echo.
    echo To stop the application:
    echo   docker-compose down
) else (
    echo.
    echo Docker build failed!
    exit /b 1
)
