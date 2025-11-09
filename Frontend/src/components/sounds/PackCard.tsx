// src/components/PackCard.tsx
import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { cartState } from '../../state/CartItemState';
import { SamplePack } from '../../types';
import './PackCard.css';

interface PackCardProps {
  pack: SamplePack;
  onViewDetails: (packId: string) => void;
  onAddToCart: (pack: SamplePack) => void;
}

const PackCard: React.FC<PackCardProps> = ({ pack, onViewDetails, onAddToCart }) => {
  const [isLiked, setIsLiked] = useState(false);
  const cartSnap = useSnapshot(cartState); // ✅ Subscribe to cart changes
  
  // ✅ Check if pack is already in cart (now reactive to cart changes)
  const inCart = cartSnap.items.some(item => item.id === pack.id && item.type === 'pack');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inCart) {
      onAddToCart(pack);
    }
  };

  return (
    <div className="pack-card">
      {/* Cover Image */}
      <div className="pack-card-image-wrapper" onClick={() => onViewDetails(pack.id)}>
        <img 
          src={pack.coverImage} 
          alt={pack.title}
          className="pack-card-image"
        />
        <div className="pack-card-overlay">
          <button className="view-details-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      </div>

      {/* Pack Info */}
      <div className="pack-card-content">
        {/* Title and Artist */}
        <div className="pack-card-header">
          <h3 className="pack-card-title" onClick={() => onViewDetails(pack.id)}>
            {pack.title}
          </h3>
          <button 
            className={`pack-card-like ${isLiked ? 'liked' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
            aria-label="Like pack"
          >
            <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <p className="pack-card-artist">{pack.artist}</p>

        {/* Stats */}
        <div className="pack-card-stats">
          <span className="pack-card-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {pack.sampleCount} samples
          </span>
          <span className="pack-card-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {pack.totalSize}
          </span>
        </div>

        {/* Genres */}
        <div className="pack-card-genres">
          {pack.genres.slice(0, 2).map((genre, index) => (
            <span key={index} className="pack-card-genre">
              {genre}
            </span>
          ))}
          {pack.genres.length > 2 && (
            <span className="pack-card-genre-more">
              +{pack.genres.length - 2}
            </span>
          )}
        </div>
        {/* Price and Action */}
         {! pack.isLoggedUserPack && 
        <div className="pack-card-footer">
          <span className="pack-card-price">${pack.price}</span>
          <button 
            className={`pack-card-cart-btn ${inCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={inCart}
          >
            {inCart ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                In Cart
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
         
        </div>
        }
      </div>
    </div>
  );
};

export default PackCard;