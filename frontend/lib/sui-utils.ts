import { SuiClient } from '@mysten/sui.js/client';

/**
 * Sui marketplace constants
 */
export const MARKETPLACE = {
  // TODO: Update with your deployed package ID
  PACKAGE_ID: '0x...', 
  MODULE_NAME: 'marketplace',
  
  // Function names from the Move contract
  FUNCTIONS: {
    CREATE_MARKETPLACE: 'create',
    LIST_ITEM: 'list',
    BUY_AND_TAKE: 'buy_and_take',
    DELIST_AND_TAKE: 'delist_and_take',
    TAKE_PROFITS_AND_KEEP: 'take_profits_and_keep',
  },
};

/**
 * Format address for display
 */
export const formatAddress = (address: string, chars = 6): string => {
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
  
  return num.toFixed(3).replace(/\.?0+$/, '');
};

/**
 * Get explorer link for transaction
 */
export const getExplorerLink = (txDigest: string, network: string = 'testnet'): string => {
  return `https://explorer.sui.io/txblock/${txDigest}?network=${network}`;
};

/**
 * Get explorer link for object
 */
export const getObjectLink = (objectId: string, network: string = 'testnet'): string => {
  return `https://explorer.sui.io/object/${objectId}?network=${network}`;
};
