// src/components/sounds/SampleSelector.tsx
import React, { useState, useEffect } from 'react';
import { audioSampleService } from '../../services/audioSampleService';

import './SampleSelector.css';
import {AudioSample} from "../../types";

interface SampleSelectorProps {
  onSelect: (samples: AudioSample[]) => void;
  onClose: () => void;
  alreadySelectedIds?: string[]; // IDs of samples already in the pack
}

const SampleSelector: React.FC<SampleSelectorProps> = ({ 
  onSelect, 
  onClose,
  alreadySelectedIds = [] 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LOOP' | 'ONESHOT'>('ALL');

  useEffect(() => {
    loadUserSamples();
  }, []);

  const loadUserSamples = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await audioSampleService.getMyUploadedSamples();
      
      if (response.success) {
        const userSamples: AudioSample[] = Array.isArray(response.data)
          ? response.data.map((sample: any) => ({
              id: sample.id,
              name: sample.name,
              artist: sample.artist,
              audioUrl: sample.audioUrl,
              duration: sample.duration,
              bpm: sample.bpm,
              key: sample.key,
              scale: sample.scale,
              genre: sample.genre,
              instrumentGroup: sample.instrumentGroup,
              sampleType: sample.sampleType,
              price: sample.price,
              packId: sample.packId,
              packTitle: sample.packTitle,
              createdAt: sample.createdAt,
              updatedAt: sample.updatedAt,
              authorId: sample.authorId,
              tags: sample.tags
            }))
          : [];
        setSamples(userSamples);
      } else {
        setError(response.error || 'Failed to load your samples');
      }
    } catch (err: any) {
      console.error('Error loading user samples:', err);
      setError('An unexpected error occurred while loading your samples');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSampleSelection = (sampleId: string) => {
    const newSelected = new Set(selectedSamples);
    if (newSelected.has(sampleId)) {
      newSelected.delete(sampleId);
    } else {
      newSelected.add(sampleId);
    }
    setSelectedSamples(newSelected);
  };

  const handleConfirmSelection = () => {
    const selected = samples.filter(sample => selectedSamples.has(sample.id));
    onSelect(selected);
    onClose();
  };

  // Filter samples
  const filteredSamples = samples.filter(sample => {
    // Exclude already selected samples
    if (alreadySelectedIds.includes(sample.id)) {
      return false;
    }

    // Search filter
    const matchesSearch = searchTerm === '' || 
      sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.artist.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = filterType === 'ALL' || sample.sampleType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="sample-selector-overlay">
      <div className="sample-selector-modal">
        {/* Header */}
        <div className="selector-header">
          <div className="header-content">
            <h2>Select Existing Samples</h2>
            <p>Choose from your uploaded samples to add to this pack</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="selector-filters">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filterType === 'LOOP' ? 'active' : ''}`}
              onClick={() => setFilterType('LOOP')}
            >
              Loops
            </button>
            <button 
              className={`filter-btn ${filterType === 'ONESHOT' ? 'active' : ''}`}
              onClick={() => setFilterType('ONESHOT')}
            >
              One Shots
            </button>
          </div>
        </div>

        {/* Selection info */}
        {selectedSamples.size > 0 && (
          <div className="selection-info">
            <span>{selectedSamples.size} sample{selectedSamples.size !== 1 ? 's' : ''} selected</span>
            <button 
              className="clear-selection-btn"
              onClick={() => setSelectedSamples(new Set())}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="selector-loading">
            <div className="spinner-large"></div>
            <p>Loading your samples...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSamples.length === 0 && !error && (
          <div className="selector-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3>No Samples Available</h3>
            <p>
              {searchTerm || filterType !== 'ALL' 
                ? 'No samples match your filters. Try adjusting your search.'
                : 'You need to upload some individual samples first before you can add them to a pack.'}
            </p>
          </div>
        )}

        {/* Samples Grid */}
        {!isLoading && filteredSamples.length > 0 && (
          <div className="samples-grid">
            {filteredSamples.map(sample => (
              <div 
                key={sample.id}
                className={`sample-card ${selectedSamples.has(sample.id) ? 'selected' : ''}`}
                onClick={() => toggleSampleSelection(sample.id)}
              >
                {/* Selection indicator */}
                <div className="selection-indicator">
                  {selectedSamples.has(sample.id) ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    </svg>
                  )}
                </div>

                {/* Sample info */}
                <div className="sample-info">
                  <h3 className="sample-name">{sample.name}</h3>
                  <p className="sample-artist">{sample.artist}</p>
                  
                  <div className="sample-details">
                    {sample.bpm && (
                      <span className="detail-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {sample.bpm} BPM
                      </span>
                    )}
                    {sample.key && (
                      <span className="detail-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        {sample.key} {sample.scale}
                      </span>
                    )}
                    <span className="detail-badge type-badge">
                      {sample.sampleType}
                    </span>
                  </div>

                  {sample.genre && (
                    <div className="sample-genre">{sample.genre}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="selector-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleConfirmSelection}
            disabled={selectedSamples.size === 0}
          >
            Add {selectedSamples.size > 0 ? `${selectedSamples.size} ` : ''}Sample{selectedSamples.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleSelector;