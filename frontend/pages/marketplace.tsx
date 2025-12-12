// pages/marketplace.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Music, Search, AlertCircle, RefreshCw, Wallet, ShoppingCart, X } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Use your existing package ID
const PACKAGE_ID = '0x08ac46b00eb814de6e803b7abb60b42abbaf49712314f4ed188f4fea6d4ce3ec';
const MARKETPLACE_ID = '0xb9aa59546415a92290e60ad5d90a9d0b013da1b3daa046aba44a0be113a83b84';
const COIN_TYPE = '0x2::sui::SUI';

export default function Marketplace() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();
  
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    fetchAllListings();
  }, [client, MARKETPLACE_ID]);

  // Auto-minimize when loading is complete
  useEffect(() => {
    if (!loading && (debugInfo || error)) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, debugInfo, error]);

  const fetchAllListings = async () => {
    if (!client) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('Fetching listings from marketplace...');
    setIsMinimized(false);
    
    try {
      const marketplaceObj = await client.getObject({
        id: MARKETPLACE_ID,
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log('Marketplace object:', marketplaceObj);

      if (!marketplaceObj?.data?.content) {
        throw new Error('Marketplace object not found or has no content');
      }

      setDebugInfo('Marketplace loaded. Searching for listed items...');

      // Check if the marketplace has the items field
      const itemsField = marketplaceObj.data.content.fields?.items;
      if (!itemsField?.fields?.id?.id) {
        throw new Error('Marketplace items field not found');
      }

      const dynamicFields = await client.getDynamicFields({
        parentId: itemsField.fields.id.id,
      });

      console.log('Dynamic fields:', dynamicFields);
      setDebugInfo(`Found ${dynamicFields?.data?.length || 0} dynamic fields`);

      if (dynamicFields.data.length === 0) {
        setDebugInfo('No items in marketplace. List an NFT first!');
        setListings([]);
        setLoading(false);
        return;
      }

      // Fetch each listing
      const activeListings = [];
      for (const field of dynamicFields.data) {
        try {
          // Get the listing object
          const listingField = await client.getObject({
            id: field.objectId,
            options: {
              showContent: true,
            },
          });

          console.log('Listing field:', listingField);

          const listingData = listingField.data?.content?.fields?.value?.fields;
          if (!listingData) continue;

          const itemId = field.name.value;
          const askPrice = listingData.ask;
          const owner = listingData.owner;

          // Now get the actual NFT data
          const listingId = listingData.id.id;
          
          // Get dynamic fields of the listing to find the NFT
          const nftFields = await client.getDynamicFields({
            parentId: listingId,
          });

          console.log('NFT fields:', nftFields);

          if (nftFields.data.length > 0) {
            // Get the NFT object
            const nftFieldObj = await client.getObject({
              id: nftFields.data[0].objectId,
              options: {
                showContent: true,
                showType: true,
              },
            });

            console.log('NFT object:', nftFieldObj);

            let nftContent = nftFieldObj.data?.content?.fields?.value?.fields || {};
            
            if (!nftContent.name) {
              nftContent = nftFieldObj.data?.content?.fields || {};
            }
            
            console.log('NFT Content Details:', {
              name: nftContent.name,
              description: nftContent.description,
              image_url: nftContent.image_url,
              music_url: nftContent.music_url,
              attributes: nftContent.attributes
            });
            
            activeListings.push({
              itemId: itemId,
              askPrice: askPrice,
              owner: owner,
              listingId: listingId,
              name: nftContent.name || 'Unknown NFT',
              description: nftContent.description || 'No description',
              imageUrl: nftContent.image_url || 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT',
              musicUrl: nftContent.music_url || '',
              attributes: nftContent.attributes || '',
              itemType: nftFieldObj.data?.type || 'Unknown',
            });
          }
        } catch (err) {
          console.error('Error fetching listing:', err);
        }
      }

      setDebugInfo(`Successfully loaded ${activeListings.length} active listings`);
      setListings(activeListings);
      
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Failed to fetch listings');
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!selectedListing || !account) {
      setError('Please connect wallet');
      return;
    }

    setBuyLoading(true);
    setError('');
    setSuccess('');

    try {
      const amountInMist = Number(selectedListing.askPrice);

      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(amountInMist)]);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::buy_and_take`,
        typeArguments: [selectedListing.itemType, COIN_TYPE],
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure(selectedListing.itemId),
          coin,
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
            console.log('Buy transaction successful:', result);
            setSuccess(`Item purchased successfully! Digest: ${result.digest}`);
            setShowBuyModal(false);
            setSelectedListing(null);
            setBuyLoading(false);
            fetchAllListings();
          },
          onError: (error: any) => {
            console.error('Buy transaction error:', error);
            setError(error.message || 'Failed to purchase item');
            setBuyLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Buy function error:', err);
      setError(err.message || 'Failed to purchase item');
      setBuyLoading(false);
    }
  };

  const formatSui = (mist: any) => (Number(mist) / 1_000_000_000).toFixed(4);
  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Marketplace - Beats</title>
        <meta name="description" content="Buy and sell music NFTs on the Beats marketplace" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/marketplace.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Marketplace</h1>
          <p className="text-lg text-slate-300">
            Beats Marketplace is the heart of the Beats' 
            project. It is created to support the project 
            perfectly. Designed to open doors to different 
            creators everywhere and to be the main 
            platform where they can auction their own 
            creations or arts.
          </p>
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
                <h3 className="text-2xl font-bold text-green-400">Purchase Successful!</h3>
                <p className="text-slate-300">{success}</p>
                <button
                  onClick={() => setSuccess('')}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-green-500/50 mt-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Active Listings */}
        <div className="glass-dark rounded-lg p-6 border border-brand-purple/20">
          {!account ? (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-brand-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-slate-400">Please connect your wallet to view and purchase NFTs</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Active Listings</h2>
                  <button
                    onClick={fetchAllListings}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-semibold">{loading ? 'Loading...' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, ID, or description..."
                      className="w-full glass-dark border border-brand-purple/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50"
                    />
                  </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading listings...</p>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="glass-dark rounded-lg p-12 border border-brand-purple/20 text-center space-y-4">
                    <Music className="w-16 h-16 mx-auto text-brand-purple/50" />
                    <p className="text-slate-400 text-lg">
                      {searchTerm ? 'No listings match your search.' : 'No active listings yet'}
                    </p>
                    <p className="text-slate-500">
                      {searchTerm ? 'Try a different search term.' : 'Check back later for new music NFTs'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 text-sm text-slate-400">
                      Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredListings.map((listing) => (
                        <div
                          key={listing.itemId}
                          onClick={() => setSelectedListing(listing)}
                          className="glass-dark backdrop-blur-sm border border-brand-purple/30 rounded-xl p-5 hover:border-brand-purple/60 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-1"
                        >
                          {/* Image Container */}
                          <div className="flex justify-center mb-4">
                            <div className="relative w-full max-w-[200px] h-[200px] glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30">
                              {listing.imageUrl && listing.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                                <img
                                  src={listing.imageUrl.startsWith('http') ? listing.imageUrl : `https://${listing.imageUrl}`}
                                  alt={listing.name}
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
                            <h3 className="text-white font-bold text-lg mb-2 truncate">{listing.name}</h3>
                            
                            <p className="text-slate-400 text-xs mb-2">
                              <strong>Item ID:</strong> {listing.itemId.slice(0, 16)}...
                            </p>
                            
                            <p className="text-brand-purple font-bold text-xl mb-2 neon-text-glow">
                              {formatSui(listing.askPrice)} SUI
                            </p>
                            
                            <p className="text-slate-500 text-xs mb-3 line-clamp-2">
                              {listing.description}
                            </p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedListing(listing);
                              }}
                              className="w-full px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/50 text-white rounded-lg font-semibold transition-colors text-sm"
                            >
                              Buy NFT
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* NFT Detail Modal */}
        {selectedListing && !showBuyModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedListing(null)}
          >
            <div 
              className="glass-dark border border-brand-purple/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold neon-text-glow">{selectedListing.name}</h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-full max-w-[400px] h-[400px] glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-brand-purple/30">
                    {selectedListing.imageUrl && selectedListing.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                      <img
                        src={selectedListing.imageUrl.startsWith('http') ? selectedListing.imageUrl : `https://${selectedListing.imageUrl}`}
                        alt={selectedListing.name}
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
                    <p className="text-white">{selectedListing.description}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Price</p>
                    <p className="text-brand-purple font-bold text-2xl neon-text-glow">
                      {formatSui(selectedListing.askPrice)} SUI
                    </p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Owner</p>
                    <p className="text-white font-mono text-sm">{truncateAddress(selectedListing.owner)}</p>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Item ID</p>
                    <p className="text-white font-mono text-xs break-all">{selectedListing.itemId}</p>
                  </div>

                  {selectedListing.attributes && (
                    <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                      <p className="text-slate-400 text-sm mb-1">Attributes</p>
                      <p className="text-white text-sm">{selectedListing.attributes}</p>
                    </div>
                  )}

                  <div className="glass-dark rounded-lg p-4 border border-brand-purple/20">
                    <p className="text-slate-400 text-sm mb-1">Item Type</p>
                    <p className="text-white font-mono text-xs break-all">{selectedListing.itemType}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy This Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buy Confirmation Modal */}
        {showBuyModal && selectedListing && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowBuyModal(false);
              setError('');
            }}
          >
            <div 
              className="glass-dark border border-green-500/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-1">Buy NFT</h2>
                  <p className="text-slate-400 text-sm">Confirm your purchase</p>
                </div>
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* NFT Preview */}
              <div className="glass-dark rounded-lg p-4 border border-green-500/20 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 glass-dark rounded-lg overflow-hidden flex items-center justify-center border border-green-500/30 flex-shrink-0">
                    {selectedListing.imageUrl && selectedListing.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                      <img
                        src={selectedListing.imageUrl.startsWith('http') ? selectedListing.imageUrl : `https://${selectedListing.imageUrl}`}
                        alt={selectedListing.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-3xl">🎵</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{selectedListing.name}</h3>
                    <p className="text-slate-400 text-xs truncate">{selectedListing.itemId}</p>
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-4">
                <div className="glass-dark rounded-lg p-4 border border-green-500/20">
                  <p className="text-slate-400 text-sm mb-2">Purchase Price</p>
                  <p className="text-green-400 font-bold text-3xl">
                    {formatSui(selectedListing.askPrice)} SUI
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    ≈ {Number(selectedListing.askPrice).toLocaleString()} MIST
                  </p>
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
                    <strong>Note:</strong> This transaction will transfer the NFT to your wallet and deduct the purchase price from your balance.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBuyModal(false);
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                    disabled={buyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuyNFT}
                    disabled={buyLoading}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {buyLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Buying...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Confirm Purchase
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