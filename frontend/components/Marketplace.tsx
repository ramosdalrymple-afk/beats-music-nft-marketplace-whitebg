'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Plus, Search, Zap } from 'lucide-react';
import BeatCard from './BeatCard';
import CreateListingModal from './CreateListingModal';

interface Beat {
  id: string;
  itemId: string;
  title: string;
  artist: string;
  genre: string;
  price: number;
  owner: string;
  audioUrl?: string;
  likes: number;
}

export default function Marketplace() {
  const account = useCurrentAccount();
  const [beats, setBeats] = useState<Beat[]>([
    {
      id: '1',
      itemId: '0x123abc',
      title: 'Neon Dreams',
      artist: 'Luna Beats',
      genre: 'Electronic',
      price: 100,
      owner: '0x456def',
      likes: 234,
    },
    {
      id: '2',
      itemId: '0x789ghi',
      title: 'Midnight Vibes',
      artist: 'Cyber Sonic',
      genre: 'Hip-Hop',
      price: 250,
      owner: '0x012jkl',
      likes: 512,
    },
    {
      id: '3',
      itemId: '0x345mno',
      title: 'Synthwave Sunset',
      artist: 'Retro Pulse',
      genre: 'Synthwave',
      price: 150,
      owner: '0x678pqr',
      likes: 189,
    },
    {
      id: '4',
      itemId: '0x901stu',
      title: 'Bass Drop Energy',
      artist: 'Thunder Beats',
      genre: 'EDM',
      price: 200,
      owner: '0x234vwx',
      likes: 421,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const genres = ['Electronic', 'Hip-Hop', 'Synthwave', 'EDM', 'Ambient', 'Trap'];

  const filteredBeats = beats.filter((beat) => {
    const matchesSearch =
      beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || beat.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleCreateListing = (data: {
    name: string;
    description: string;
    price: number;
  }) => {
    const newBeat: Beat = {
      id: (beats.length + 1).toString(),
      itemId: `0x${Math.random().toString(16).slice(2)}`,
      title: data.name,
      artist: 'You',
      genre: 'Electronic',
      price: data.price,
      owner: account?.address || '',
      likes: 0,
    };
    setBeats([...beats, newBeat]);
    setShowCreateModal(false);
  };

  const handleBuyBeat = (beatId: string) => {
    console.log('Buying beat:', beatId);
  };

  const handleLikeBeat = (beatId: string) => {
    setBeats(
      beats.map((beat) =>
        beat.id === beatId ? { ...beat, likes: beat.likes + 1 } : beat
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative py-12 px-6 glass-dark rounded-xl border border-brand-purple/30 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-brand-orange animate-pulse" />
            <h1 className="text-4xl font-black neon-text-glow">Beats Marketplace</h1>
          </div>
          <p className="text-slate-300 max-w-2xl leading-relaxed">
            Discover and collect exclusive music NFTs from artists around the world. Trade
            unique beats on the Sui blockchain.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {account && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-purple-orange hover:shadow-lg hover:shadow-brand-purple/50 px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 glow-purple text-white"
            >
              <Plus className="w-5 h-5" />
              Publish Beat
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-brand-cyan/50" />
          <input
            type="text"
            placeholder="Search beats, artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-dark rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-brand-cyan transition border border-brand-purple/30 focus:border-brand-cyan/50"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
              !selectedGenre
                ? 'bg-gradient-brand text-white shadow-brand'
                : 'glass-dark hover:border-brand-purple/50'
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                selectedGenre === genre
                  ? 'bg-gradient-purple-orange text-white shadow-brand'
                  : 'glass-dark hover:border-brand-purple/50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredBeats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBeats.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              onBuy={handleBuyBeat}
              onLike={handleLikeBeat}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 glass-dark rounded-lg border border-brand-purple/20">
          <Zap className="w-16 h-16 text-brand-purple/40 mb-4" />
          <p className="text-slate-400 text-lg">No beats found</p>
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onCreateListing={handleCreateListing}
        />
      )}
    </div>
  );
}
