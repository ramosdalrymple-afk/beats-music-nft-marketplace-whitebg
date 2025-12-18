// pages/trade.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ArrowLeftRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  History
} from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui.js/client';
import BrowseView from '../components/BrowseView';
import PendingView from '../components/PendingView';
import ReceivedView from '../components/ReceivedView';
import TradeHistoryView from '../components/TradeHistoryView';

// Trading Configuration
export const TRADING_CONFIG = {
  PACKAGE_ID: '0x5281a724289520fadb5984c3686f8b63cf574d4820fcf584137a820516afa507',
  MODULE_NAME: 'trade',
  CLOCK_ID: '0x6',
  NETWORK: 'testnet',
};

// ⚠️ IMPORTANT: Before the wallet prompt will show, you MUST:
// 1. Replace 0xYOUR_PACKAGE_ID with your actual deployed package ID
// 2. Make sure the MODULE_NAME matches your Move module name
// 3. Ensure the function names (create_trade, accept_trade, etc.) match your contract

// Initialize Sui Client
const client = new SuiClient({
  url: `https://fullnode.${TRADING_CONFIG.NETWORK}.sui.io:443`,
});

// NFT Type
export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: string;
}

// Fetch NFTs function
export const fetchNFTs = async (address: string, suiClient: SuiClient): Promise<NFT[]> => {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    });

    const nfts: NFT[] = objects.data
      .filter((obj) => obj.data?.content?.dataType === 'moveObject')
      .map((obj) => {
        const display = obj.data?.display?.data;
        const content = obj.data?.content as any;
        
        return {
          id: obj.data?.objectId || '',
          name: display?.name || content?.fields?.name || 'Unnamed NFT',
          description: display?.description || content?.fields?.description || 'No description',
          imageUrl: display?.image_url || content?.fields?.url || '/placeholder-nft.png',
          type: obj.data?.type || '',
        };
      });

    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
};

type ViewType = 'browse' | 'pending' | 'received' | 'history';

export default function Trade() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction, isPending } = useSignAndExecuteTransactionBlock();
  
  const [view, setView] = useState<ViewType>('browse');
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user's NFTs
  useEffect(() => {
    if (account?.address) {
      loadUserNFTs();
    } else {
      setUserNFTs([]);
    }
  }, [account, refreshTrigger]);

  const loadUserNFTs = async () => {
    if (!account?.address) return;
    
    setLoadingNFTs(true);
    try {
      const nfts = await fetchNFTs(account.address, client);
      setUserNFTs(nfts);
    } catch (err: any) {
      console.error('Failed to load NFTs:', err);
      setError('Failed to load your NFTs');
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <>
      <Head>
        <title>NFT Trading Terminal - Beats</title>
      </Head>

      <div className="min-h-screen text-slate-200 bg-[#0B0E14] font-sans pb-20">
        
        {/* TOP BAR */}
        <div className="border-b border-white/5 bg-[#11141D] px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">NFT Trading Terminal</h1>
                  <p className="text-sm text-slate-400">Peer-to-peer NFT swaps on Sui</p>
                </div>
              </div>

              {account && (
                <div className="flex items-center gap-3 bg-[#0B0E14] px-4 py-2 rounded-lg border border-white/5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-slate-300">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="border-b border-white/5 bg-[#11141D]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1">
              <button
                onClick={() => setView('browse')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  view === 'browse'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Browse & Create
                {view === 'browse' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />
                )}
              </button>
              <button
                onClick={() => setView('pending')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  view === 'pending'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Trades
                </div>
                {view === 'pending' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />
                )}
              </button>
              <button
                onClick={() => setView('received')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  view === 'received'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  Received Offers
                </div>
                {view === 'received' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />
                )}
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  view === 'history'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Trade History
                </div>
                {view === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ERROR/SUCCESS MESSAGES */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 text-sm font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {!account ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-purple/10 flex items-center justify-center">
                <ArrowLeftRight className="w-10 h-10 text-brand-purple" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-slate-400 mb-6">Connect your wallet to start trading NFTs</p>
              <button className="px-8 py-3 bg-brand-purple hover:bg-brand-purple/90 rounded-lg font-semibold text-white transition-all">
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              {view === 'browse' && (
                <BrowseView
                  account={account}
                  client={client}
                  userNFTs={userNFTs}
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  setSuccess={setSuccess}
                  signAndExecuteTransaction={signAndExecuteTransaction}
                  loadingNFTs={loadingNFTs}
                  setLoadingNFTs={setLoadingNFTs}
                  setView={setView}
                  refreshTrigger={refreshTrigger}
                  setRefreshTrigger={setRefreshTrigger}
                />
              )}

              {view === 'pending' && (
                <PendingView
                  account={account}
                  client={client}
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  setSuccess={setSuccess}
                  signAndExecuteTransaction={signAndExecuteTransaction}
                />
              )}

              {view === 'received' && (
                <ReceivedView
                  account={account}
                  client={client}
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  setSuccess={setSuccess}
                  signAndExecuteTransaction={signAndExecuteTransaction}
                />
              )}

              {view === 'history' && (
                <TradeHistoryView
                  account={account}
                  client={client}
                  TRADING_CONFIG={TRADING_CONFIG}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}