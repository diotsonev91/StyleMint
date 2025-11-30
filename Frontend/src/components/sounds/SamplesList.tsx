// src/components/SamplesList.tsx
import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { audioPlayerStore, audioPlayerActions } from '../../state/audioPlayer.store';

import SampleItem from './SampleItem';
import { useNavigate } from 'react-router-dom';
import './SamplesList.css';
import {AudioSample} from "../../types";
import {audioSampleService} from "../../services/audioSampleService";


interface SamplesListProps {
  samples: AudioSample[];
  onLoadMore?: () => void;
}

const SamplesList: React.FC<SamplesListProps> = ({ samples, onLoadMore }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const audioSnap = useSnapshot(audioPlayerStore);
  const navigate = useNavigate();
    const [localSamples, setLocalSamples] = useState<AudioSample[]>(samples);

// Ако се сменят props.samples — обнови локалното състояние
    useEffect(() => {
        setLocalSamples(samples);
    }, [samples]);

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

    const handleDownload = async (sampleId: string) => {
        try {


            const result = await audioSampleService.downloadSample(sampleId);

            if (result.success) {
                // Success feedback
                if (result.isOwner) {
                    console.log('✅ Downloaded own sample');
                } else if (result.hasLicense) {
                    console.log('✅ Downloaded purchased sample');
                }

                // Optional: Show success toast
                // toast.success('Sample downloaded successfully!');

            } else {
                // Error feedback
                console.error('❌ Download failed:', result.error);

                // Show error to user
                alert(result.error || 'Failed to download sample');

                // If user doesn't have license, suggest purchase
                if (result.error?.includes('purchase')) {
                    // Optional: Redirect to purchase page or show buy modal
                    console.log('💰 User needs to purchase sample');
                }
            }

        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download sample. Please try again.');
        }
    };


  const handleLike = (sampleId: string) => {
    console.log('Like sample:', sampleId);
    // Implement like logic
  };

    async function handleDelete(id: string) {
        const result = await audioSampleService.deleteSample(id);

        if (result.success) {
            alert(result.message);

            setLocalSamples(prev => prev.filter(s => s.id !== id));
        } else {
            alert(result.error);
        }
    }


    async function handleUnbind(sample: AudioSample) {
        const  sampleId = sample.id;
        const result = await audioSampleService.unboundSampleFromPack(sample.packId,sampleId);

        if (result.success) {
            alert(result.message);

            setLocalSamples(prev => prev.filter(s => s.id !== sampleId));
        } else {
            alert(result.error);
        }
    }

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
              onDelete={()=> handleDelete(sample.id)}
              doesExistAsStandAlone={sample.price == 0 && sample.packId !=0}
              onUnbind={()=> handleUnbind(sample)}
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