import React, { useState } from 'react';
import { 
  Plane, MapPin, QrCode, ArrowRight, 
  Calendar, CheckCircle, Lock, Globe, 
  TrendingUp, AlertCircle, Disc 
} from 'lucide-react';

// --- 1. LOGIC DATA (The "Brain") ---
// This is the source of truth for the user's wallet
const USER_WALLET_HOLDINGS = [
  { id: 1, title: "Midnight Seoul", artist: "K-Rave", genre: "K-Pop", tier: "Legendary", points: 10, image: "bg-purple-500" },
  { id: 2, title: "Ibiza Sunsets", artist: "DJ Solar", genre: "House", tier: "Common", points: 2, image: "bg-cyan-500" },
  { id: 3, title: "Deep Space", artist: "Astro", genre: "Techno", tier: "Common", points: 2, image: "bg-blue-600" },
];

// The Rules for Status
const TIERS = [
  { name: 'Traveler', minPoints: 5, discount: 5, color: 'text-gray-600' },
  { name: 'Tour Manager', minPoints: 10, discount: 10, color: 'text-brand-cyan' },
  { name: 'Headliner', minPoints: 20, discount: 20, color: 'text-brand-purple' },
];

// --- 2. CONTENT DATA (The "World") ---
const DESTINATIONS = [
  { 
    id: 'ibiza', 
    city: 'Ibiza', 
    country: 'Spain', 
    code: 'IBZ', 
    image: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?q=80&w=1974&auto=format&fit=crop',
    reqGenre: 'House', // Requires a "House" NFT to unlock
    basePrice: 1200
  },
  { 
    id: 'miami', 
    city: 'Miami', 
    country: 'USA', 
    code: 'MIA', 
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2070&auto=format&fit=crop',
    reqGenre: 'Hip Hop', // Requires a "Hip Hop" NFT
    basePrice: 900
  },
  { 
    id: 'seoul', 
    city: 'Seoul', 
    country: 'South Korea', 
    code: 'ICN', 
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1974&auto=format&fit=crop',
    reqGenre: 'K-Pop', // Requires a "K-Pop" NFT
    basePrice: 1500
  },
];

