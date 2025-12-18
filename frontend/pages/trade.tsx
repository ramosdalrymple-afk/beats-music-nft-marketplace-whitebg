// pages/trade.tsx
import { useState } from 'react';
import Head from 'next/head';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Disc,
  ListMusic
} from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

// --- MOCK DATA ---
const ORDER_BOOK = {
  asks: [
    { price: 15.5, amount: 2, total: 31, user: '0x32...a9' },
    { price: 15.2, amount: 1, total: 15.2, user: '0x88...b1' },
    { price: 14.9, amount: 5, total: 74.5, user: '0x12...c4' },
    { price: 14.8, amount: 10, total: 148, user: '0x99...f2' },
  ],
  bids: [
    { price: 14.5, amount: 4, total: 58, user: '0x77...d1' },
    { price: 14.2, amount: 8, total: 113.6, user: '0x45...e3' },
    { price: 13.9, amount: 2, total: 27.8, user: '0x22...a8' },
    { price: 13.5, amount: 20, total: 270, user: '0x11...11' },
  ]
};

const RECENT_TRADES = [
  { price: 14.8, amount: 1, time: '10:42:05', type: 'buy' },
  { price: 14.8, amount: 2, time: '10:41:12', type: 'buy' },
  { price: 14.5, amount: 5, time: '10:38:55', type: 'sell' },
  { price: 14.9, amount: 1, time: '10:35:20', type: 'buy' },
  { price: 14.2, amount: 10, time: '10:30:00', type: 'sell' },
];

