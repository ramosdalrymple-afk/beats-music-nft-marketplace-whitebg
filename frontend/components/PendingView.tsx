// components/PendingView.tsx
import React, { useState, useEffect } from 'react';
import { Loader, XCircle, Clock, ArrowRight } from 'lucide-react';
import { SuiClient } from '@mysten/sui.js/client';
import { TRADING_CONFIG } from '../pages/trade';

interface NFTData {
  id: string;
  name: string;
  imageUrl: string;
  type?: string;
}

interface Trade {
  id: string;
  tradeObjectId: string;
  myNFT: NFTData;
  targetNFT: NFTData;
  targetAddress: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'cancelled';
  type1?: string;
  type2?: string;
  initiator: string;
  target: string;
}

interface PendingViewProps {
  account: any;
  client: SuiClient;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  signAndExecuteTransaction: any;
}

const PendingView: React.FC<PendingViewProps> = ({
  account,
  client,
  loading,
  setLoading,
  setError,
  setSuccess,
  signAndExecuteTransaction,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);

  useEffect(() => {
    if (account?.address) {
      loadPendingTrades();
    }
  }, [account]);

  const loadPendingTrades = async () => {
    setLoadingTrades(true);
    try {
      console.log('Fetching events for address:', account.address);
      console.log('Package ID:', TRADING_CONFIG.PACKAGE_ID);
      console.log('Module name:', TRADING_CONFIG.MODULE_NAME);

      // Query TradeCreatedEvent events (note: Event suffix in Move code)
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${TRADING_CONFIG.PACKAGE_ID}::${TRADING_CONFIG.MODULE_NAME}::TradeCreatedEvent`,
        },
        limit: 50,
        order: 'descending',
      });

      console.log('Raw events response:', events);
      console.log('Number of events:', events.data?.length || 0);

      const parsedTrades: Trade[] = [];

      for (const event of events.data) {
        console.log('Processing event:', event);
        console.log('Event parsedJson:', event.parsedJson);
        
        const eventData = event.parsedJson as any;

        // Log all fields in the event
        console.log('Event fields:', Object.keys(eventData));
        console.log('Initiator:', eventData.initiator);
        console.log('Target:', eventData.target);
        console.log('Current user:', account.address);

        // Check if this trade was initiated by the current user
        if (eventData.initiator === account.address) {
          console.log('Found trade initiated by user:', eventData);
          
          // Fetch the trade object to check if it still exists
          try {
            const tradeObj = await client.getObject({
              id: eventData.trade_id,
              options: { 
                showContent: true,
                showType: true,
              },
            });

            console.log('Trade object:', tradeObj);

            if (tradeObj.data?.content?.dataType === 'moveObject') {
              const fields = (tradeObj.data.content as any).fields;
              const objectType = tradeObj.data.type as string;

              console.log('Trade fields:', fields);
              console.log('Trade object type:', objectType);
              console.log('Trade status:', fields.status);

              // Skip completed, cancelled, or rejected trades (only show pending)
              // STATE_PENDING = 0, STATE_ACCEPTED = 1, STATE_COMPLETED = 2, STATE_CANCELLED = 3, STATE_REJECTED = 4
              if (fields.status !== 0 && fields.status !== 1) {
                console.log('Skipping trade with status:', fields.status);
                continue;
              }

              // Extract type arguments from the trade object type
              const typeMatch = objectType.match(/<(.+)>/);
              let type1 = '';
              let type2 = '';
              
              if (typeMatch) {
                const types = typeMatch[1].split(',').map(t => t.trim());
                type1 = types[0] || '';
                type2 = types[1] || '';
                console.log('Extracted types:', { type1, type2 });
              }

              // Fetch NFT details
              console.log('Fetching NFT details for:', eventData.initiator_nft_id, eventData.target_nft_id);
              
              const [initiatorNFTData, targetNFTData] = await Promise.all([
                client.getObject({
                  id: eventData.initiator_nft_id,
                  options: { showDisplay: true, showType: true },
                }),
                client.getObject({
                  id: eventData.target_nft_id,
                  options: { showDisplay: true, showType: true },
                })
              ]);

              console.log('Initiator NFT data:', initiatorNFTData);
              console.log('Target NFT data:', targetNFTData);

              const initiatorNFTDisplay = (initiatorNFTData.data?.display as any)?.data;
              const targetNFTDisplay = (targetNFTData.data?.display as any)?.data;

              const trade = {
                id: eventData.trade_id,
                tradeObjectId: eventData.trade_id,
                myNFT: {
                  id: eventData.initiator_nft_id,
                  name: initiatorNFTDisplay?.name || 'Unknown NFT',
                  imageUrl: initiatorNFTDisplay?.image_url || '/placeholder-nft.png',
                  type: type1,
                },
                targetNFT: {
                  id: eventData.target_nft_id,
                  name: targetNFTDisplay?.name || 'Unknown NFT',
                  imageUrl: targetNFTDisplay?.image_url || '/placeholder-nft.png',
                  type: type2,
                },
                targetAddress: eventData.target,
                createdAt: parseInt(fields.created_at || Date.now().toString()),
                status: 'pending' as const,
                type1,
                type2,
                initiator: eventData.initiator,
                target: eventData.target,
              };

              console.log('Parsed trade:', trade);
              parsedTrades.push(trade);
            }
          } catch (err) {
            console.error('Error fetching trade object:', eventData.trade_id, err);
          }
        }
      }

      console.log('Total parsed trades:', parsedTrades.length);
      console.log('Parsed trades:', parsedTrades);
      setTrades(parsedTrades);
    } catch (err) {
      console.error('Failed to load pending trades:', err);
      setError('Failed to load pending trades: ' + (err as Error).message);
    } finally {
      setLoadingTrades(false);
    }
  };

  const handleCancelTrade = async (trade: Trade) => {
    if (!trade.type1 || !trade.type2) {
      setError('Cannot determine NFT types for this trade');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { TransactionBlock } = await import('@mysten/sui.js/transactions');
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${TRADING_CONFIG.PACKAGE_ID}::${TRADING_CONFIG.MODULE_NAME}::cancel_trade`,
        typeArguments: [trade.type1, trade.type2],
        arguments: [tx.object(trade.tradeObjectId)],
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
            console.log('Trade cancelled successfully:', result);
            setSuccess(`Trade cancelled successfully! Digest: ${result.digest}`);
            setLoading(false);
            loadPendingTrades();
          },
          onError: (error: Error) => {
            console.error('Trade cancellation failed:', error);
            setError('Failed to cancel trade: ' + error.message);
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Transaction preparation failed:', err);
      setError('Failed to prepare cancellation: ' + err.message);
      setLoading(false);
    }
  };

  if (loadingTrades) {
    return (
      <div className="text-center py-20">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-purple" />
        <p className="text-slate-400">Loading pending trades...</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
          <Clock className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Pending Trades</h2>
        <p className="text-slate-400">You don't have any pending trade requests</p>
        <p className="text-xs text-slate-600 mt-2">Check the browser console for debugging info</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Your Pending Trades</h2>
        <span className="text-sm text-slate-400">{trades.length} active</span>
      </div>

      {trades.map((trade) => (
        <div
          key={trade.id}
          className="bg-[#11141D] border border-white/5 rounded-lg p-6 hover:border-white/10 transition-all"
        >
          <div className="flex items-center justify-between gap-6">
            {/* Your NFT */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={trade.myNFT.imageUrl}
                  alt={trade.myNFT.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-nft.png'; }}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">You Offer</p>
                <h3 className="text-white font-semibold">{trade.myNFT.name}</h3>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {trade.myNFT.id.slice(0, 8)}...{trade.myNFT.id.slice(-6)}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-6 h-6 text-brand-purple flex-shrink-0" />

            {/* Target NFT */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={trade.targetNFT.imageUrl}
                  alt={trade.targetNFT.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-nft.png'; }}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">You Want</p>
                <h3 className="text-white font-semibold">{trade.targetNFT.name}</h3>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {trade.targetNFT.id.slice(0, 8)}...{trade.targetNFT.id.slice(-6)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => handleCancelTrade(trade)}
                disabled={loading}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-red-600/30"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>

          {/* Trade Info */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-slate-500">
            <span>To: {trade.targetAddress.slice(0, 8)}...{trade.targetAddress.slice(-6)}</span>
            <span>Created: {new Date(trade.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingView;