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
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-lg transition group">
      {/* Image Placeholder */}
      <div className="bg-gradient-to-br from-emerald-100 to-blue-100 h-40 flex items-center justify-center border-b border-gray-200">
        <Music className="w-12 h-12 text-gray-400 group-hover:text-gray-500 transition" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 truncate">{listing.name}</h3>
          <p className="text-sm text-gray-600 truncate">{listing.description}</p>
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Price</span>
            <span className="font-semibold text-emerald-600">{listing.ask} SUI</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Seller</span>
            <span className="text-gray-800">{shortenAddress(listing.owner)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onBuy(listing.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition text-sm font-medium shadow-sm"
          >
            Buy Now
          </button>
          <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition border border-gray-200">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
