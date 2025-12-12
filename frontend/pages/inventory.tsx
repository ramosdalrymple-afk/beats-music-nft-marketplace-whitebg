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

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    } else {
      setNfts([]);
      setDebugInfo('Please connect your wallet to view your collection');
    }
  }, [client, account]);

  const fetchUserNFTs = async () => {
    if (!client || !account) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('Fetching your NFT collection...');
    
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
            setDebugInfo(`Item listed successfully! Digest: ${result.digest}`);
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

              {/* Debug Info */}
              {debugInfo && (
                <div className="mb-4 glass-dark rounded-lg p-3 border border-blue-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-400 text-sm font-semibold">Status:</p>
                      <p className="text-slate-300 text-xs mt-1">{debugInfo}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 glass-dark rounded-lg p-3 border border-red-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-semibold">Error:</p>
                      <p className="text-slate-300 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

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

        {/* NFT Detail Modal */}
        {selectedNFT && !showSellModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNFT(null)}
          >
            <div 
              className="glass-dark border border-brand-purple/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold neon-text-glow">{selectedNFT.name}</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-full max-w-[400px] h-[400px] glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30">
                    {selectedNFT.imageUrl && selectedNFT.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                      <img
                        src={selectedNFT.imageUrl.startsWith('http') ? selectedNFT.imageUrl : `https://${selectedNFT.imageUrl}`}
                        alt={selectedNFT.name}
                        className="w-full h-full object-contain"
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
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Description</p>
                    <p className="text-white">{selectedNFT.description}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Creator</p>
                    <p className="text-white font-mono text-sm">{truncateAddress(selectedNFT.creator)}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Owner</p>
                    <p className="text-white font-mono text-sm">{truncateAddress(selectedNFT.owner)}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Object ID</p>
                    <p className="text-white font-mono text-xs break-all">{selectedNFT.itemId}</p>
                  </div>

                  {selectedNFT.attributes && (
                    <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                      <p className="text-slate-400 text-sm mb-1">Attributes</p>
                      <p className="text-white text-sm">{selectedNFT.attributes}</p>
                    </div>
                  )}

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Item Type</p>
                    <p className="text-white font-mono text-xs break-all">{selectedNFT.itemType}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-green-500/30 bg-green-500/10">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✓</span>
                      <div>
                        <p className="text-green-400 font-semibold">You Own This NFT</p>
                        <p className="text-slate-400 text-xs mt-1">This NFT is in your wallet and ready to be listed on the marketplace</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSellModal(true)}
                  className="w-full px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Tag className="w-5 h-5" />
                  List on Marketplace
                </button>
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