// SampleCartRow.tsx
import { CartItemState } from "../../../state";
import { removeItem } from "../../../services/cartService";
import { audioPlayerActions, formatTime } from "../../../state/audioPlayer.store";

interface SampleCartRowProps {
  item: CartItemState & { type: 'sample' };
}

export function SampleCartRow({ item }: SampleCartRowProps) {
  const _removeItem = () => {
    removeItem(item.id);
  };

  const handlePlay = () => {
    if (item.url) {
      audioPlayerActions.playSample({
        id: item.id,
        name: item.name,
        audioUrl: item.url,
        artist: item.artist || "",
        duration: item.duration || 0,
        bpm: item.bpm,
        key: item.key,
        genre: item.genre,
        price: item.price,
        sampleType: "oneshot",
        authorId: "", // cheat here because dont need this here TODO FIX
      });
    }
  };

  return (
    <div className="cart-item-card sample-card">
      <button onClick={_removeItem} className="remove-button" title="Remove item">
        ✕
      </button>

      {/* Cover Image */}
      <div className="sample-preview">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.name} className="sample-cover-image" />
        ) : (
          <div className="sample-cover-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        )}

        {/* Play Button */}
        {item.url && (
          <button className="sample-play-btn" onClick={handlePlay}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>

      <div className="cart-item-details sample-details">
        <div className="sample-info">
          <h3 className="item-name">{item.name}</h3>
          {item.artist && <p className="sample-artist">{item.artist}</p>}

          <div className="sample-metadata">
            {item.genre && <span className="metadata-badge">{item.genre}</span>}
            {item.bpm && <span className="metadata-badge">{item.bpm} BPM</span>}
            {item.key && <span className="metadata-badge">Key: {item.key}</span>}
            {item.duration && <span className="metadata-badge">{formatTime(item.duration)}</span>}
          </div>
        </div>

        <div className="sample-price-section">
          <div className="item-price">${item.price.toFixed(2)}</div>
          <div className="digital-badge">Digital Download</div>
        </div>
      </div>
    </div>
  );
}