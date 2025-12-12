import { SuiClient } from '@mysten/sui.js/client';

/**
 * Sui marketplace constants
 */
export const MARKETPLACE = {
  // Updated with your deployed package ID
  PACKAGE_ID: '0x08ac46b00eb814de6e803b7abb60b42abbaf49712314f4ed188f4fea6d4ce3ec',
  MARKETPLACE_ID: '0xb9aa59546415a92290e60ad5d90a9d0b013da1b3daa046aba44a0be113a83b84',
  COLLECTION_ID: '0x07c09c81925e5f995479fac9caa6fdc0983863e800ee4b04831bcd44e4fb427a',
  MODULE_NAME: 'marketplace',
  MUSIC_NFT_MODULE: 'music_nft',
  COIN_TYPE: '0x2::sui::SUI',
  
  // Function names from the Move contract
  FUNCTIONS: {
    // Marketplace functions
    CREATE_MARKETPLACE: 'create',
    LIST_ITEM: 'list',
    BUY_AND_TAKE: 'buy_and_take',
    DELIST_AND_TAKE: 'delist_and_take',
    TAKE_PROFITS_AND_KEEP: 'take_profits_and_keep',
    VIEW_LISTING: 'view_listing',
    GET_LISTING_COUNT: 'get_listing_count',
    GET_PENDING_PAYMENT: 'get_pending_payment',
    
    // Music NFT functions
    MINT_NFT: 'mint',
    MINT_TO_SENDER: 'mint_to_sender',
    BURN_NFT: 'burn',
    UPDATE_METADATA: 'update_metadata',
  },
};

/**
 * Network configuration
 */
export const NETWORK = 'testnet'; // Change to 'mainnet' or 'devnet' as needed

/**
 * Format address for display
 */
export const formatAddress = (address: string, chars = 6): string => {
  if (!address) return '';
  return address.slice(0, chars) + '...' + address.slice(-chars);
};

/**
 * Parse SUI amount (SUI has 9 decimals)
 */
export const parseSui = (amount: string | number): bigint => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.round(num * 1_000_000_000));
};

/**
 * Format SUI amount for display
 */
export const formatSui = (amount: bigint | string | number): string => {
  let num: number;
  
  if (typeof amount === 'bigint') {
    num = Number(amount) / 1_000_000_000;
  } else if (typeof amount === 'string') {
    num = parseFloat(amount) / 1_000_000_000;
  } else {
    num = amount / 1_000_000_000;
  }
  
  return num.toFixed(4).replace(/\.?0+$/, '');
};

/**
 * Get explorer link for transaction
 */
export const getExplorerLink = (txDigest: string, network: string = NETWORK): string => {
  return `https://suiscan.xyz/${network}/tx/${txDigest}`;
};

/**
 * Get explorer link for object
 */
export const getObjectLink = (objectId: string, network: string = NETWORK): string => {
  return `https://suiscan.xyz/${network}/object/${objectId}`;
};

/**
 * Get explorer link for address
 */
export const getAddressLink = (address: string, network: string = NETWORK): string => {
  return `https://suiscan.xyz/${network}/account/${address}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};