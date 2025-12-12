// components/BuyForm.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { TransactionBlock } from '@mysten/sui.js/transactions';

interface BuyFormProps {
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
  itemIdToBuy: string;
  setItemIdToBuy: (id: string) => void;
  buyItemType: string;
  setBuyItemType: (type: string) => void;
  buyAmount: string;
  setBuyAmount: (amount: string) => void;
}

export default function BuyForm({
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
  itemIdToBuy,
  setItemIdToBuy,
  buyItemType,
  setBuyItemType,
  buyAmount,
  setBuyAmount,
}: BuyFormProps) {
  const buyItem = async () => {
    if (!itemIdToBuy || !buyItemType || !buyAmount || !account) {
      setError('Please fill all fields and connect wallet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amountInMist = Math.floor(parseFloat(buyAmount) * 1_000_000_000);

      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(amountInMist)]);
      
      tx.moveCall({
        target: `${packageId}::marketplace::buy_and_take`,
        typeArguments: [buyItemType, coinType],
        arguments: [
          tx.object(marketplaceId),
          tx.pure(itemIdToBuy),
          coin,
        ],
      });

      signAndExecuteTransaction(
        { transactionBlock: tx },
        {
          onSuccess: (result: any) => {
            setSuccess(`Item purchased successfully! Digest: ${result.digest}`);
            setItemIdToBuy('');
            setBuyItemType('');
            setBuyAmount('');
            fetchMarketplaceData();
          },
          onError: (error: any) => {
            setError(error.message || 'Failed to purchase item');
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to purchase item');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Buy an Item</h2>
      <div className="max-w-2xl space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Item ID</label>
          <input
            type="text"
            value={itemIdToBuy}
            onChange={(e) => setItemIdToBuy(e.target.value)}
            placeholder="0x..."
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <p className="text-slate-500 text-sm mt-1">The object ID of the listed item</p>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Item Type</label>
          <input
            type="text"
            value={buyItemType}
            onChange={(e) => setBuyItemType(e.target.value)}
            placeholder="0xPACKAGE::MODULE::STRUCT"
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <p className="text-slate-500 text-sm mt-1">Must match the item's type exactly</p>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Payment (SUI)</label>
          <input
            type="number"
            step="0.001"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="1.5"
            className="w-full backdrop-blur-sm bg-black/40 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          {buyAmount && (
            <p className="text-slate-500 text-sm mt-1">
              ≈ {Math.floor(parseFloat(buyAmount) * 1_000_000_000).toLocaleString()} MIST
            </p>
          )}
        </div>

        <button
          onClick={buyItem}
          disabled={loading || !itemIdToBuy || !buyItemType || !buyAmount}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? 'Buying...' : 'Buy Item'}
        </button>

        <div className="mt-6 bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Important:</h3>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            <li>Payment amount must match the asking price exactly</li>
            <li>Item type must be the exact full type path</li>
            <li>Use the Active Listings tab to check listing details first</li>
          </ul>
        </div>
      </div>
    </div>
  );
}