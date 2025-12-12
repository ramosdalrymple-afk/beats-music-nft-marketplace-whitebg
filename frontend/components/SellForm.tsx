// components/SellForm.tsx
import React from 'react';
import { Package } from 'lucide-react';
import { TransactionBlock } from '@mysten/sui.js/transactions';

interface SellFormProps {
  account: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  signAndExecuteTransaction: any;
  fetchMarketplaceData: () => void;
  packageId: string;
  marketplaceId: string;
  coinType: string;
  itemToList: string;
  setItemToList: (id: string) => void;
  askPrice: string;
  setAskPrice: (price: string) => void;
  itemType: string;
  setItemType: (type: string) => void;
}

export default function SellForm({
  account,
  loading,
  setLoading,
  setError,
  setSuccess,
  signAndExecuteTransaction,
  fetchMarketplaceData,
  packageId,
  marketplaceId,
  coinType,
  itemToList,
  setItemToList,
  askPrice,
  setAskPrice,
  itemType,
  setItemType,
}: SellFormProps) {
  const listItem = async () => {
    if (!itemToList || !askPrice || !itemType || !account) {
      setError('Please fill all fields and connect wallet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const priceInMist = Math.floor(parseFloat(askPrice) * 1_000_000_000);

      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${packageId}::marketplace::list`,
        typeArguments: [itemType, coinType],
        arguments: [
          tx.object(marketplaceId),
          tx.object(itemToList),
          tx.pure(priceInMist, 'u64'),
        ],
      });

      signAndExecuteTransaction(
        {
          transactionBlock: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result: any) => {
            console.log('List transaction successful:', result);
            setSuccess(`Item listed successfully! Digest: ${result.digest}`);
            setItemToList('');
            setAskPrice('');
            setItemType('');
            setLoading(false);
            fetchMarketplaceData();
          },
          onError: (error: any) => {
            console.error('List transaction error:', error);
            setError(error.message || 'Failed to list item');
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('List function error:', err);
      setError(err.message || 'Failed to list item');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">List an Item</h2>
      <div className="max-w-2xl space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Item Object ID</label>
          <input
            type="text"
            value={itemToList}
            onChange={(e) => setItemToList(e.target.value)}
            placeholder="0x..."
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <p className="text-slate-500 text-sm mt-1">The object ID of the NFT/item you want to list</p>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Item Type (Full Type)</label>
          <input
            type="text"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            placeholder="0xPACKAGE::MODULE::STRUCT"
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <p className="text-slate-500 text-sm mt-1">Example: 0x123::my_nft::MyNFT</p>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Price (in SUI)</label>
          <input
            type="number"
            step="0.001"
            value={askPrice}
            onChange={(e) => setAskPrice(e.target.value)}
            placeholder="1.5"
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          {askPrice && (
            <p className="text-slate-500 text-sm mt-1">
              ≈ {Math.floor(parseFloat(askPrice) * 1_000_000_000).toLocaleString()} MIST
            </p>
          )}
        </div>

        <button
          onClick={listItem}
          disabled={loading || !itemToList || !askPrice || !itemType}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          {loading ? 'Listing...' : 'List Item'}
        </button>

        <div className="mt-6 bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How to find your Item ID & Type:</h3>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            <li>Go to your wallet or use <code className="text-purple-400">sui client objects</code></li>
            <li>Find the object you want to list and copy its ID</li>
            <li>Get the full type from the object details (Package::Module::Struct)</li>
            <li>Paste both here and set your price</li>
          </ol>
        </div>
      </div>
    </div>
  );
}