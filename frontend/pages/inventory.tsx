// pages/inventory.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Package, Search, AlertCircle, RefreshCw, Wallet, Tag, X } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Use your existing package ID
const PACKAGE_ID = '0x08ac46b00eb814de6e803b7abb60b42abbaf49712314f4ed188f4fea6d4ce3ec';
const MARKETPLACE_ID = '0xb9aa59546415a92290e60ad5d90a9d0b013da1b3daa046aba44a0be113a83b84';
const COIN_TYPE = '0x2::sui::SUI';

export default function Inventory() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();
  
  const [nfts, setNfts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [sellLoading, setSellLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    } else {
      setNfts([]);
      setDebugInfo('Please connect your wallet to view your collection');
    }
  }, [client, account]);

  // Auto-minimize when loading is complete
  useEffect(() => {
    if (!loading && (debugInfo || error)) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, debugInfo, error]);

  const fetchUserNFTs = async () => {
    if (!client || !account) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('Fetching your NFT collection...');
    setIsMinimized(false);
    
    try {
      // Get all objects owned by the user
      const ownedObjects = await client.getOwnedObjects({
        owner: account.address,
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log('Owned objects:', ownedObjects);
      setDebugInfo(`Found ${ownedObjects.data.length} total objects`);

      // Filter for MusicNFT objects
      const musicNFTs = [];
      
      for (const obj of ownedObjects.data) {
        try {
          const objData = obj.data;
          
          // Check if this is a MusicNFT by looking at the type
          if (objData?.type && objData.type.includes('music_nft::MusicNFT')) {
            const nftContent = objData.content?.fields || {};
            
            console.log('Found MusicNFT:', {
              objectId: objData.objectId,
              content: nftContent
            });

            musicNFTs.push({
              itemId: objData.objectId,
              name: nftContent.name || 'Unknown NFT',
              description: nftContent.description || 'No description',
              imageUrl: nftContent.image_url || 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT',
              musicUrl: nftContent.music_url || '',
              creator: nftContent.creator || 'Unknown',
              attributes: nftContent.attributes || '',
              itemType: objData.type,
              isListed: false, // Not listed in marketplace
              owner: account.address,
            });
          }
        } catch (err) {
          console.error('Error processing object:', err);
        }
      }

      setDebugInfo(`Successfully loaded ${musicNFTs.length} Music NFTs from your wallet`);
      setNfts(musicNFTs);
      
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message || 'Failed to fetch your NFT collection');
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSellNFT = async () => {
    if (!selectedNFT || !sellPrice || !account) {
      setError('Please enter a valid price');
      return;
    }

    setSellLoading(true);
    setError('');
    setSuccess('');

    try {
      const priceInMist = Math.floor(parseFloat(sellPrice) * 1_000_000_000);

      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list`,
        typeArguments: [selectedNFT.itemType, COIN_TYPE],
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.object(selectedNFT.itemId),
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
            setSuccess(`NFT listed successfully! Digest: ${result.digest}`);
            setSellPrice('');
            setShowSellModal(false);
            setSelectedNFT(null);
            setSellLoading(false);
            fetchUserNFTs();
          },
          onError: (error: any) => {
            console.error('List transaction error:', error);
            setError(error.message || 'Failed to list item');
            setSellLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('List function error:', err);
      setError(err.message || 'Failed to list item');
      setSellLoading(false);
    }
  };

  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const filteredNFTs = nfts.filter(nft =>
    nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Inventory - Beats</title>
        <meta name="description" content="View your music NFT collection" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/inventory.JPG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Inventory</h1>
          <p className="text-lg text-slate-300">Your collected beats and NFTs</p>
        </div>

        {/* Status Messages - Fixed to Lower Left with Minimize */}
        <div className="fixed bottom-6 left-6 z-40 space-y-3">
          {debugInfo && (
            <div 
              className={`glass-dark rounded-xl border border-blue-500/40 shadow-2xl shadow-blue-500/20 backdrop-blur-xl transition-all duration-500 cursor-pointer ${
                isMinimized ? 'w-12 h-12 p-0' : 'max-w-md p-4'
              }`}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 animate-slide-in-left">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-400 text-sm font-bold mb-1">Status</p>
                    <p className="text-slate-200 text-sm leading-relaxed">{debugInfo}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDebugInfo('');
                      setIsMinimized(false);
                    }}
                    className="text-slate-400 hover:text-white transition-colors ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div 
              className={`glass-dark rounded-xl border border-red-500/40 shadow-2xl shadow-red-500/20 backdrop-blur-xl transition-all duration-500 cursor-pointer ${
                isMinimized ? 'w-12 h-12 p-0' : 'max-w-md p-4'
              }`}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 animate-slide-in-left">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-400 text-sm font-bold mb-1">Error</p>
                    <p className="text-slate-200 text-sm leading-relaxed">{error}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setError('');
                      setIsMinimized(false);
                    }}
                    className="text-slate-400 hover:text-white transition-colors ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Modal */}
        {success && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setSuccess('')}
          >
            <div 
              className="glass-dark border border-brand-purple/50 rounded-2xl p-8 max-w-md w-full animate-scale-in shadow-2xl shadow-brand-purple/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center border border-green-500/50">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-purple">NFT Listed Successfully!</h3>
                <p className="text-slate-300">{success}</p>
                <button
                  onClick={() => setSuccess('')}
                  className="w-full px-6 py-3 bg-brand-purple hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-green-500/50 mt-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="glass-dark rounded-lg p-6 border border-brand-purple/20">
          {!account ? (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-brand-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-slate-400">Please connect your wallet to view your NFT collection</p>
            </div>
          ) : (
            <>
              {/* Collection Info Bar */}
              <div className="mb-6">
                <div className="glass-dark rounded-lg p-4 border border-brand-purple/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm mb-2">
                        View all Music NFTs in your wallet. You can list them on the marketplace or keep them in your collection.
                      </p>
                      <p className="text-brand-purple text-xs">
                        <strong>Wallet:</strong> {truncateAddress(account.address)}
                      </p>
                    </div>
                    <button
                      onClick={fetchUserNFTs}
                      disabled={loading}
                      className="px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/30 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your NFTs by name, ID, or description..."
                    className="w-full glass-dark border border-brand-purple/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50"
                  />
                </div>
              </div>

              {/* NFTs Grid */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading your collection...</p>
                </div>
              ) : filteredNFTs.length === 0 ? (
                <div className="glass-dark rounded-lg p-12 border border-brand-purple/20 text-center space-y-4">
                  <Package className="w-16 h-16 mx-auto text-brand-purple/50" />
                  <p className="text-slate-400 text-lg">
                    {searchTerm ? 'No NFTs match your search.' : 'Your inventory is empty'}
                  </p>
                  <p className="text-slate-500">
                    {searchTerm ? 'Try a different search term.' : 'Start collecting beats from the marketplace'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-sm text-slate-400">
                    Showing {filteredNFTs.length} {filteredNFTs.length === 1 ? 'NFT' : 'NFTs'}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredNFTs.map((nft) => (
                      <div
                        key={nft.itemId}
                        onClick={() => setSelectedNFT(nft)}
                        className="glass-dark backdrop-blur-sm border border-brand-purple/30 rounded-xl p-5 hover:border-brand-purple/60 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-1"
                      >
                        {/* Image Container */}
                        <div className="flex justify-center mb-4">
                          <div className="relative w-full max-w-[200px] h-[200px] glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30">
                            {nft.imageUrl && nft.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                              <img
                                src={nft.imageUrl.startsWith('http') ? nft.imageUrl : `https://${nft.imageUrl}`}
                                alt={nft.name}
                                className="w-full h-full object-contain"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                                onError={(e: any) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="flex flex-col items-center justify-center w-full h-full text-brand-purple"><div class="text-6xl mb-2">🎵</div><div class="text-sm text-slate-400">Image Failed</div></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full text-brand-purple">
                                <div className="text-6xl mb-2">🎵</div>
                                <div className="text-sm text-slate-400">Music NFT</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* NFT Info */}
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg mb-2 truncate">{nft.name}</h3>
                          
                          <p className="text-slate-400 text-xs mb-2">
                            <strong>Object ID:</strong> {nft.itemId.slice(0, 16)}...
                          </p>
                          
                          <div className="mb-3 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full inline-block">
                            <p className="text-green-400 text-xs font-semibold">
                              ✓ Owned
                            </p>
                          </div>
                          
                          <p className="text-slate-500 text-xs mb-3 line-clamp-2">
                            {nft.description}
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNFT(nft);
                            }}
                            className="w-full px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/50 text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            List NFT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* NFT Detail Modal - Modern Rectangle Design */}
        {selectedNFT && !showSellModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNFT(null)}
          >
              <div 
                // Changed max-w-5xl to max-w-3xl (smaller width)
                // Changed max-h-[90vh] to max-h-[85vh] (slightly smaller height)
                className="glass-dark border border-brand-purple/30 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-brand-purple/20"
                onClick={(e) => e.stopPropagation()}
              >
              {/* Header Bar */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-brand-purple/20 bg-gradient-to-r from-brand-purple/10 to-transparent">
                <div>
                  <h2 className="text-2xl font-bold neon-text-glow">{selectedNFT.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">Object ID: {truncateAddress(selectedNFT.itemId)}</p>
                </div>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="w-10 h-10 flex items-center justify-center glass-dark border border-brand-purple/30 rounded-lg hover:bg-brand-purple/20 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content Area - Split Layout */}
              <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Left Column - Image */}
                <div className="space-y-4">
                  <div className="relative w-full aspect-square glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30 group">
                    {selectedNFT.imageUrl && selectedNFT.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                      <img
                        src={selectedNFT.imageUrl.startsWith('http') ? selectedNFT.imageUrl : `https://${selectedNFT.imageUrl}`}
                        alt={selectedNFT.name}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex flex-col items-center justify-center w-full h-full text-brand-purple"><div class="text-8xl mb-2">🎵</div><div class="text-sm text-slate-400">Image Failed</div></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-brand-purple">
                        <div className="text-8xl mb-2">🎵</div>
                        <div className="text-sm text-slate-400">Music NFT</div>
                      </div>
                    )}
                  </div>

                  {/* Ownership Card - Featured */}
                  <div className="glass-dark rounded-lg p-6 border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center border border-green-500/50">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div>
                        <p className="text-green-400 font-bold text-lg">You Own This NFT</p>
                        <p className="text-slate-400 text-xs">Ready to be listed on marketplace</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  {/* Description */}
                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Description</p>
                    <p className="text-white leading-relaxed">{selectedNFT.description}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                      <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Creator</p>
                      <p className="text-white font-mono text-sm">{truncateAddress(selectedNFT.creator)}</p>
                    </div>

                    <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                      <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Owner</p>
                      <p className="text-white font-mono text-sm">{truncateAddress(selectedNFT.owner)}</p>
                    </div>
                  </div>

                  {/* Object ID */}
                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Object ID</p>
                    <p className="text-slate-300 font-mono text-xs break-all">{selectedNFT.itemId}</p>
                  </div>

                  {/* Attributes */}
                  {selectedNFT.attributes && (
                    <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                      <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Attributes</p>
                      <p className="text-white text-sm">{selectedNFT.attributes}</p>
                    </div>
                  )}

                  {/* Item Type */}
                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-brand-purple text-xs uppercase tracking-wider mb-2 font-semibold">Item Type</p>
                    <p className="text-slate-300 font-mono text-xs break-all">{selectedNFT.itemType}</p>
                  </div>

                  {/* Action Section */}
                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
                      <p className="text-brand-purple text-xs uppercase tracking-wider font-semibold">Ready to List</p>
                    </div>
                    <button
                      onClick={() => setShowSellModal(true)}
                      className="w-full px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-brand-purple/50 flex items-center justify-center gap-2"
                    >
                      <Tag className="w-5 h-5" />
                      List on Marketplace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sell Confirmation Modal */}
        {showSellModal && selectedNFT && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowSellModal(false);
              setSellPrice('');
              setError('');
            }}
          >
            <div 
              className="glass-dark border border-brand-purple/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold neon-text-glow mb-1">List NFT</h2>
                  <p className="text-slate-400 text-sm">Set your asking price</p>
                </div>
                <button
                  onClick={() => {
                    setShowSellModal(false);
                    setSellPrice('');
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* NFT Preview */}
              <div className="glass-dark rounded-lg p-4 border border-brand-purple/20 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30 flex-shrink-0">
                    {selectedNFT.imageUrl && selectedNFT.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                      <img
                        src={selectedNFT.imageUrl.startsWith('http') ? selectedNFT.imageUrl : `https://${selectedNFT.imageUrl}`}
                        alt={selectedNFT.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-3xl">🎵</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{selectedNFT.name}</h3>
                    <p className="text-slate-400 text-xs truncate">{selectedNFT.itemId}</p>
                  </div>
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Asking Price (SUI)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="1.5"
                    className="w-full glass-dark border border-brand-purple/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50"
                    autoFocus
                  />
                  {sellPrice && (
                    <p className="text-slate-500 text-xs mt-2">
                      ≈ {Math.floor(parseFloat(sellPrice) * 1_000_000_000).toLocaleString()} MIST
                    </p>
                  )}
                </div>

                {error && (
                  <div className="glass-dark rounded-lg p-3 border border-red-500/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="glass-dark rounded-lg p-3 border border-yellow-500/30 bg-yellow-500/10">
                  <p className="text-yellow-400 text-xs">
                    <strong>Note:</strong> Once listed, your NFT will be transferred to the marketplace. You can delist it anytime before it's sold.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSellModal(false);
                      setSellPrice('');
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                    disabled={sellLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSellNFT}
                    disabled={!sellPrice || sellLoading}
                    className="flex-1 px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {sellLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Listing...
                      </>
                    ) : (
                      <>
                        <Tag className="w-5 h-5" />
                        Confirm Listing
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}