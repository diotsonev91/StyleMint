// src/components/sounds/PacksGrid.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { cartState } from '../../state/CartItemState';
import { SamplePack } from '../../types';
import PackCard from './PackCard';
import { addSamplePackToCart } from '../../services/cartService';
// Note: Uses CSS classes from SamplePacksPage.css

interface PacksGridProps {
  packs: SamplePack[];
  viewMode?: 'grid' | 'list';
  emptyStateMessage?: {
    title: string;
    description: string;
    showClearFilters?: boolean;
  };
  onClearFilters?: () => void;
  
}

const PacksGrid: React.FC<PacksGridProps> = ({
  packs,
  viewMode = 'grid',
  emptyStateMessage = {
    title: 'No packs found',
    description: 'Try adjusting your search or filters',
    showClearFilters: true
  },
  onClearFilters
}) => {
  const navigate = useNavigate();
  const cartSnap = useSnapshot(cartState);

 const handleViewDetails = (packId: string) => {
  const pack = packs.find(p => p.id === packId);
  navigate(`/pack/${packId}`, { 
    state: { 
      isLoggedUserPack: pack?.isLoggedUserPack 
    } 
  });
};

  const handleAddToCart = (pack: SamplePack) => {
    // Check if pack is already in cart
    const alreadyInCart = cartSnap.items.some(
      item => item.id === pack.id && item.type === 'pack'
    );

    if (alreadyInCart) {
      console.log(`⚠️ Pack "${pack.title}" is already in cart`);
      // Optional: Show toast notification
      return;
    }

    // ✅ Add pack + all samples
    console.log(`📦 Adding pack "${pack.title}" with ${pack.samples.length} samples...`);
    addSamplePackToCart(pack);
    
    // Optional: Show success notification
    console.log(`✅ Added "${pack.title}" to cart`);
  };

  if (packs.length === 0) {
    return (
      <div className="packs-no-results">
        <svg className="packs-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3>{emptyStateMessage.title}</h3>
        <p>{emptyStateMessage.description}</p>
        {emptyStateMessage.showClearFilters && onClearFilters && (
          <button className="btn btn-primary" onClick={onClearFilters}>
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`packs-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
      {packs.map((pack) => (
        <PackCard
          key={pack.id}
          pack={pack}
          onViewDetails={handleViewDetails}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
};

export default PacksGrid;