export default function Trade() {
  const account = useCurrentAccount();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [inputPrice, setInputPrice] = useState('14.8');
  const [inputAmount, setInputAmount] = useState('1');

  // Calculate Order Book Depth visuals
  const maxAskTotal = Math.max(...ORDER_BOOK.asks.map(o => o.total));
  const maxBidTotal = Math.max(...ORDER_BOOK.bids.map(o => o.total));

  return (
    <>
      <Head>
        <title>Trade Terminal - Beats</title>
      </Head>

      <div className="min-h-screen text-slate-200 bg-[#0B0E14] font-sans pb-20">
        
        {/* --- TOP BAR: ASSET INFO --- */}
        <div className="border-b border-white/5 bg-[#11141D] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Album Art / Play Button */}
            <div className="relative group w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
              <div className={`absolute inset-0 bg-brand-purple/20 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
              </div>
              <img src="/cyber-album.jpg" alt="Album" className="w-full h-full object-cover" />
              {/* Fallback color if no img */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900 -z-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Neon Nights</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ERC-1155</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>By <span className="text-brand-cyan hover:underline cursor-pointer">CyberPunk Orchestra</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>Royalty: 5%</span>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-4 gap-6 w-full md:w-auto">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Floor Price</p>
              <div className="flex items-center gap-1 text-green-400 font-mono font-medium">
                <ArrowUpRight className="w-3 h-3" />
                14.8 SUI
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">24h Vol</p>
              <p className="text-white font-mono font-medium">4,291 SUI</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Listed</p>
              <p className="text-white font-mono font-medium">12%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Owners</p>
              <p className="text-white font-mono font-medium">842</p>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 p-1 h-[calc(100vh-100px)]">
          
          {/* LEFT: CHART & HISTORY (Width: 60%) */}
          <div className="lg:col-span-8 flex flex-col gap-1 h-full">
            
            {/* Chart Container */}
            <div className="flex-1 bg-[#11141D] border border-white/5 rounded-lg p-4 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex gap-2">
                    {['15m', '1H', '4H', '1D', '1W'].map(t => (
                      <button key={t} className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded transition">
                        {t}
                      </button>
                    ))}
                 </div>
                 <div className="flex items-center gap-2 text-slate-500 text-xs">
                   <Activity className="w-4 h-4" />
                   TradingView Integration
                 </div>
              </div>
              
              {/* Mock Chart Visual */}
              <div className="flex-1 w-full h-full flex items-center justify-center relative">
                 {/* This would be your Recharts or TradingView Widget */}
                 <div className="absolute inset-0 flex items-end px-8 pb-8 gap-2 opacity-50">
                    {[40,60,45,70,80,60,50,75,90,100,85,60,70,95,110,100,90,120,130,110].map((h, i) => (
                      <div key={i} style={{height: `${h}%`}} className="flex-1 bg-brand-purple/20 border-t-2 border-brand-purple hover:bg-brand-purple/40 transition-all cursor-crosshair"></div>
                    ))}
                 </div>
                 <div className="text-slate-600 font-mono text-sm z-10 pointer-events-none">
                    Market Depth / Price Action Chart
                 </div>
              </div>
            </div>

            {/* Bottom Panel: Recent Trades & Analytics */}
            <div className="h-1/3 bg-[#11141D] border border-white/5 rounded-lg p-0 flex flex-col">
               <div className="px-4 py-2 border-b border-white/5 flex gap-6">
                 <button className="text-sm font-medium text-white border-b-2 border-brand-purple pb-2 -mb-2.5">Recent Trades</button>
                 <button className="text-sm font-medium text-slate-500 hover:text-white pb-2 transition">Analytics</button>
                 <button className="text-sm font-medium text-slate-500 hover:text-white pb-2 transition">Info</button>
               </div>
               
               <div className="overflow-auto custom-scrollbar p-2">
                 <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs uppercase text-slate-600 sticky top-0 bg-[#11141D]">
                      <tr>
                        <th className="px-4 py-2 font-normal">Price (SUI)</th>
                        <th className="px-4 py-2 font-normal">Amount</th>
                        <th className="px-4 py-2 font-normal">Time</th>
                        <th className="px-4 py-2 font-normal text-right">Tx</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {RECENT_TRADES.map((trade, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                          <td className={`px-4 py-2 ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-slate-300">{trade.amount}</td>
                          <td className="px-4 py-2 text-slate-500">{trade.time}</td>
                          <td className="px-4 py-2 text-right text-brand-cyan hover:underline">
                            <ArrowUpRight className="w-3 h-3 inline ml-1" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: ORDER BOOK & ACTION (Width: 40%) */}
          <div className="lg:col-span-4 flex flex-col gap-1 h-full">
            
            {/* ORDER BOOK */}
            <div className="flex-1 bg-[#11141D] border border-white/5 rounded-lg flex flex-col overflow-hidden">
               <div className="px-4 py-3 border-b border-white/5 font-medium text-sm text-slate-300 flex justify-between">
                 <span>Order Book</span>
                 <span className="text-slate-600 text-xs">Spread: 0.3 SUI</span>
               </div>
               
               {/* Asks (Sells) - Red */}
               <div className="flex-1 overflow-y-auto flex flex-col-reverse justify-end p-2 space-y-1 space-y-reverse">
                 {ORDER_BOOK.asks.map((order, i) => (
                   <div key={i} className="flex justify-between items-center text-xs font-mono px-2 py-1 hover:bg-white/5 cursor-pointer group relative">
                     {/* Depth Bar */}
                     <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0 transition-all" style={{ width: `${(order.total / maxAskTotal) * 100}%` }} />
                     
                     <span className="text-red-400 z-10">{order.price.toFixed(2)}</span>
                     <span className="text-slate-400 z-10">{order.amount}</span>
                     <span className="text-slate-500 z-10">{order.total.toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               {/* Current Price Indicator */}
               <div className="py-2 border-y border-white/5 bg-white/5 text-center">
                 <div className="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
                   14.80 SUI 
                   <ArrowUpRight className="w-4 h-4" />
                 </div>
                 <div className="text-xs text-slate-500">≈ $22.50 USD</div>
               </div>

               {/* Bids (Buys) - Green */}
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {ORDER_BOOK.bids.map((order, i) => (
                   <div key={i} className="flex justify-between items-center text-xs font-mono px-2 py-1 hover:bg-white/5 cursor-pointer relative">
                      {/* Depth Bar */}
                     <div className="absolute right-0 top-0 bottom-0 bg-green-500/10 z-0 transition-all" style={{ width: `${(order.total / maxBidTotal) * 100}%` }} />
                     
                     <span className="text-green-400 z-10">{order.price.toFixed(2)}</span>
                     <span className="text-slate-400 z-10">{order.amount}</span>
                     <span className="text-slate-500 z-10">{order.total.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* ACTION PANEL (BUY/SELL) */}
            <div className="bg-[#11141D] border border-white/5 rounded-lg p-5">
              
              {/* Toggle */}
              <div className="flex bg-[#0B0E14] p-1 rounded-lg mb-6">
                <button 
                  onClick={() => setTradeMode('buy')}
                  className={`flex-1 py-2 rounded text-sm font-bold transition-all ${tradeMode === 'buy' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setTradeMode('sell')}
                  className={`flex-1 py-2 rounded text-sm font-bold transition-all ${tradeMode === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Sell
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Price</span>
                    <span>Best: 14.8 SUI</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-white font-mono focus:border-brand-purple focus:outline-none transition-colors"
                    />
                    <div className="absolute right-4 top-3 text-xs text-slate-500 font-bold">SUI</div>
                  </div>
                </div>

                <div>
                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Amount</span>
                    <span>Max: 5</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-white font-mono focus:border-brand-purple focus:outline-none transition-colors"
                    />
                    <div className="absolute right-4 top-3 text-xs text-slate-500 font-bold">NFTs</div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-800 mt-2">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {(parseFloat(inputPrice || '0') * parseFloat(inputAmount || '0')).toFixed(2)} SUI
                  </span>
                </div>

                {/* Submit Button */}
                {!account ? (
                  <button className="w-full py-3.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/50 rounded-lg font-bold hover:bg-brand-purple/30 transition-all uppercase tracking-wide text-sm">
                    Connect Wallet
                  </button>
                ) : (
                  <button 
                    className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 uppercase tracking-wide text-sm ${
                      tradeMode === 'buy' 
                        ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' 
                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                    }`}
                  >
                    {tradeMode === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}