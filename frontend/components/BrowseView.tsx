// components/BrowseView.tsx
import React, { useState } from 'react';
import { Search, Loader, ArrowLeftRight } from 'lucide-react';
import { TRADING_CONFIG, fetchNFTs, NFT } from '../pages/trade';
import NFTCard from './NFTCard';
import { SuiClient } from '@mysten/sui.js/client';

interface BrowseViewProps {
  account: any;
  client: SuiClient;
  userNFTs: NFT[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  signAndExecuteTransaction: any;
  loadingNFTs: boolean;
  setLoadingNFTs: (loading: boolean) => void;
  setView: (view: 'browse' | 'pending' | 'received') => void;
  refreshTrigger: number;
  setRefreshTrigger: (trigger: number) => void;
}

const BrowseView: React.FC<BrowseViewProps> = ({
  account,
  client,
  userNFTs,
  loading,
  setLoading,
  setError,
  setSuccess,
  signAndExecuteTransaction,
  loadingNFTs,
  setLoadingNFTs,
  setView,
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const [targetAddress, setTargetAddress] = useState('');
  const [targetNFTs, setTargetNFTs] = useState<NFT[]>([]);
  const [selectedMyNFT, setSelectedMyNFT] = useState<NFT | null>(null);
  const [selectedTargetNFT, setSelectedTargetNFT] = useState<NFT | null>(null);

  // Refresh both wallets
  const handleRefreshWallets = async () => {
    setLoadingNFTs(true);
    
    // Refresh user's wallet
    setRefreshTrigger(refreshTrigger + 1);
    
    // Refresh target wallet if address exists
    if (targetAddress) {
      try {
        const nfts = await fetchNFTs(targetAddress, client);
        setTargetNFTs(nfts);
      } catch (err) {
        console.error('Failed to refresh target wallet:', err);
      }
    }
    
    setLoadingNFTs(false);
  };

  const handleBrowseUser = async () => {
    if (!targetAddress) {
      setError('Please enter a Sui address');
      return;
    }

    setLoadingNFTs(true);
    setError('');
    try {
      const nfts = await fetchNFTs(targetAddress, client);
      if (nfts.length === 0) {
        setError('No NFTs found for this address');
      }
      setTargetNFTs(nfts);
    } catch (err: any) {
      setError('Failed to fetch NFTs: ' + err.message);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const handleMyNFTSelection = (nft: NFT) => {
    setSelectedMyNFT(prev => prev?.id === nft.id ? null : nft);
  };

  const handleTargetNFTSelection = (nft: NFT) => {
    setSelectedTargetNFT(prev => prev?.id === nft.id ? null : nft);
  };

  const handleCreateTrade = async () => {
    console.log('=== Create Trade Started ===');
    console.log('Selected My NFT:', selectedMyNFT);
    console.log('Selected Target NFT:', selectedTargetNFT);
    console.log('Target Address:', targetAddress);
    console.log('Account:', account);

    if (!selectedMyNFT || !selectedTargetNFT || !account) {
      setError('Please select one NFT from each side');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { TransactionBlock } = await import('@mysten/sui.js/transactions');
      
      const tx = new TransactionBlock();
      
      console.log('Building transaction...');
      console.log('Package ID:', TRADING_CONFIG.PACKAGE_ID);
      console.log('Module:', TRADING_CONFIG.MODULE_NAME);
      
      tx.moveCall({
        target: `${TRADING_CONFIG.PACKAGE_ID}::${TRADING_CONFIG.MODULE_NAME}::create_trade`,
        typeArguments: [selectedMyNFT.type, selectedTargetNFT.type],
        arguments: [
          tx.object(selectedMyNFT.id),
          tx.pure(targetAddress, 'address'),
          tx.pure(selectedTargetNFT.id, 'address'),
          tx.object(TRADING_CONFIG.CLOCK_ID),
        ],
      });

      console.log('Transaction built, executing...');
      console.log('Transaction:', tx);

      // Execute transaction using the mutation
      signAndExecuteTransaction(
        {
          transactionBlock: tx,
        },
        {
          onSuccess: (result: any) => {
            console.log('✅ Trade created successfully:', result);
            setSuccess('Trade request created successfully!');
            setSelectedMyNFT(null);
            setSelectedTargetNFT(null);
            setRefreshTrigger(refreshTrigger + 1);
            setLoading(false);
            setTimeout(() => setView('pending'), 1000);
          },
          onError: (error: Error) => {
            console.error('❌ Trade creation failed:', error);
            setError('Failed to create trade: ' + error.message);
            setLoading(false);
          },
        }
      );
      
      console.log('signAndExecuteTransaction called');
    } catch (err: any) {
      console.error('❌ Transaction preparation failed:', err);
      setError('Failed to prepare trade: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search User */}
      <div className="bg-[#11141D] border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Find User's NFTs</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Sui address (0x...)"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0B0E14] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple transition-colors"
          />
          <button
            onClick={handleBrowseUser}
            disabled={loadingNFTs || !targetAddress}
            className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/90 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingNFTs ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Browse
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create Trade */}
      {targetNFTs.length > 0 && (
        <div className="bg-[#11141D] border border-white/5 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-brand-purple" />
              Create Trade Request
            </h3>
            <button
              onClick={handleRefreshWallets}
              disabled={loadingNFTs}
              className="px-4 py-2 bg-[#0B0E14] hover:bg-white/5 rounded-lg text-white transition-colors flex items-center gap-2 border border-white/5"
            >
              {loadingNFTs ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Refresh Wallets
                </>
              )}
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Your NFTs - Single select */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-brand-purple uppercase tracking-wider">
                  YOUR NFT (Selected {selectedMyNFT ? 1 : 0})
                </h4>
              </div>
              <div style={{maxHeight: '500px', overflowY: 'auto'}} className="space-y-2 custom-scrollbar pr-2 border border-white/5 rounded-lg p-3 bg-[#0B0E14]">
                {loadingNFTs ? (
                  <div className="text-center py-8 text-slate-400">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading your NFTs...
                  </div>
                ) : userNFTs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No NFTs found in your wallet</p>
                ) : (
                  userNFTs.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      isSelected={selectedMyNFT?.id === nft.id}
                      onSelect={() => handleMyNFTSelection(nft)}
                      selectionColor="purple"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Target NFTs - Single select */}
            <div>
              <h4 className="text-sm font-semibold text-brand-cyan mb-3 uppercase tracking-wider">
                OTHERS NFT (Selected {selectedTargetNFT ? 1 : 0})
              </h4>
              <div style={{maxHeight: '500px', overflowY: 'auto'}} className="space-y-2 custom-scrollbar pr-2 border border-white/5 rounded-lg p-3 bg-[#0B0E14]">
                {targetNFTs.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    isSelected={selectedTargetNFT?.id === nft.id}
                    onSelect={() => handleTargetNFTSelection(nft)}
                    selectionColor="cyan"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Create Trade Button */}
          <button
            onClick={handleCreateTrade}
            disabled={!selectedMyNFT || !selectedTargetNFT || loading}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-brand-purple to-brand-cyan hover:from-brand-purple/90 hover:to-brand-cyan/90 rounded-lg font-bold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Trade...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-5 h-5" />
                Create Trade Request
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseView;