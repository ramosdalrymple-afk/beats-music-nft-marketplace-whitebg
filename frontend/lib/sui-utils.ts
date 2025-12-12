import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { NETWORK } from './constants';

/**
 * Create and export a configured Sui client
 */
export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK as 'testnet' | 'mainnet' | 'devnet'),
});

/**
 * Get RPC endpoint URL based on network
 */
export const getRpcUrl = (network: string = NETWORK): string => {
  return getFullnodeUrl(network as 'testnet' | 'mainnet' | 'devnet');
};

export default suiClient;