export default function TravelPortal() {
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);

  // --- 3. DYNAMIC CALCULATIONS (The Integration) ---
  
  // A. Calculate Total Points from Wallet
  const totalPoints = USER_WALLET_HOLDINGS.reduce((acc, nft) => acc + nft.points, 0);

  // B. Determine Current Tier & Discount %
  // Finds the highest tier where user points >= minPoints
  const currentTier = [...TIERS].reverse().find(t => totalPoints >= t.minPoints) || null;
  const currentDiscount = currentTier ? currentTier.discount : 0;

  // C. Calculate Progress to Next Tier
  const nextTierIndex = TIERS.findIndex(t => t.minPoints > totalPoints);
  const nextTier = nextTierIndex !== -1 ? TIERS[nextTierIndex] : null;
  // If we have a next tier, calculate %, otherwise we are maxed out (100%)
  const prevTierPoints = currentTier ? currentTier.minPoints : 0;
  const progressPercent = nextTier 
    ? ((totalPoints - prevTierPoints) / (nextTier.minPoints - prevTierPoints)) * 100
    : 100;

  // D. Check Destination Eligibility (Genre Lock)
  const isDestinationUnlocked = (dest: typeof DESTINATIONS[0]) => {
    return USER_WALLET_HOLDINGS.some(nft => nft.genre === dest.reqGenre);
  };

  const isCurrentDestUnlocked = isDestinationUnlocked(selectedDest);
  const discountedPrice = selectedDest.basePrice - (selectedDest.basePrice * (currentDiscount / 100));

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-brand-cyan/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-100 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: THE LOGIC (Passport) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-8">
             {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black mb-1 text-gray-900">SKY<span className="text-brand-cyan">BEATS</span></h1>
              <p className="text-sm text-gray-600 font-medium">Decentralized Travel Protocol</p>
            </div>

            {/* DYNAMIC PASSPORT CARD */}
            <div className="relative group perspective-1000">
              <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">

                {/* Top Bar */}
                <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 border-b-2 border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-900">Global Pass</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-700 border border-gray-200">
                    ID: {totalPoints > 0 ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Passport Content - POWERED BY LOGIC */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                       <span className="font-black text-gray-400">IMG</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1">Status Level</div>
                      <div className={`text-2xl font-black ${currentTier ? currentTier.color : 'text-gray-500'}`}>
                        {currentTier ? currentTier.name : "Novice"}
                      </div>
                      <div className="text-xs text-gray-900 font-bold">
                        {currentDiscount}% Discount Rate
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Logic */}
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                      <span>{totalPoints} XP</span>
                      <span>{nextTier ? `Next: ${nextTier.name}` : 'Max'}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                       <div
                         className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-1000"
                         style={{ width: `${progressPercent}%` }}
                       />
                    </div>
                  </div>

                  {/* Wallet Holdings Preview */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Verified Assets</div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {USER_WALLET_HOLDINGS.map(nft => (
                        <div key={nft.id} className={`shrink-0 w-8 h-8 rounded ${nft.image} border-2 border-gray-200`} title={nft.title} />
                      ))}
                    </div>
                  </div>

                  {/* QR Footer */}
                  <div className="mt-6 pt-6 border-t border-dashed border-gray-300 flex items-center justify-between">
                    <QrCode className="w-10 h-10 text-gray-900" />
                    <div className="text-right">
                       <p className="text-[10px] text-gray-500 max-w-[150px] leading-tight">
                         Status updates automatically based on wallet holdings.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 shadow-md">
               {currentTier ? (
                 <CheckCircle className="w-5 h-5 text-green-500" />
               ) : (
                 <AlertCircle className="w-5 h-5 text-yellow-500" />
               )}
               <div>
                 <div className="text-sm font-bold text-gray-900">
                   {currentTier ? "Protocol Active" : "No Status"}
                 </div>
                 <div className="text-xs text-gray-600">
                   {currentTier
                     ? `Applying ${currentDiscount}% off eligible flights`
                     : "Collect more NFTs to unlock discounts"}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: THE EXPERIENCE (Destinations) --- */}
        <div className="lg:col-span-8">
          
         {/* Destination Grid */}
          <h3 className="text-lg font-bold mb-4 text-gray-900">Available Routes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {DESTINATIONS.map((dest) => {
              const unlocked = isDestinationUnlocked(dest);
              const isSelected = selectedDest.id === dest.id;

              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDest(dest)}
                  className={`relative h-48 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-brand-cyan scale-[1.02] shadow-xl'
                      : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Background Image & Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
                  <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
                  
                  {/* Overlay Content - Added text-white and shadow */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                         <span className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/10">
                           {dest.code}
                         </span>
                         {!unlocked && (
                           <div className="p-2 bg-black/60 rounded-full backdrop-blur text-white/80 border border-white/10">
                             <Lock className="w-4 h-4" />
                           </div>
                         )}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-black leading-none mb-1 drop-shadow-md">{dest.city}</h3>
                        <div className="flex items-center gap-2">
                           <span className={`text-xs font-bold px-1.5 py-0.5 rounded shadow-sm ${
                             unlocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                           }`}>
                             {unlocked ? 'Unlocked' : 'Locked'}
                           </span>
                           {!unlocked && (
                             <span className="text-xs font-medium text-white/90 drop-shadow-md">
                               Need {dest.reqGenre} NFT
                             </span>
                           )}
                        </div>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- INTERACTIVE BOOKING WIDGET --- */}
          {isCurrentDestUnlocked ? (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <Plane className="w-5 h-5 text-brand-cyan" />
                    Flight to {selectedDest.city}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tier Benefit: <span className="text-brand-cyan font-bold">{currentTier?.name} ({currentDiscount}% Off)</span> applied.
                  </p>
                </div>
                <div className="text-right p-3 bg-gray-50 rounded-xl border-2 border-gray-200 shadow-md">
                  <span className="block text-xs text-gray-500 line-through font-bold">Est. ${selectedDest.basePrice}</span>
                  <span className="block text-2xl font-black text-brand-cyan">${discountedPrice.toFixed(0)}</span>
                </div>
              </div>

              {/* Search Form Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">From</label>
                  <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <input type="text" defaultValue="New York (JFK)" className="bg-transparent outline-none w-full placeholder-gray-400 text-gray-700" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">To</label>
                  <div className="flex items-center bg-cyan-50 border-2 border-brand-cyan/30 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-brand-cyan mr-2" />
                    <span>{selectedDest.city} ({selectedDest.code})</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Dates</label>
                  <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>Select Dates</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-purple-orange text-white font-black text-lg rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 shadow-md">
                Generate Partner Code <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          ) : (
            // LOCKED STATE (Upsell)
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Restricted Airspace</h3>
              <p className="text-gray-600 max-w-md mb-6">
                You have the discount power, but you don't have the <span className="text-gray-900 font-bold">{selectedDest.reqGenre}</span> access pass.
                Buy a {selectedDest.reqGenre} NFT to unlock flights to {selectedDest.city}.
              </p>
              <button className="px-6 py-3 bg-gradient-purple-orange text-white font-bold rounded-xl hover:shadow-lg transition flex items-center gap-2">
                <Disc className="w-4 h-4" /> Browse Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}