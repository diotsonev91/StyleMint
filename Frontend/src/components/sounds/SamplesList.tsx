// src/components/SamplesList.tsx
import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { audioPlayerStore, audioPlayerActions } from '../../state/audioPlayer.store';
import { SamplesFromPackDTO } from '../../types';
import SampleItem from './SampleItem';
import { useNavigate } from 'react-router-dom';
import './SamplesList.css';

interface SamplesListProps {
  samples: SamplesFromPackDTO[];
  onLoadMore?: () => void;
}

const SamplesList: React.FC<SamplesListProps> = ({ samples, onLoadMore }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const audioSnap = useSnapshot(audioPlayerStore);
  const navigate = useNavigate();
  // Preload samples when component mounts or samples change
  useEffect(() => {
    if (samples.length > 0) {
      console.log('Preloading samples in SamplesList...');
      // Preload first few samples for instant playback
      const samplesToPreload = samples.slice(0, 5);
      audioPlayerActions.preloadSamples(samplesToPreload).catch(console.error);
    }
  }, [samples]);


  const handleOnEdit = (sampleId: string) => {
    navigate(`/edit-sample/${sampleId}`);
  }
  const filteredSamples = samples.filter(sample => {
    const q = searchQuery.toLowerCase();
    return (
      sample.name.toLowerCase().includes(q) ||
      (sample.genre ?? "").toLowerCase().includes(q)
    );
  });

  const handleDownload = (sampleId: string) => {
    console.log('Download sample:', sampleId);
    // Implement download logic
  };

  const handleLike = (sampleId: string) => {
    console.log('Like sample:', sampleId);
    // Implement like logic
  };

  return (
    <div className="samples-list">
      {/* Search Bar */}
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search samples..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {audioSnap.isLoading && (
        <div className="global-loading">
          <div className="loading-spinner"></div>
          <span>Loading audio...</span>
        </div>
      )}

      {/* Error Message */}
      {audioSnap.error && (
        <div className="global-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{audioSnap.error}</span>
          <button 
            className="error-close"
            onClick={() => audioPlayerActions.clearError()}
          >
            ×
          </button>
        </div>
      )}

      {/* Samples */}
      <div className="samples-container">
        {filteredSamples.length > 0 ? (
          filteredSamples.map((sample) => (
            <SampleItem
              key={sample.id}
              sample={sample}
              onEdit={() => handleOnEdit(sample.id)}
              onDownload={() => handleDownload(sample.id)}
              onLike={() => handleLike(sample.id)}
            />
          ))
        ) : (
          <div className="no-results">
            <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No samples found matching your search</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {onLoadMore && filteredSamples.length > 0 && (
        <button className="btn btn-secondary load-more-btn" onClick={onLoadMore}>
          Load More Samples
        </button>
      )}
    </div>
  );
};

export default SamplesList;