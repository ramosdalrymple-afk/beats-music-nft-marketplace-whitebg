// pages/marketplace.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Music, Search, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import BuyForm from '../components/BuyForm';
import SellForm from '../components/SellForm';

// Use your existing package ID
const PACKAGE_ID = '0x08ac46b00eb814de6e803b7abb60b42abbaf49712314f4ed188f4fea6d4ce3ec';
const MARKETPLACE_ID = '0xb9aa59546415a92290e60ad5d90a9d0b013da1b3daa046aba44a0be113a83b84';
const COIN_TYPE = '0x2::sui::SUI';

export default function Marketplace() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();
  
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);

  // Sell Form State
  const [itemToList, setItemToList] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [itemType, setItemType] = useState('');

  // Buy Form State
  const [itemIdToBuy, setItemIdToBuy] = useState('');
  const [buyItemType, setBuyItemType] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  useEffect(() => {
    fetchAllListings();
  }, [client, MARKETPLACE_ID]);

  const fetchAllListings = async () => {
    if (!client) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('Fetching listings from marketplace...');
    
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

  const formatSui = (mist: any) => (Number(mist) / 1_000_000_000).toFixed(4);
  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'listings', label: 'Active Listings', icon: Music },
    { id: 'buy', label: 'Buy', icon: () => <span className="text-xl">🛒</span> },
    { id: 'sell', label: 'Sell', icon: Tag },
  ];

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

        {/* Main Content with Tabs */}
        <div className="glass-dark rounded-lg p-6 border border-brand-purple/20">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-brand-purple/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-brand-purple bg-brand-purple/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Status Messages */}
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

          {success && (
            <div className="mb-4 glass-dark rounded-lg p-3 border border-green-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-400 text-sm font-semibold">Success:</p>
                  <p className="text-slate-300 text-xs mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'listings' && (
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
                        className="glass-dark backdrop-blur-sm border border-brand-purple/30 rounded-xl p-5 hover:border-brand-purple/60 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-1"
                        onClick={() => setSelectedListing(listing)}
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
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'buy' && (
            <BuyForm
              account={account}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              setSuccess={setSuccess}
              signAndExecuteTransaction={signAndExecuteTransaction}
              fetchMarketplaceData={fetchAllListings}
              packageId={PACKAGE_ID}
              marketplaceId={MARKETPLACE_ID}
              coinType={COIN_TYPE}
              itemIdToBuy={itemIdToBuy}
              setItemIdToBuy={setItemIdToBuy}
              buyItemType={buyItemType}
              setBuyItemType={setBuyItemType}
              buyAmount={buyAmount}
              setBuyAmount={setBuyAmount}
            />
          )}

          {activeTab === 'sell' && (
            <SellForm
              account={account}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              setSuccess={setSuccess}
              signAndExecuteTransaction={signAndExecuteTransaction}
              fetchMarketplaceData={fetchAllListings}
              packageId={PACKAGE_ID}
              marketplaceId={MARKETPLACE_ID}
              coinType={COIN_TYPE}
              itemToList={itemToList}
              setItemToList={setItemToList}
              askPrice={askPrice}
              setAskPrice={setAskPrice}
              itemType={itemType}
              setItemType={setItemType}
            />
          )}
        </div>

        {/* NFT Detail Modal */}
        {selectedListing && (
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
                  onClick={() => {
                    setItemIdToBuy(selectedListing.itemId);
                    setBuyItemType(selectedListing.itemType);
                    setBuyAmount(formatSui(selectedListing.askPrice));
                    setActiveTab('buy');
                    setSelectedListing(null);
                  }}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  🛒 Buy This Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}