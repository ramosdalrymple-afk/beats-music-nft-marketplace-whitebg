/**
 * Type definitions for the marketplace
 */

export interface ListingData {
  id: string;
  itemId: string;
  ask: number;
  owner: string;
  name: string;
  description: string;
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
  name: string;
  description: string;
  price: number;
}
