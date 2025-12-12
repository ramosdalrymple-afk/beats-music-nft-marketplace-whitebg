// /**
//  * Type definitions for the marketplace
//  */

// export interface ListingData {
//   id: string;
//   itemId: string;
//   ask: number;
//   owner: string;
//   name: string;
//   description: string;
// }

// export interface UserProfile {
//   address: string;
//   totalEarnings: bigint;
//   totalListings: number;
//   averagePrice: number;
// }

// export interface TransactionResult {
//   success: boolean;
//   txDigest?: string;
//   error?: string;
// }

// export interface CreateListingInput {
//   itemId: string;
//   name: string;
//   description: string;
//   price: number;
// }

/**
 * Type definitions for the marketplace
 */

export interface ListingData {
  id: string;
  itemId: string;
  askPrice: number;
  owner: string;
  listingId: string;
  name: string;
  description: string;
  imageUrl: string;
  musicUrl: string;
  attributes: string;
  itemType: string;
}

export interface MusicNFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  musicUrl: string;
  creator: string;
  attributes: string;
}

export interface UserProfile {
  address: string;
  totalEarnings: bigint;
  totalListings: number;
  averagePrice: number;
}

export interface TransactionResult {
  success: boolean;
  txDigest?: string;
  error?: string;
}

export interface CreateListingInput {
  itemId: string;
  itemType: string;
  price: number;
}

export interface BuyItemInput {
  itemId: string;
  itemType: string;
  amount: number;
}

export interface MintNFTInput {
  name: string;
  description: string;
  imageUrl: string;
  musicUrl: string;
  attributes: string;
  recipient?: string;
}

export interface MarketplaceStats {
  totalListings: number;
  pendingPayment: number;
  walletConnected: boolean;
}

export interface NFTCollection {
  id: string;
  totalMinted: number;
  name: string;
  description: string;
}
