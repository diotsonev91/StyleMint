// src/components/SampleItem.tsx
import React from 'react';
import { Sample } from '../../types';
import './SampleItem.css';

interface SampleItemProps {
  sample: Sample;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onDownload: () => void;
  onLike: () => void;
}

const SampleItem: React.FC<SampleItemProps> = ({ 
  sample, 
  isPlaying, 
  onTogglePlay,
  onDownload,
  onLike 
}) => {
  return (
    <div className="sample-item">
      <div className="sample-main">
        {/* Play Button */}
        <button 
          className="play-button"
          onClick={onTogglePlay}
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
            <span className="meta-item">
              <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {sample.duration}
            </span>
            {sample.bpm && (
              <span className="meta-item">{sample.bpm} BPM</span>
            )}
            {sample.key && (
              <span className="meta-item">Key: {sample.key}</span>
            )}
            <span className="sample-genre">{sample.genre}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sample-actions">
        <button 
          className="action-icon-btn"
          onClick={onDownload}
          aria-label="Download sample"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button 
          className="action-icon-btn"
          onClick={onLike}
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
