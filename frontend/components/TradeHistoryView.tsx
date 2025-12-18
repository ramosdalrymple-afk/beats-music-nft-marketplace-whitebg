// components/TradeHistoryView.tsx
import React, { useState, useEffect } from 'react';
import { Loader, History, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { SuiClient } from '@mysten/sui.js/client';
import { TRADING_CONFIG } from '../pages/trade';

interface NFTData {
  id: string;
  name: string;
  imageUrl: string;
}

interface Trade {
  id: string;
  myNFT: NFTData;
  otherNFT: NFTData;
  otherAddress: string;
  createdAt: number;
  status: 'completed' | 'cancelled' | 'rejected';
  isInitiator: boolean;
}

interface TradeHistoryViewProps {
  account: any;
  client: SuiClient;
}

const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({
  account,
  client,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);

  useEffect(() => {
    if (account?.address) {
      loadTradeHistory();
    }
  }, [account]);

  const loadTradeHistory = async () => {
    setLoadingTrades(true);
    try {
      console.log('Fetching trade history for address:', account.address);

      // Query TradeCreatedEvent events
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${TRADING_CONFIG.PACKAGE_ID}::${TRADING_CONFIG.MODULE_NAME}::TradeCreatedEvent`,
        },
        limit: 100,
        order: 'descending',
      });

      console.log('Trade history events:', events);

      const parsedTrades: Trade[] = [];

      for (const event of events.data) {
        const eventData = event.parsedJson as any;

        // Check if this trade involves the current user (as initiator or target)
        const isInitiator = eventData.initiator === account.address;
        const isTarget = eventData.target === account.address;

        if (!isInitiator && !isTarget) continue;

        // Fetch the trade object to check its status
        try {
          const tradeObj = await client.getObject({
            id: eventData.trade_id,
            options: { 
              showContent: true,
              showType: true,
            },
          });

          if (tradeObj.data?.content?.dataType === 'moveObject') {
            const fields = (tradeObj.data.content as any).fields;

            console.log('History trade status:', fields.status);

            // Only show completed, cancelled, or rejected trades
            // STATE_COMPLETED = 2, STATE_CANCELLED = 3, STATE_REJECTED = 4
            if (fields.status !== 2 && fields.status !== 3 && fields.status !== 4) {
              continue;
            }

            // Fetch NFT details
            const [initiatorNFTData, targetNFTData] = await Promise.all([
              client.getObject({
                id: eventData.initiator_nft_id,
                options: { showDisplay: true },
              }),
              client.getObject({
                id: eventData.target_nft_id,
                options: { showDisplay: true },
              })
            ]);

            const initiatorNFTDisplay = (initiatorNFTData.data?.display as any)?.data;
            const targetNFTDisplay = (targetNFTData.data?.display as any)?.data;

            // Determine status label
            let status: 'completed' | 'cancelled' | 'rejected' = 'completed';
            if (fields.status === 3) status = 'cancelled';
            if (fields.status === 4) status = 'rejected';

            parsedTrades.push({
              id: eventData.trade_id,
              myNFT: {
                id: isInitiator ? eventData.initiator_nft_id : eventData.target_nft_id,
                name: isInitiator 
                  ? (initiatorNFTDisplay?.name || 'Unknown NFT')
                  : (targetNFTDisplay?.name || 'Unknown NFT'),
                imageUrl: isInitiator
                  ? (initiatorNFTDisplay?.image_url || '/placeholder-nft.png')
                  : (targetNFTDisplay?.image_url || '/placeholder-nft.png'),
              },
              otherNFT: {
                id: isInitiator ? eventData.target_nft_id : eventData.initiator_nft_id,
                name: isInitiator
                  ? (targetNFTDisplay?.name || 'Unknown NFT')
                  : (initiatorNFTDisplay?.name || 'Unknown NFT'),
                imageUrl: isInitiator
                  ? (targetNFTDisplay?.image_url || '/placeholder-nft.png')
                  : (initiatorNFTDisplay?.image_url || '/placeholder-nft.png'),
              },
              otherAddress: isInitiator ? eventData.target : eventData.initiator,
              createdAt: parseInt(fields.created_at || Date.now().toString()),
              status,
              isInitiator,
            });
          }
        } catch (err) {
          console.log('Trade no longer exists or error:', eventData.trade_id, err);
        }
      }

      console.log('Total parsed history trades:', parsedTrades.length);
      setTrades(parsedTrades);
    } catch (err) {
      console.error('Failed to load trade history:', err);
    } finally {
      setLoadingTrades(false);
    }
  };

  if (loadingTrades) {
    return (
      <div className="text-center py-20">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-purple" />
        <p className="text-slate-400">Loading trade history...</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
          <History className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Trade History</h2>
        <p className="text-slate-400">Your completed trades will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Trade History</h2>
        <button
          onClick={loadTradeHistory}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {trades.map((trade) => (
        <div
          key={trade.id}
          className={`bg-[#11141D] border rounded-lg p-6 ${
            trade.status === 'completed' 
              ? 'border-green-500/30 bg-green-900/10' 
              : trade.status === 'cancelled'
              ? 'border-red-500/30 bg-red-900/10'
              : 'border-orange-500/30 bg-orange-900/10'
          }`}
        >
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
              trade.status === 'completed'
                ? 'bg-green-600/50 text-green-200'
                : trade.status === 'cancelled'
                ? 'bg-red-600/50 text-red-200'
                : 'bg-orange-600/50 text-orange-200'
            }`}>
              {trade.status === 'completed' && <CheckCircle className="w-4 h-4" />}
              {trade.status === 'cancelled' && <XCircle className="w-4 h-4" />}
              {trade.status === 'rejected' && <XCircle className="w-4 h-4" />}
              {trade.status === 'completed' ? 'Trade Completed' : trade.status === 'cancelled' ? 'Trade Cancelled' : 'Trade Rejected'}
            </span>
            <div className="text-right text-sm text-slate-400">
              {new Date(trade.createdAt).toLocaleDateString()}
            </div>
          </div>

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
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {trade.status === 'completed' 
                    ? (trade.isInitiator ? 'You Traded' : 'You Traded')
                    : 'Your NFT'}
                </p>
                <h3 className="text-white font-semibold">{trade.myNFT.name}</h3>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {trade.myNFT.id.slice(0, 8)}...{trade.myNFT.id.slice(-6)}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className={`w-6 h-6 flex-shrink-0 ${
              trade.status === 'completed' ? 'text-green-400' : 'text-slate-600'
            }`} />

            {/* Other NFT */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={trade.otherNFT.imageUrl}
                  alt={trade.otherNFT.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-nft.png'; }}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {trade.status === 'completed'
                    ? (trade.isInitiator ? 'You Received' : 'You Received')
                    : 'Their NFT'}
                </p>
                <h3 className="text-white font-semibold">{trade.otherNFT.name}</h3>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {trade.otherNFT.id.slice(0, 8)}...{trade.otherNFT.id.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {/* Trade Info */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-slate-500">
            <span>
              {trade.isInitiator ? 'Traded with: ' : 'Traded with: '}
              {trade.otherAddress.slice(0, 8)}...{trade.otherAddress.slice(-6)}
            </span>
            <span>{new Date(trade.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradeHistoryView;