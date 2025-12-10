'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { TrendingUp, Wallet, Music, Eye, Heart } from 'lucide-react';

interface UserListing {
  id: string;
  itemId: string;
  ask: number;
  name: string;
  genre: string;
  plays: number;
  likes: number;
}

export default function Dashboard() {
  const account = useCurrentAccount();

  const userListings: UserListing[] = [
    {
      id: '1',
      itemId: '0xabc123',
      ask: 150,
      name: 'Cyber Nights',
      genre: 'Synthwave',
      plays: 1250,
      likes: 89,
    },
    {
      id: '2',
      itemId: '0xdef456',
      ask: 200,
      name: 'Digital Dreams',
      genre: 'Electronic',
      plays: 2100,
      likes: 156,
    },
  ];

  const earnings = 1500;
  const totalSales = userListings.length;
  const totalLikes = userListings.reduce((sum, l) => sum + l.likes, 0);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass-dark rounded-lg p-8 text-center border border-brand-purple/30">
          <Wallet className="w-16 h-16 text-brand-purple/50 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Connect your wallet to view your studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black neon-text-glow">My Studio</h1>
        <p className="text-slate-400 text-lg">Manage your beats and track your success</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-hover rounded-lg p-6 border border-brand-purple/30">
          <p className="text-slate-400 text-sm flex items-center gap-2 font-semibold">
            <Music className="w-4 h-4 text-brand-purple" />
            Published Beats
          </p>
          <p className="text-3xl font-black mt-3 text-brand-cyan">{totalSales}</p>
        </div>

        <div className="glass-hover rounded-lg p-6 border border-brand-cyan/30">
          <p className="text-slate-400 text-sm flex items-center gap-2 font-semibold">
            <TrendingUp className="w-4 h-4 text-brand-cyan" />
            Total Earnings
          </p>
          <p className="text-3xl font-black mt-3 text-brand-orange">{earnings} SUI</p>
        </div>

        <div className="glass-hover rounded-lg p-6 border border-brand-orange/30">
          <p className="text-slate-400 text-sm flex items-center gap-2 font-semibold">
            <Eye className="w-4 h-4 text-brand-orange" />
            Total Plays
          </p>
          <p className="text-3xl font-black mt-3 text-brand-cyan">
            {userListings.reduce((sum, l) => sum + l.plays, 0)}
          </p>
        </div>

        <div className="glass-hover rounded-lg p-6 border border-brand-purple/30">
          <p className="text-slate-400 text-sm flex items-center gap-2 font-semibold">
            <Heart className="w-4 h-4 text-brand-orange" />
            Total Likes
          </p>
          <p className="text-3xl font-black mt-3 text-brand-purple">{totalLikes}</p>
        </div>
      </div>

      {/* My Beats */}
      <div className="glass-dark rounded-lg overflow-hidden border border-brand-purple/30">
        <div className="border-b border-brand-purple/20 p-6 flex items-center gap-3 bg-dark-secondary/50">
          <Music className="w-5 h-5 text-brand-cyan" />
          <h2 className="text-xl font-bold">My Beats</h2>
        </div>

        {userListings.length > 0 ? (
          <div className="divide-y divide-brand-purple/20">
            {userListings.map((listing) => (
              <div
                key={listing.id}
                className="p-6 hover:bg-brand-purple/5 transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-bold text-white text-lg">{listing.name}</p>
                  <p className="text-sm text-slate-400">
                    {listing.genre} • {listing.plays.toLocaleString()} plays •{' '}
                    {listing.likes} likes
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-2xl font-black text-brand-orange">{listing.ask} SUI</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 glass-dark hover:border-brand-cyan/50 rounded text-xs transition text-brand-cyan font-bold border border-brand-cyan/30">
                      Edit
                    </button>
                    <button className="px-3 py-1 glass-dark hover:border-brand-orange/50 rounded text-xs transition text-brand-orange font-bold border border-brand-orange/30">
                      Delist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Music className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-semibold">No beats published yet</p>
          </div>
        )}
      </div>

      {/* Withdraw */}
      <button className="w-full bg-gradient-brand hover:shadow-lg hover:shadow-brand-purple/50 text-white py-4 rounded-lg transition font-black text-lg glow-brand">
        Withdraw Earnings ({earnings} SUI)
      </button>

      {/* Recent Activity */}
      <div className="glass-dark rounded-lg overflow-hidden border border-brand-cyan/30 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-cyan" />
          Activity Feed
        </h3>
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            💜 Your beat "Cyber Nights" was liked by 5 collectors
          </p>
          <p className="text-slate-400 text-sm">
            🎵 "Digital Dreams" reached 2,100 plays
          </p>
          <p className="text-slate-400 text-sm">
            💰 Earned 150 SUI from recent sales
          </p>
        </div>
      </div>
    </div>
  );
}
