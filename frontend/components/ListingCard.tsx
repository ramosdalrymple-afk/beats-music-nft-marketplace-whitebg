import { Music, Trash2 } from 'lucide-react';

interface ListingCardProps {
  listing: {
    id: string;
    itemId: string;
    ask: number;
    owner: string;
    name: string;
    description: string;
  };
  onBuy: (id: string) => void;
}

export default function ListingCard({ listing, onBuy }: ListingCardProps) {
  const shortenAddress = (addr: string) => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition group">
      {/* Image Placeholder */}
      <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 h-40 flex items-center justify-center">
        <Music className="w-12 h-12 text-slate-700 group-hover:text-slate-600 transition" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white truncate">{listing.name}</h3>
          <p className="text-sm text-slate-400 truncate">{listing.description}</p>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Price</span>
            <span className="font-semibold text-emerald-400">{listing.ask} SUI</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Seller</span>
            <span className="text-slate-300">{shortenAddress(listing.owner)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onBuy(listing.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition text-sm font-medium"
          >
            Buy Now
          </button>
          <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
