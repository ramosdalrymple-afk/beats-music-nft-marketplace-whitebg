# Beats NFT Marketplace - Quick Start Guide

Get your Beats NFT Marketplace running locally in 5 minutes! 🚀

---

## Prerequisites

Make sure you have the following installed:
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

---

## Local Development Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Sui blockchain SDKs (@mysten/sui.js, @mysten/dapp-kit)
- Tailwind CSS
- TypeScript

### Step 3: Start Development Server

```bash
npm run dev
```

You should see output like:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

You should see the Beats NFT Marketplace homepage!

### Step 5: Test the Application

Try out these features:
- **Home Page** (`/`) - About the platform
- **Beats Tap** (`/beats-tap`) - Browse and tap music NFTs
- **Beats Music** (`/beats-music`) - Your music collection
- **Marketplace** (`/marketplace`) - NFT marketplace
- **Inventory** (`/inventory`) - Your NFT inventory
- **Trade** (`/trade`) - P2P trading interface
- **Gallery** (`/gallery`) - Visual NFT gallery
- **Perks** (`/perks`) - Rewards and perks

---

## Environment Variables

The project comes with a pre-configured `.env.local` file for local development:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These are already set up for you - no changes needed for local development!

---

## Testing Features

### Connect Sui Wallet

1. Install a Sui wallet extension (e.g., Sui Wallet, Suiet)
2. Create or import a wallet
3. Make sure you're connected to **Sui Testnet**
4. Click the wallet connect button in the app

### Get Test Tokens

Get free SUI tokens for testing:
- Visit the [Sui Testnet Faucet](https://discord.com/channels/916379725201563759/971488439931392130)
- Request testnet SUI tokens
- Use them to interact with NFTs

### Browse NFTs

The application connects directly to the Sui blockchain to fetch NFT data:
- All NFTs are stored on Sui testnet
- No backend database required
- Real-time blockchain data

---

## Building for Production

Want to test the production build locally?

```bash
# Build the application
npm run build

# Start production server
npm run start
```

Access at: **http://localhost:3000**

---

## Health Check Endpoint

Test the health check API:

```bash
# Using curl
curl http://localhost:3000/api/health

# Using browser
Open: http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:34:56.789Z",
  "uptime": 123.456
}
```

---

## Common Issues & Solutions

### Issue: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find what's using port 3000
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill the process or use a different port
npm run dev -- -p 3001
```

### Issue: Module Not Found

**Error**: `Cannot find module 'next'`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Wallet Not Connecting

**Problem**: Sui wallet doesn't connect

**Solution**:
1. Make sure you have a Sui wallet extension installed
2. Ensure wallet is set to **Testnet** (not Mainnet or Devnet)
3. Refresh the page and try again
4. Check browser console for errors (F12 → Console)

### Issue: NFTs Not Loading

**Problem**: NFT data doesn't load

**Solution**:
1. Check your internet connection
2. Verify Sui testnet RPC is accessible: https://fullnode.testnet.sui.io:443
3. Make sure your wallet is connected
4. Check browser console for errors

---

## Docker Local Testing (Optional)

Want to test the Docker build locally before deploying?

### Build Docker Image

```bash
# Navigate to project root
cd ..

# Build the image
docker build -t beats-nft-app:local .
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUI_NETWORK=testnet \
  -e NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443 \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  beats-nft-app:local
```

Access at: **http://localhost:3000**

### Test with Docker Compose

```bash
# Start all services (app, nginx, certbot)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## Project Structure

```
beats-music-nft-marketplace-whitebg/
├── frontend/                    # Next.js application
│   ├── pages/                  # Application pages
│   │   ├── api/               # API routes
│   │   │   └── health.ts     # Health check endpoint
│   │   ├── index.tsx          # Homepage
│   │   ├── beats-tap.tsx      # Beat tapping page
│   │   ├── beats-music.tsx    # Music collection
│   │   ├── marketplace.tsx    # NFT marketplace
│   │   ├── inventory.tsx      # User inventory
│   │   ├── trade.tsx          # Trading interface
│   │   ├── gallery.tsx        # NFT gallery
│   │   └── perks.tsx          # Perks system
│   ├── components/            # React components
│   ├── styles/                # CSS styles
│   ├── .env.local            # Local environment variables
│   ├── next.config.js        # Next.js configuration
│   └── package.json          # Dependencies
├── backend/                   # Sui Move smart contracts
│   ├── marketplace/          # Marketplace contracts
│   ├── BeatTaps/             # Beat tapping contracts
│   └── nft_trading/          # Trading contracts
├── nginx/                     # Nginx configuration
│   ├── nginx.conf            # Reverse proxy config
│   └── ssl-setup.sh          # SSL certificate setup
├── Dockerfile                # Docker build configuration
├── docker-compose.yml        # Multi-container setup
├── .dockerignore             # Docker build exclusions
├── .env.example              # Environment variables template
├── QUICKSTART.md             # This file
└── DEPLOYMENT.md             # Full deployment guide
```

---

## What's Next?

### Development
- **Edit Pages**: Modify files in `frontend/pages/`
- **Add Components**: Create new components in `frontend/components/`
- **Styling**: Update `frontend/styles/globals.css` or component styles
- **Hot Reload**: Changes auto-reload in the browser

### Deployment to Production
When you're ready to deploy to production with a custom domain:

1. Read the **[DEPLOYMENT.md](DEPLOYMENT.md)** guide
2. Set up your domain and DNS
3. Generate SSL certificates
4. Deploy to Portainer

---

## Need Help?

- **Health Check**: http://localhost:3000/api/health
- **Logs**: Check terminal where `npm run dev` is running
- **Browser Console**: Press F12 → Console tab
- **Full Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Sui Network (Testnet)
- **Wallet Integration**: @mysten/dapp-kit
- **Smart Contracts**: Move language (Sui)

---

## Architecture

```
Browser
   ↓
Next.js App (localhost:3000)
   ↓
Sui Blockchain (Testnet)
   ├── Marketplace Contract
   ├── Beat Taps Contract
   └── NFT Trading Contract
```

**No backend database needed** - all data comes directly from the Sui blockchain!

---

**Happy coding!** 🎵 🎨 ⛓️

For production deployment with custom domain and SSL, see [DEPLOYMENT.md](DEPLOYMENT.md)
