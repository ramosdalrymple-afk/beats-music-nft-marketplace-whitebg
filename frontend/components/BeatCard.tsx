import { Music, Heart, Share2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface BeatCardProps {
  beat: {
    id: string;
    itemId: string;
    title: string;
    artist: string;
    genre: string;
    price: number;
    owner: string;
    audioUrl?: string;
    likes: number;
  };
  onBuy: (id: string) => void;
  onLike?: (id: string) => void;
}

export default function BeatCard({ beat, onBuy, onLike }: BeatCardProps) {
  const shortenAddress = (addr: string) => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <div className="glass-hover rounded-lg overflow-hidden h-full flex flex-col group border border-brand-purple/30">
      {/* Artwork */}
      <div className="relative h-40 bg-gradient-dark overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bar w-2 bg-gradient-cyan-orange rounded-full"
                  style={{ height: `${20 + Math.random() * 60}px` }}
                />
              ))}
            </div>
            <Music className="w-16 h-16 text-brand-purple/40 mx-auto" />
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-base to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header */}
        <div>
          <h3 className="font-bold text-white truncate group-hover:text-brand-cyan transition text-base">
            {beat.title}
          </h3>
          <p className="text-sm text-slate-400 truncate">{beat.artist}</p>
        </div>

        {/* Genre Badge */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-brand-purple/20 border border-brand-purple/50 rounded-full text-brand-purple font-medium">
            {beat.genre}
          </span>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm py-2 border-t border-b border-brand-purple/20">
          <div className="flex items-center gap-1 text-slate-400">
            <Heart className="w-4 h-4 text-brand-orange" />
            <span className="text-xs">{beat.likes}</span>
          </div>
          <span className="text-slate-500 text-xs">@{shortenAddress(beat.owner)}</span>
        </div>

        {/* Audio Player */}
        <div className="py-2">
          <AudioPlayer
            title={beat.title}
            artist={beat.artist}
            audioUrl={beat.audioUrl}
            compact
          />
        </div>

        {/* Price & Actions */}
        <div className="space-y-2 mt-auto pt-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-brand-cyan">{beat.price}</span>
            <span className="text-xs text-slate-500">SUI</span>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => onBuy(beat.id)}
            className="w-full bg-gradient-purple-orange hover:shadow-lg hover:shadow-brand-purple/50 text-white py-2 rounded-lg transition font-semibold glow-purple text-sm"
          >
            Buy Now
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onLike?.(beat.id)}
              className="flex items-center justify-center gap-1 border border-brand-orange/30 hover:border-brand-orange/60 text-brand-orange py-2 rounded-lg transition text-xs font-medium"
            >
              <Heart className="w-3 h-3" />
              Like
            </button>
            <button className="flex items-center justify-center gap-1 border border-brand-cyan/30 hover:border-brand-cyan/60 text-brand-cyan py-2 rounded-lg transition text-xs font-medium">
              <Share2 className="w-3 h-3" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
