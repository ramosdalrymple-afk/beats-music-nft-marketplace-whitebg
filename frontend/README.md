# Beats NFT Marketplace Frontend

A clean, minimal frontend for the Sui NFT marketplace.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Features

- **Marketplace**: Browse and buy NFT listings
- **Create Listings**: List your NFTs for sale
- **Dashboard**: Manage your listings and earnings
- **Wallet Integration**: Connect with Sui wallets via dapp-kit

## Project Structure

```
frontend/
├── components/         # Reusable React components
│   ├── Layout.tsx      # Navigation and layout wrapper
│   ├── Marketplace.tsx # Main marketplace view
│   ├── ListingCard.tsx # Individual listing card
│   ├── Dashboard.tsx   # Seller dashboard
│   └── CreateListingModal.tsx # Modal for creating listings
├── pages/             # Next.js pages
│   ├── _app.tsx       # App wrapper with providers
│   ├── _document.tsx  # HTML document setup
│   ├── index.tsx      # Home/marketplace page
│   └── dashboard.tsx  # Dashboard page
├── styles/            # Global styles
│   └── globals.css    # Tailwind imports
└── package.json
```

## Styling

The project uses **Tailwind CSS** for styling with a dark theme (slate-950 base).

## Sui Integration

The frontend integrates with Sui blockchain via:
- `@mysten/dapp-kit`: Wallet connection and provider setup
- `@mysten/sui.js`: Sui client and utilities

### Environment Setup

Update the network configuration in `pages/_app.tsx` for different networks:
- `testnet` (default)
- `mainnet`

## Next Steps

1. **Smart Contract Integration**: Connect the component handlers to actual Sui smart contract calls
2. **Real Listings**: Replace mock data with actual blockchain data queries
3. **Transaction Handling**: Implement buy/sell transaction execution
4. **Error Handling**: Add comprehensive error boundaries
5. **Loading States**: Add proper loading and feedback UI
