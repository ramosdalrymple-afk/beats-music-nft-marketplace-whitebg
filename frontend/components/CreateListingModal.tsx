import { useState } from 'react';
import { X, Music } from 'lucide-react';

interface CreateListingModalProps {
  onClose: () => void;
  onCreateListing: (data: { name: string; description: string; price: number }) => void;
}

export default function CreateListingModal({
  onClose,
  onCreateListing,
}: CreateListingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.description && formData.price) {
      onCreateListing({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-dark rounded-lg max-w-md w-full mx-4 border border-brand-purple/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-purple/20 p-6">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-brand-purple" />
            <h2 className="text-lg font-bold">Publish Your Beat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-brand-orange/20 rounded transition"
          >
            <X className="w-5 h-5 text-brand-orange" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-cyan mb-2">
              Beat Title
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full glass-dark rounded-lg px-3 py-2 text-white focus:border-brand-purple transition border border-brand-purple/30"
              placeholder="e.g., Neon Dreams"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-cyan mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full glass-dark rounded-lg px-3 py-2 text-white focus:border-brand-purple transition resize-none h-24 border border-brand-purple/30"
              placeholder="Tell us about your beat..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-cyan mb-2">
              Price (SUI)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full glass-dark rounded-lg px-3 py-2 text-white focus:border-brand-purple transition border border-brand-purple/30"
              placeholder="100"
              step="0.01"
              min="0"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-brand-purple/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 glass-dark rounded-lg text-slate-300 hover:text-brand-cyan transition border border-brand-purple/20 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-purple-orange rounded-lg text-white transition font-bold hover:shadow-lg hover:shadow-brand-purple/50 glow-purple"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
