// src/components/SampleItem.tsx
import React from 'react';
import { useSnapshot } from 'valtio';
import { FaDownload, FaHeart, FaShoppingCart, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { audioPlayerStore, audioPlayerActions } from '../../state/audioPlayer.store';
import { cartState } from '../../state/CartItemState';
import type { AudioSample} from '../../types';
import { addSampleToCart } from '../../services/cartService';
import { useAuth } from '../../hooks/useAuth'; // Add auth hook
import './SampleItem.css';

// Import your custom icons
import playIcon from '../../assets/play-button.png';
import pauseIcon from '../../assets/pause-button.png';

interface SampleItemProps {
  sample: AudioSample;
  onDownload: () => void;
  onLike: () => void;
  onEdit?: () => void; // New prop for edit
  onDelete?: () => void; // New prop for delete
}

const SampleItem: React.FC<SampleItemProps> = ({ 
  sample, 
  onDownload, 
  onLike, 
  onEdit, 
  onDelete 
}) => {
  const audioSnap = useSnapshot(audioPlayerStore);
  const cartSnap = useSnapshot(cartState);
  const { user } = useAuth(); // Get current user
  
  // Check if this sample is currently playing
  const isPlaying = audioSnap.isPlaying && audioSnap.currentSample?.id === sample.id;
  const isLoading = audioSnap.isLoading && audioSnap.currentSample?.id === sample.id;
  const inCart = cartSnap.items.some(item => item.id === sample.id && item.type === 'sample');
  console.log("tags for", sample.name, sample.tags);
  console.log("full sample: " , sample)
  // Check if current user is the creator of this sample
  const isCreator = user?.id === sample.authorId;

  const handleTogglePlay = async () => {
    // If already playing this sample, pause it
    if (isPlaying) {
      audioPlayerActions.pause();
      return;
    }

    // If playing a different sample, stop it and play this one
    if (audioSnap.currentSample && audioSnap.currentSample.id !== sample.id) {
      audioPlayerActions.stop();
      // Small delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    try {
      console.log('Playing sample:', sample.name);
      await audioPlayerActions.playSampleFast(sample);
    } catch (error) {
      console.error('Playback failed:', error);
      // Fallback to normal play if fast play fails
      try {
        await audioPlayerActions.playSample(sample);
      } catch (fallbackError) {
        console.error('Fallback playback also failed:', fallbackError);
      }
    }
  };

  const handleAddToCart = () => {
    if (!inCart && !isCreator) { // Don't allow creators to buy their own samples
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

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`sample-item ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}>
      <div className="sample-main">
        {/* Play Button with IMAGE icons */}
        <button
          className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleTogglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : isLoading ? 'Loading...' : 'Play'}
        >
          {isLoading ? (
            <div className="loading-spinner-small"></div>
          ) : isPlaying ? (
            <img 
              src={pauseIcon} 
              alt="Pause" 
              className="play-icon"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextSibling?.remove(); // Remove any fallback text
                const fallback = document.createElement('span');
                fallback.textContent = '❚❚';
                fallback.style.color = 'white';
                fallback.style.fontSize = '20px';
                fallback.style.fontWeight = 'bold';
                target.parentNode?.appendChild(fallback);
              }}
            />
          ) : (
            <img 
              src={playIcon} 
              alt="Play" 
              className="play-icon"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextSibling?.remove(); // Remove any fallback text
                const fallback = document.createElement('span');
                fallback.textContent = '▶';
                fallback.style.color = 'white';
                fallback.style.fontSize = '20px';
                fallback.style.fontWeight = 'bold';
                target.parentNode?.appendChild(fallback);
              }}
            />
          )}
        </button>

        {/* Sample Info */}
        <div className="sample-info">
          <h3 className="sample-name">{sample.name}</h3>
            {isCreator && (
                <p className="sample-name">${sample.price.toFixed(2)}</p>
            )}
            {sample.packTitle ? <p>Pack: {sample.packTitle}</p> : null}
          <div className="sample-meta">
            {sample.duration && (
              <span className="meta-item">
                <span className="meta-text">{formatTime(sample.duration)}</span>
              </span>
            )}
            {sample.bpm && (
              <span className="meta-item">
                <span className="meta-text">{sample.bpm} BPM</span>
              </span>
            )}
            {sample.key && (
              <span className="meta-item">
                <span className="meta-text">Key: {sample.key}</span>
              </span>
            )}
            {sample.genre && (
              <span className="sample-genre">{sample.genre}</span>
            )}
{sample.tags && sample.tags.length > 0 && (
  <div className="sample-tags">
    {sample.tags.map((tag, i) => (
      <span key={i} className="sample-tag">
        #{tag}
      </span>
    ))}
  </div>
)}

            {/* Show creator badge if user is viewing their own sample */}
            {isCreator && (
              <span className="creator-badge">Your Sample</span>
            )}
          </div>
        </div>

        {/* Price - Hide for creator */}
        {!isCreator && sample.price !== undefined && sample.price > 0 && (
          <div className="sample-price">
            ${sample.price.toFixed(2)}
          </div>
        )}

      </div>

      {/* Actions with React Icons */}
      <div className="sample-actions">
        {isCreator ? (
          // Creator actions - Edit and Delete
          <>
            <button
              className="action-icon-btn edit-btn"
              onClick={onEdit}
              aria-label="Edit sample"
              title="Edit sample"
            >
              <FaEdit className="action-icon" />
            </button>

            <button
              className="action-icon-btn delete-btn"
              onClick={onDelete}
              aria-label="Delete sample"
              title="Delete sample"
            >
              <FaTrash className="action-icon" />
            </button>

            <button
              className="action-icon-btn"
              onClick={onDownload}
              aria-label="Download sample"
              title="Download sample"
            >
              <FaDownload className="action-icon" />
            </button>
          </>
        ) : (
          // Regular user actions - Cart, Download, Like
          <>
            <button
              className={`action-icon-btn ${inCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={inCart}
              aria-label={inCart ? 'Already in cart' : 'Add to cart'}
              title={inCart ? 'Already in cart' : 'Add to cart'}
            >
              {inCart ? (
                <FaCheck className="action-icon" />
              ) : (
                <FaShoppingCart className="action-icon" />
              )}
            </button>

            <button
              className="action-icon-btn"
              onClick={onDownload}
              aria-label="Download sample"
              title="Download sample"
            >
              <FaDownload className="action-icon" />
            </button>

            <button
              className="action-icon-btn"
              onClick={onLike}
              aria-label="Like sample"
              title="Like sample"
            >
              <FaHeart className="action-icon" />
            </button>
          </>
        )}
      </div>

      {/* Progress bar for currently playing sample */}
      {isPlaying && audioSnap.duration > 0 && (
        <div className="playback-progress">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${(audioSnap.currentTime / audioSnap.duration) * 100}%` 
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default SampleItem;