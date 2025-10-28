// src/components/SampleItem.tsx
import React from 'react';
import { useSnapshot } from 'valtio';
import { audioPlayerStore, audioPlayerActions } from '../../state/audioPlayer.store';
import { cartState } from '../../state/CartItemState';
import type {  SamplesFromPackDTO } from '../../types';
import { addSampleToCart } from '../../services/CartService';
import './SampleItem.css';

interface SampleItemProps {
   sample: SamplesFromPackDTO;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onDownload: () => void;
  onLike: () => void;
}

const SampleItem: React.FC<SampleItemProps> = ({ sample }) => {
  const audioSnap = useSnapshot(audioPlayerStore);
  const cartSnap = useSnapshot(cartState); // ✅ Subscribe to cart changes
  
  // Check if this sample is currently playing
  const isPlaying = audioSnap.isPlaying && audioSnap.currentSample?.id === sample.id;
  
  // ✅ Check if sample is already in cart (now reactive to cart changes)
  const inCart = cartSnap.items.some(item => item.id === sample.id && item.type === 'sample');

  const handleTogglePlay = () => {
    audioPlayerActions.playSample(sample);
  };

  const handleDownload = () => {
    // TODO: Implement download logic
    console.log('Download sample:', sample.name);
  };

  const handleLike = () => {
    // TODO: Implement like logic
    console.log('Like sample:', sample.name);
  };

  const handleAddToCart = () => {
    if (!inCart) {
      addSampleToCart({
        id: sample.id,
        name: sample.name,
        url: sample.audioUrl,
        duration: sample.duration,
        artist: sample.artist,
        bpm: sample.bpm,
        key: sample.key,
        genre: sample.genre,
        price: sample.price ?? 0,
      });
    }
  };

  return (
    <div className="sample-item">
      <div className="sample-main">
        {/* Play Button */}
        <button
          className="play-button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Sample Info */}
        <div className="sample-info">
          <h3 className="sample-name">{sample.name}</h3>
          <div className="sample-meta">
            {sample.duration && (
              <span className="meta-item">
                <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {sample.duration}
              </span>
            )}
            {sample.bpm && (
              <span className="meta-item">{sample.bpm} BPM</span>
            )}
            {sample.key && (
              <span className="meta-item">Key: {sample.key}</span>
            )}
            {sample.genre && (
              <span className="sample-genre">{sample.genre}</span>
            )}
          </div>
        </div>

        {/* Price */}
        {sample.price !== undefined && (
          <div className="sample-price">
            ${sample.price.toFixed(2)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sample-actions">
        <button
          className={`action-icon-btn ${inCart ? 'in-cart' : ''}`}
          onClick={handleAddToCart}
          disabled={inCart}
          aria-label={inCart ? 'Already in cart' : 'Add to cart'}
          title={inCart ? 'Already in cart' : 'Add to cart'}
        >
          {inCart ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </button>

        <button
          className="action-icon-btn"
          onClick={handleDownload}
          aria-label="Download sample"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <button
          className="action-icon-btn"
          onClick={handleLike}
          aria-label="Like sample"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SampleItem;