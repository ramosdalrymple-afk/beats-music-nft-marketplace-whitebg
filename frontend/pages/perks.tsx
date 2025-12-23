import React, { useState, useEffect, useRef } from 'react';
// Helper: Portal for background effect
import { createPortal } from 'react-dom';
import {
  TrendingUp, Music, Gift, Zap,
  BarChart3, Lock, CheckCircle,
  Radio, Headphones, Wallet, Trophy,
  Bell, LineChart, Target, Award,
  Plane, MapPin, Globe
} from 'lucide-react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

// Membership Tiers based on NFT count
const TIERS = [
  { name: 'No Tier', minNFTs: 0, color: 'text-gray-400', bgColor: 'bg-gray-50' },
  { name: 'Listener', minNFTs: 1, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { name: 'Collector', minNFTs: 3, color: 'text-brand-cyan', bgColor: 'bg-cyan-50' },
  { name: 'Curator', minNFTs: 5, color: 'text-brand-purple', bgColor: 'bg-purple-50' },
  { name: 'Legend', minNFTs: 10, color: 'text-brand-orange', bgColor: 'bg-orange-50' },
];

// Skybeats Destinations
const DESTINATIONS = [
  {
    id: 'ibiza',
    city: 'Ibiza',
    country: 'Spain',
    code: 'IBZ',
    image: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?q=80&w=1974&auto=format&fit=crop',
    basePrice: 1200
  },
  {
    id: 'miami',
    city: 'Miami',
    country: 'USA',
    code: 'MIA',
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2070&auto=format&fit=crop',
    basePrice: 900
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    code: 'ICN',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1974&auto=format&fit=crop',
    basePrice: 1500
  },
];

export default function PerksPage() {
  const [activeTab, setActiveTab] = useState<'trading' | 'signals' | 'p2e' | 'skybeats'>('trading');
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const account = useCurrentAccount();
  const client = useSuiClient();

  // Fetch user's NFTs from wallet
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account?.address) {
        setUserNFTs([]);
        return;
      }

      try {
        setLoading(true);
        const objects = await client.getOwnedObjects({
          owner: account.address,
          options: {
            showType: true,
            showContent: true,
            showDisplay: true,
          },
        });

        console.log('All owned objects:', objects.data.length);

        // Filter for Beats NFTs (you may need to adjust the type filter based on your actual NFT package)
        // For now, we'll accept any NFT to demonstrate the tier system working
        const nfts = objects.data.filter((obj) => {
          const type = obj.data?.type || '';
          const isBeatsNFT = type.toLowerCase().includes('beats') ||
                            type.toLowerCase().includes('soul') ||
                            type.toLowerCase().includes('nft');

          console.log('Object type:', type, 'Is Beats NFT:', isBeatsNFT);
          return isBeatsNFT;
        });

        console.log('Filtered Beats NFTs:', nfts.length);
        setUserNFTs(nfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setUserNFTs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [account?.address, client]);

  // Calculate NFT count
  const nftCount = userNFTs.length;

  // Determine current tier based on NFT count
  const currentTier = [...TIERS].reverse().find(t => nftCount >= t.minNFTs) || TIERS[0];

  // Calculate progress to next tier
  const nextTierIndex = TIERS.findIndex(t => t.minNFTs > nftCount);
  const nextTier = nextTierIndex !== -1 ? TIERS[nextTierIndex] : null;
  const prevTierNFTs = currentTier ? currentTier.minNFTs : 0;
  const progressPercent = nextTier
    ? ((nftCount - prevTierNFTs) / (nextTier.minNFTs - prevTierNFTs)) * 100
    : 100;

  const hasNFT = nftCount > 0;

  // Ref for footer
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* Background Effects - covers whole page except footer */}
      {typeof window !== 'undefined' && createPortal(
        <div className={`pointer-events-none overflow-hidden fixed inset-0 z-0 transition-opacity duration-500 ${footerVisible ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-100 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-100 blur-[100px] rounded-full" />
        </div>,
        document.body
      )}
      <div className="flex-1 relative z-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-orange bg-clip-text text-transparent">
              NFT Holder Perks
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock exclusive benefits and features by holding Beats NFTs. The more you collect, the more you earn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Membership Status */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-brand-purple to-brand-cyan rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Status</h2>
                    <p className="text-sm text-gray-600">NFT Membership Tier</p>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className={`${currentTier.bgColor} border-2 border-gray-200 rounded-xl p-6 mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-3xl font-black ${currentTier.color}`}>
                      {!account ? 'Not Connected' : currentTier.name}
                    </span>
                    <Trophy className={`w-8 h-8 ${currentTier.color}`} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">
                      {!account ? 'Connect wallet to view status' : `${nftCount} NFTs Owned`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                    <span>{nftCount} NFTs</span>
                    <span>{nextTier ? `Next: ${nextTier.name} (${nextTier.minNFTs} NFTs)` : 'Max Level'}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* NFT Holdings */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-3">Your NFTs ({nftCount})</div>
                  {!account ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Connect your wallet to view your NFTs
                    </div>
                  ) : loading ? (
                    <div className="text-center py-4 text-gray-500">Loading NFTs...</div>
                  ) : userNFTs.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userNFTs.map((nft, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-brand-purple to-brand-cyan border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Beats NFT #{idx + 1}</p>
                            <p className="text-xs text-gray-600">{currentTier.name} Tier</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No Beats NFTs found in your wallet
                    </div>
                  )}
                </div>

                {!hasNFT && account && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-sm text-orange-900 font-semibold">
                      Acquire NFTs from the Marketplace to unlock all perks!
                    </p>
                  </div>
                )}

                {!account && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900 font-semibold">
                      Connect your wallet to see your tier status and unlock exclusive perks!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Benefits Tabs */}
          <div className="lg:col-span-8">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setActiveTab('trading')}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'trading'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Trading Dashboard
              </button>
              <button
                onClick={() => setActiveTab('signals')}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'signals'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Radio className="w-5 h-5" />
                VIP Signals
              </button>
              <button
                onClick={() => setActiveTab('p2e')}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'p2e'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Music className="w-5 h-5" />
                Play to Earn
              </button>
              <button
                onClick={() => setActiveTab('skybeats')}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'skybeats'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Plane className="w-5 h-5" />
                Skybeats
              </button>
            </div>

            {/* Trading Dashboard Content */}
            {activeTab === 'trading' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-cyan-50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Trading Dashboard Access</h3>
                      <p className="text-gray-600">Real-time market analytics for NFT holders</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <LineChart className={`w-6 h-6 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Advanced Charts</h4>
                      <p className="text-sm text-gray-600">Technical analysis tools with candlestick patterns and volume indicators</p>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <BarChart3 className={`w-6 h-6 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Portfolio Analytics</h4>
                      <p className="text-sm text-gray-600">Track your NFT portfolio value, ROI, and performance metrics</p>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Bell className={`w-6 h-6 ${nftCount >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                        {nftCount >= 3 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Price Alerts</h4>
                      <p className="text-sm text-gray-600">Custom notifications for price movements and trading opportunities</p>
                      {nftCount < 3 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Collector tier (3+ NFTs)</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Target className={`w-6 h-6 ${nftCount >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
                        {nftCount >= 5 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Trade History & Insights</h4>
                      <p className="text-sm text-gray-600">Deep analytics on past trades with profit/loss breakdowns</p>
                      {nftCount < 5 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Curator tier (5+ NFTs)</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                    <p className="text-sm text-cyan-900">
                      <span className="font-bold">Pro Tip:</span> Access the Trading Dashboard from the Trade tab in navigation to monitor market trends and make informed trading decisions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIP Signals Content */}
            {activeTab === 'signals' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Radio className="w-6 h-6 text-brand-purple" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">VIP Trading Signals</h3>
                      <p className="text-gray-600">Exclusive market insights and opportunities</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className={`w-5 h-5 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                            <h4 className="font-bold text-gray-900">Daily Market Signals</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Receive curated buy/sell signals based on market analysis, trending NFTs, and volume spikes
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Top trending collections</li>
                            <li>• Undervalued NFT alerts</li>
                            <li>• Volume surge notifications</li>
                          </ul>
                        </div>
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className={`w-5 h-5 ${nftCount >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                            <h4 className="font-bold text-gray-900">Whale Activity Tracking</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Monitor large transactions and wallet movements from top collectors
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Real-time whale alerts</li>
                            <li>• Smart money tracking</li>
                            <li>• Collection accumulation patterns</li>
                          </ul>
                        </div>
                        {nftCount >= 3 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      {nftCount < 3 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Collector tier (3+ NFTs)</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className={`w-5 h-5 ${nftCount >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
                            <h4 className="font-bold text-gray-900">Priority Signal Access</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Get signals before the general market with early access notifications
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• 1-hour early access to signals</li>
                            <li>• Exclusive drop previews</li>
                            <li>• Pre-listing opportunities</li>
                          </ul>
                        </div>
                        {nftCount >= 5 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      {nftCount < 5 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Curator tier (5+ NFTs)</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-900">
                      <span className="font-bold">Signal Accuracy:</span> Our VIP signals have a 73% success rate based on 30-day historical performance. Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Play to Earn Content */}
            {activeTab === 'p2e' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-50 rounded-xl">
                      <Headphones className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Beats Music - Play to Earn</h3>
                      <p className="text-gray-600">Earn $SOUL tokens by listening to music</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Music className={`w-6 h-6 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Listen & Earn</h4>
                      <p className="text-sm text-gray-600 mb-2">Earn $SOUL tokens for every minute of music you listen to</p>
                      <p className="text-xs text-gray-500 font-semibold">Base Rate: 0.1 $SOUL/min</p>
                      {!hasNFT && <p className="text-xs text-orange-600 font-semibold mt-2">Requires at least 1 NFT</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Zap className={`w-6 h-6 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Tier Multipliers</h4>
                      <p className="text-sm text-gray-600 mb-2">Higher tiers earn more per minute</p>
                      <div className="text-xs space-y-1">
                        <p className="text-gray-600">Listener: 1x</p>
                        <p className="text-cyan-600 font-semibold">Collector: 1.5x</p>
                        <p className="text-purple-600 font-semibold">Curator: 2x</p>
                        <p className="text-orange-600 font-semibold">Legend: 3x</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Trophy className={`w-6 h-6 ${nftCount >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                        {nftCount >= 3 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Daily Challenges</h4>
                      <p className="text-sm text-gray-600 mb-2">Complete listening challenges for bonus rewards</p>
                      <p className="text-xs text-gray-500">Bonus: Up to 100 $SOUL/day</p>
                      {nftCount < 3 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Collector tier (3+ NFTs)</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Gift className={`w-6 h-6 ${nftCount >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
                        {nftCount >= 5 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Exclusive Drops</h4>
                      <p className="text-sm text-gray-600 mb-2">Access to limited edition tracks and artist collaborations</p>
                      <p className="text-xs text-gray-500">Early access to new releases</p>
                      {nftCount < 5 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Curator tier (5+ NFTs)</p>}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-purple-50 to-orange-50 border-2 border-orange-200 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-brand-orange" />
                      Your Earning Potential
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-black text-brand-cyan">{nftCount >= 10 ? '0.3' : nftCount >= 5 ? '0.2' : nftCount >= 3 ? '0.15' : '0.1'}</p>
                        <p className="text-xs text-gray-600">$SOUL per min</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-brand-purple">{nftCount >= 10 ? '18' : nftCount >= 5 ? '12' : nftCount >= 3 ? '9' : '6'}</p>
                        <p className="text-xs text-gray-600">$SOUL per hour</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-brand-orange">{nftCount >= 10 ? '432' : nftCount >= 5 ? '288' : nftCount >= 3 ? '216' : '144'}</p>
                        <p className="text-xs text-gray-600">$SOUL per day</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-green-600">{nftCount >= 10 ? '12,960' : nftCount >= 5 ? '8,640' : nftCount >= 3 ? '6,480' : '4,320'}</p>
                        <p className="text-xs text-gray-600">$SOUL per month</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4 text-center">
                      *Based on {currentTier.name} tier ({nftCount >= 10 ? '3x' : nftCount >= 5 ? '2x' : nftCount >= 3 ? '1.5x' : '1x'} multiplier) listening 4 hours daily
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                    <p className="text-sm text-cyan-900">
                      <span className="font-bold">Start Earning:</span> Visit the Beats Music tab to start your listening session and earn $SOUL tokens automatically. NFT holders get instant access!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Skybeats Content */}
            {activeTab === 'skybeats' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Skybeats Protocol</h3>
                      <p className="text-gray-600">Exclusive travel experiences for NFT holders</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">
                    Skybeats is our exclusive travel rewards program for Beats NFT holders. Earn discounts on flights and unlock VIP experiences at major music festivals worldwide based on your tier level.
                  </p>

                  {/* Tier Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className={`p-6 rounded-xl border-2 ${hasNFT ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Plane className={`w-5 h-5 ${hasNFT ? 'text-green-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">Flight Discounts</h4>
                        </div>
                        {hasNFT ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="text-sm space-y-2">
                        <p className="text-gray-600"><span className="font-bold">Listener (1+ NFT):</span> 5% off flights</p>
                        <p className="text-cyan-600 font-semibold">Collector (3+ NFTs): 10% off flights</p>
                        <p className="text-purple-600 font-semibold">Curator (5+ NFTs): 15% off flights</p>
                        <p className="text-orange-600 font-semibold">Legend (10+ NFTs): 25% off flights</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-5 h-5 ${nftCount >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">VIP Festival Access</h4>
                        </div>
                        {nftCount >= 3 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Backstage passes and VIP lounge access at partner festivals</p>
                      {nftCount < 3 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Collector tier (3+ NFTs)</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Globe className={`w-5 h-5 ${nftCount >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">Luxury Accommodations</h4>
                        </div>
                        {nftCount >= 5 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Discounted hotel bookings at 4-5 star properties near festival venues</p>
                      {nftCount < 5 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Curator tier (5+ NFTs)</p>}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${nftCount >= 10 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Trophy className={`w-5 h-5 ${nftCount >= 10 ? 'text-green-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">Meet & Greet</h4>
                        </div>
                        {nftCount >= 10 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Exclusive meet and greet opportunities with Soul Collection artists</p>
                      {nftCount < 10 && <p className="text-xs text-orange-600 font-semibold mt-2">Requires Legend tier (10+ NFTs)</p>}
                    </div>
                  </div>

                  {/* Featured Destinations */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-cyan" />
                      Featured Destinations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {DESTINATIONS.map((dest) => (
                        <div
                          key={dest.id}
                          onClick={() => setSelectedDest(dest)}
                          className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            selectedDest.id === dest.id
                              ? 'border-brand-cyan shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="h-32 bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${dest.image})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 text-white">
                              <p className="font-bold text-lg">{dest.city}</p>
                              <p className="text-xs">{dest.country}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">From ${dest.basePrice}</span>
                              <span className="text-xs font-bold text-brand-cyan">{dest.code}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Your Discount */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-3">Your Skybeats Discount</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                        <p className={`text-2xl font-black ${currentTier.color}`}>{currentTier.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Flight Discount</p>
                        <p className="text-2xl font-black text-brand-cyan">
                          {nftCount >= 10 ? '25%' : nftCount >= 5 ? '15%' : nftCount >= 3 ? '10%' : nftCount >= 1 ? '5%' : '0%'}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-sm text-gray-600 mb-1">{selectedDest.city} Flight</p>
                        <div>
                          <p className="text-lg line-through text-gray-400">${selectedDest.basePrice}</p>
                          <p className="text-2xl font-black text-green-600">
                            ${Math.round(selectedDest.basePrice * (1 - (nftCount >= 10 ? 0.25 : nftCount >= 5 ? 0.15 : nftCount >= 3 ? 0.10 : nftCount >= 1 ? 0.05 : 0)))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900">
                      <span className="font-bold">Coming Soon:</span> Skybeats booking platform will launch in Q2 2025. All discounts will be automatically applied based on your wallet's NFT holdings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={footerRef} />
    </div>
  );
}
