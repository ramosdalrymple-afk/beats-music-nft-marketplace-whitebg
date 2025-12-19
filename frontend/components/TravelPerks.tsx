import React, { useState } from 'react';
import { 
  Plane, MapPin, QrCode, ArrowRight, Search, 
  Calendar, Users, CheckCircle, Lock, Disc, Globe, X
} from 'lucide-react';

// --- MOCK DATA ---
const USER_WALLET = {
  holdings: [
    { id: 1, genre: 'House', title: 'Ibiza Sunsets', artist: 'DJ Solar', tier: 'Gold' },
    { id: 2, genre: 'K-Pop', title: 'Seoul City Lights', artist: 'K-Star', tier: 'Platinum' },
  ],
  travelScore: 850,
  memberSince: '2023',
};

const DESTINATIONS = [
  { 
    id: 'ibiza', 
    city: 'Ibiza', 
    country: 'Spain', 
    code: 'IBZ', 
    image: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?q=80&w=1974&auto=format&fit=crop',
    reqGenre: 'House',
    discount: '20%',
    status: 'unlocked' 
  },
  { 
    id: 'miami', 
    city: 'Miami', 
    country: 'USA', 
    code: 'MIA', 
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2070&auto=format&fit=crop',
    reqGenre: 'Hip Hop',
    discount: '15%',
    status: 'locked' 
  },
  { 
    id: 'seoul', 
    city: 'Seoul', 
    country: 'South Korea', 
    code: 'ICN', 
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1974&auto=format&fit=crop',
    reqGenre: 'K-Pop',
    discount: '25%',
    status: 'unlocked' 
  },
];

export default function TravelPerks() {
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [viewState, setViewState] = useState<'dashboard' | 'booking'>('dashboard');

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-4 sm:p-6 lg:p-8 font-sans selection:bg-brand-cyan/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-purple/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: THE PASSPORT --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-8">
             {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black mb-1">SKY<span className="text-brand-cyan">BEATS</span></h1>
              <p className="text-sm text-slate-400 font-medium">Decentralized Travel Protocol</p>
            </div>

            {/* THE DIGITAL PASSPORT CARD */}
            <div className="relative group perspective-1000">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                
                {/* Holographic Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Top Bar */}
                <div className="bg-brand-purple/20 p-4 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-bold tracking-widest uppercase text-white">Global Pass</span>
                  </div>
                  <span className="px-2 py-0.5 bg-black/40 rounded text-[10px] font-mono text-slate-300">
                    ID: 8X-9921
                  </span>
                </div>

                {/* Passport Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 p-0.5">
                      <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                        {/* User Avatar Placeholder */}
                        <div className="text-2xl font-black text-white/20">IMG</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Travel Score</div>
                      <div className="text-3xl font-black text-white">{USER_WALLET.travelScore}</div>
                      <div className="text-xs text-brand-cyan font-bold">Platinum Tier</div>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-500">Member Since</span>
                      <span className="text-white">{USER_WALLET.memberSince}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-500">Valid Until</span>
                      <span className="text-white">12/2026</span>
                    </div>
                  </div>

                  {/* QR Footer */}
                  <div className="mt-6 pt-6 border-t border-dashed border-slate-700 flex items-center justify-between">
                    <QrCode className="w-12 h-12 text-white" />
                    <div className="text-right">
                       <p className="text-[10px] text-slate-500 max-w-[150px] leading-tight">
                         Scan at partner kiosks (SkyBeats Air, FestGo) to redeem privileges.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Integration Status */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Wallet Connected</h4>
                <p className="text-xs text-slate-400">2 Qualifying Assets Found</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DESTINATION SELECTOR --- */}
        <div className="lg:col-span-8">
          
          {/* Tabs / Filter */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            {['All Routes', 'Festivals', 'Concerts', 'Studios'].map((tab, i) => (
              <button 
                key={tab} 
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                  i === 0 ? 'bg-white text-black' : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Destination Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {DESTINATIONS.map((dest) => (
              <div 
                key={dest.id}
                onClick={() => setSelectedDest(dest)}
                className={`relative h-48 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                  selectedDest.id === dest.id ? 'border-brand-cyan scale-[1.02] shadow-xl shadow-cyan-900/20' : 'border-transparent hover:border-slate-600 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <span className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {dest.code}
                      </span>
                      {dest.status === 'locked' && (
                        <div className="p-2 bg-black/60 rounded-full backdrop-blur text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                   </div>
                   
                   <div>
                     <h3 className="text-2xl font-black leading-none mb-1">{dest.city}</h3>
                     <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          dest.status === 'unlocked' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                          {dest.status === 'unlocked' ? `-${dest.discount} Unlocked` : 'Locked'}
                        </span>
                        {dest.status === 'locked' && (
                          <span className="text-xs font-medium text-slate-300 drop-shadow-md">
                            Needs {dest.reqGenre} NFT
                          </span>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- INTERACTIVE BOOKING WIDGET --- */}
          {selectedDest.status === 'unlocked' ? (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Plane className="w-5 h-5 text-brand-cyan" /> 
                    Book Flight to {selectedDest.city}
                  </h2>
                  <p className="text-sm text-slate-400">Discount applied via SkyBeats Protocol</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-500 line-through font-bold">Est. $1,200</span>
                  <span className="block text-2xl font-black text-brand-cyan">$900</span>
                </div>
              </div>

              {/* Realistic Search Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">From</label>
                  <div className="flex items-center bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold">
                    <MapPin className="w-4 h-4 text-slate-500 mr-2" />
                    <input type="text" defaultValue="New York (JFK)" className="bg-transparent outline-none w-full placeholder-slate-600" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">To</label>
                  <div className="flex items-center bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl px-4 py-3 text-sm font-bold text-white">
                    <MapPin className="w-4 h-4 text-brand-cyan mr-2" />
                    <span>{selectedDest.city} ({selectedDest.code})</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Dates</label>
                  <div className="flex items-center bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold">
                    <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                    <span>Select Dates</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-brand-cyan transition flex items-center justify-center gap-2 shadow-lg shadow-white/5">
                Generate Partner Code & Search Flights <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" /> Secure connection to SkyBeats Airline Portal
              </div>
            </div>
          ) : (
            // LOCKED STATE
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Route Locked</h3>
              <p className="text-slate-400 max-w-md mb-6">
                To unlock the 15% discount to {selectedDest.city}, you need to hold at least one <span className="text-white font-bold">{selectedDest.reqGenre}</span> music NFT in your wallet.
              </p>
              <button className="px-6 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/80 transition">
                Browse {selectedDest.reqGenre} NFTs
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}