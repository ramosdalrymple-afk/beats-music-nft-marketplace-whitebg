// components/NFTCard.tsx
import React from 'react';
import { NFT } from '../pages/trade';

interface NFTCardProps {
  nft: NFT;
  isSelected: boolean;
  onSelect: () => void;
  selectionColor: 'purple' | 'cyan' | 'green';
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, isSelected, onSelect, selectionColor }) => {
  const borderColorClass = {
    purple: 'border-brand-purple shadow-brand-purple/50',
    cyan: 'border-brand-cyan shadow-brand-cyan/50',
    green: 'border-green-400 shadow-green-400/50',
  }[selectionColor];

  const ringColorClass = {
    purple: 'ring-brand-purple/50',
    cyan: 'ring-brand-cyan/50',
    green: 'ring-green-400/50',
  }[selectionColor];

  return (
    <div
      onClick={onSelect}
      className={`
        relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
        bg-white border hover:border-gray-300
        ${isSelected
          ? `border-2 ${borderColorClass} shadow-lg ring-2 ${ringColorClass}`
          : 'border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      {/* NFT Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
        <img
          src={nft.imageUrl}
          alt={nft.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-nft.png';
          }}
        />
      </div>

      {/* NFT Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
          {nft.name}
        </h4>
        <p className="text-xs text-gray-600 truncate mb-1">
          {nft.description}
        </p>
        <p className="text-xs text-gray-400 font-mono truncate">
          {nft.id.slice(0, 8)}...{nft.id.slice(-6)}
        </p>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className={`
          absolute top-2 right-2 w-5 h-5 rounded-full 
          flex items-center justify-center
          ${selectionColor === 'purple' ? 'bg-brand-purple' : ''}
          ${selectionColor === 'cyan' ? 'bg-brand-cyan' : ''}
          ${selectionColor === 'green' ? 'bg-green-400' : ''}
        `}>
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default NFTCard;