// pages/trade.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ArrowLeftRight,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Copy,
  X,
  Wallet,
  Users,
  Plus,
  RefreshCw,
  Disc // Imported Disc icon for the empty state
} from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui.js/client';
import BrowseView from '../components/BrowseView';
import PendingView from '../components/PendingView';
import ReceivedView from '../components/ReceivedView';
import TradeHistoryView from '../components/TradeHistoryView';

// --- Configuration ---
export const TRADING_CONFIG = {
  PACKAGE_ID: '0x5281a724289520fadb5984c3686f8b63cf574d4820fcf584137a820516afa507',
  MODULE_NAME: 'trade',
  CLOCK_ID: '0x6',
  NETWORK: 'testnet',
};

const client = new SuiClient({
  url: `https://fullnode.${TRADING_CONFIG.NETWORK}.sui.io:443`,
});

// --- Types ---
export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: string;
}

interface RecentTrader {
  address: string;
  lastSeen: number;
}

// --- Helper Components ---

const TabBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-brand-purple rounded-full shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
};

// --- Data Fetching ---
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
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();
  
  const [view, setView] = useState<ViewType>('browse');
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  
  // Notification States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Badge Counters
  const [counts, setCounts] = useState({ pending: 0, received: 0 });

  // Recent Traders State
  const [recentTraders, setRecentTraders] = useState<RecentTrader[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(false);

  // Load user's NFTs & Recent Traders
  useEffect(() => {
    if (account?.address) {
      loadUserNFTs();
      loadRecentTraders();
    } else {
      setUserNFTs([]);
      setRecentTraders([]);
      setCounts({ pending: 0, received: 0 });
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

  // --- Fetch REAL transactions from blockchain ---
  const loadRecentTraders = async () => {
    if (!account?.address) return;
    
    setLoadingTraders(true);
    try {
      const response = await client.queryTransactionBlocks({
        filter: { FromAddress: account.address },
        options: {
          showBalanceChanges: true,
          showEvents: true,
        },
        limit: 30,
        order: 'descending',
      });

      const interactions = new Map<string, number>();

      response.data.forEach((tx) => {
        const timestamp = Number(tx.timestampMs) || Date.now();
        const otherAddresses = new Set<string>();

        tx.balanceChanges?.forEach((change) => {
          const owner = change.owner as any;
          if (owner?.AddressOwner && owner.AddressOwner !== account.address) {
            otherAddresses.add(owner.AddressOwner);
          }
        });

        tx.events?.forEach((event) => {
          const parsedJson = event.parsedJson as any;
          if (parsedJson) {
            Object.values(parsedJson).forEach((value) => {
              if (
                typeof value === 'string' &&
                value.startsWith('0x') &&
                value.length > 60 &&
                value !== account.address &&
                value !== TRADING_CONFIG.PACKAGE_ID
              ) {
                otherAddresses.add(value);
              }
            });
          }
        });

        otherAddresses.forEach((addr) => {
          if (!interactions.has(addr)) {
            interactions.set(addr, timestamp);
          }
        });
      });

      const realTraders: RecentTrader[] = Array.from(interactions.entries())
        .map(([address, lastSeen]) => ({ address, lastSeen }))
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .slice(0, 10);

      setRecentTraders(realTraders);
    } catch (e) {
      console.error('Failed to load recent traders', e);
    } finally {
      setLoadingTraders(false);
    }
  };

  const copyToClipboard = (text: string, label: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    setSuccess(label);
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <>
      <Head>
        <title>NFT Trading Terminal - Beats</title>
      </Head>

      <div className="min-h-screen text-gray-900 bg-white font-sans pb-20 relative overflow-x-hidden">

        {/* TOP BAR */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo Area: Styled like a Record Sleeve */}
                <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-50 to-cyan-50 border-2 border-gray-200 flex items-center justify-center shadow-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-purple/10 group-hover:bg-brand-purple/20 transition-colors" />
                  <Disc className="w-6 h-6 text-brand-purple animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Beats Terminal</h1>
                  <p className="text-sm text-gray-600">P2P Music Swap</p>
                </div>
              </div>

              {account ? (
                <button
                  onClick={() => copyToClipboard(account.address, 'Wallet address copied!')}
                  className="group flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-brand-purple/50 transition-all cursor-pointer"
                >
                  <div className="flex gap-1 items-end h-3">
                    <div className="w-1 h-1.5 bg-green-500 rounded-sm animate-[bounce_1s_infinite]" />
                    <div className="w-1 h-3 bg-green-500 rounded-sm animate-[bounce_1.2s_infinite]" />
                    <div className="w-1 h-2 bg-green-500 rounded-sm animate-[bounce_0.8s_infinite]" />
                  </div>
                  <span className="text-sm font-mono text-gray-700 group-hover:text-gray-900 transition-colors">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-brand-purple transition-colors" />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  Not Connected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="border-b border-gray-200 bg-white sticky top-[80px] z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setView('browse')}
                className={`px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                  view === 'browse'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Browse & Create
                {view === 'browse' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple shadow-[0_-2px_8px_rgba(168,85,247,0.3)]" />
                )}
              </button>

              <button
                onClick={() => setView('pending')}
                className={`px-6 py-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  view === 'pending'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Pending Trades
                <TabBadge count={counts.pending} />
                {view === 'pending' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple shadow-[0_-2px_8px_rgba(168,85,247,0.5)]" />
                )}
              </button>

              <button
                onClick={() => setView('received')}
                className={`px-6 py-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  view === 'received'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Received Offers
                <TabBadge count={counts.received} />
                {view === 'received' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple shadow-[0_-2px_8px_rgba(168,85,247,0.3)]" />
                )}
              </button>

              <button
                onClick={() => setView('history')}
                className={`px-6 py-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  view === 'history'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <History className="w-4 h-4" />
                Trade History
                {view === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple shadow-[0_-2px_8px_rgba(168,85,247,0.3)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-8 min-h-[500px]">
          {!account ? (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-purple/20 rounded-full blur-xl" />
                <div className="w-24 h-24 relative rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center mb-8 shadow-xl">
                  <Wallet className="w-10 h-10 text-brand-purple" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Connect your Sui wallet to view your NFTs, create swaps, and manage your trade offers securely.
              </p>
              <div className="px-6 py-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-600 text-sm">
                Use the wallet button in the navigation bar to connect
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              {view === 'browse' && (
                <>
                  {/* RECENT TRADERS SECTION (Vinyl Style) */}
                  <div className="mb-8">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                           <Disc className="w-4 h-4 text-brand-purple" />
                           Recent Sessions
                        </h3>
                        <button 
                          onClick={loadRecentTraders}
                          disabled={loadingTraders}
                          className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded-md transition-colors"
                          title="Refresh Recent Traders"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingTraders ? 'animate-spin' : ''}`} />
                        </button>
                     </div>
                     
                     {recentTraders.length > 0 ? (
                       <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 no-scrollbar">
                         
                         {/* Create New Trade Button */}
                         <button 
                           onClick={() => setView('browse')} 
                           className="flex-shrink-0 flex flex-col items-center gap-2 group"
                         >
                           <div className="w-14 h-14 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:border-brand-purple group-hover:bg-brand-purple/10 transition-all duration-300">
                             <Plus className="w-5 h-5 text-slate-400 group-hover:text-brand-purple" />
                           </div>
                           <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300">New Mix</span>
                         </button>

                         {/* VINYL RECORD AVATARS */}
                         {recentTraders.map((trader, idx) => (
                           <button
                             key={`${trader.address}-${idx}`}
                             onClick={() => copyToClipboard(trader.address, 'Address copied!')}
                             className="flex-shrink-0 group relative flex flex-col items-center gap-2 transition-transform hover:-translate-y-1"
                           >
                             {/* The Vinyl Disc Container */}
                             <div className="relative w-16 h-16 rounded-full bg-[#080808] shadow-lg border border-white/5 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                               {/* Subtle Vinyl Grooves */}
                               <div className="absolute inset-0 rounded-full border-2 border-white/5 opacity-10 pointer-events-none scale-90" />
                               <div className="absolute inset-0 rounded-full border-2 border-white/5 opacity-10 pointer-events-none scale-75" />
                               
                               {/* The "Label" (Album Art Avatar) */}
                               <div className="w-10 h-10 rounded-full overflow-hidden group-hover:rotate-[360deg] transition-transform duration-[3s] ease-linear">
                                  {/* Using 'shapes' style for abstract album art look */}
                                  <img 
                                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${trader.address}&backgroundColor=1a1d26`}
                                    alt="User Label"
                                    className="w-full h-full object-cover opacity-90"
                                  />
                               </div>

                               {/* The Spindle Hole */}
                               <div className="absolute w-1.5 h-1.5 bg-[#0B0E14] rounded-full ring-1 ring-white/20 z-10" />
                               
                               {/* Status Light (Green LED) */}
                               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] border border-[#0B0E14]" />
                             </div>

                             {/* Metadata */}
                             <div className="flex flex-col items-center mt-1">
                               <span className="text-[10px] font-bold text-slate-300 font-mono group-hover:text-brand-purple transition-colors">
                                 {trader.address.slice(0, 4)}...{trader.address.slice(-2)}
                                </span>
                             </div>
                           </button>
                         ))}
                       </div>
                     ) : (
                       <div className="text-sm text-slate-500 italic py-6 border border-dashed border-white/10 rounded-lg text-center bg-white/5 flex flex-col items-center gap-2">
                         <span>No recent sessions found on-chain.</span>
                         {loadingTraders && <span className="text-xs animate-pulse text-brand-purple">Scanning frequencies...</span>}
                       </div>
                     )}
                  </div>

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
                </>
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
                />
              )}
            </div>
          )}
        </div>

        {/* TOAST NOTIFICATIONS */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
          {error && (
            <div className="pointer-events-auto bg-[#1A1D26] border-l-4 border-red-500 text-slate-200 px-5 py-4 rounded-r shadow-2xl shadow-black/50 flex items-start gap-3 min-w-[320px] max-w-md animate-in slide-in-from-right duration-300">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{error}</div>
              <button onClick={() => setError('')} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="pointer-events-auto bg-[#1A1D26] border-l-4 border-green-500 text-slate-200 px-5 py-4 rounded-r shadow-2xl shadow-black/50 flex items-start gap-3 min-w-[320px] max-w-md animate-in slide-in-from-right duration-300">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{success}</div>
              <button onClick={() => setSuccess('')} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}