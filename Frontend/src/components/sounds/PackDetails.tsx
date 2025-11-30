// src/components/PackDetails.tsx
import React, { useMemo } from 'react';
import { SamplePack } from '../../types';
import './PackDetails.css';

interface PackDetailsProps {
  pack: SamplePack;
}

const PackDetails: React.FC<PackDetailsProps> = ({ pack }) => {
  // Calculate dynamic features from pack samples
  const packFeatures = useMemo(() => {
    if (!pack.samples || pack.samples.length === 0) {
      return [];
    }

    const features = [];
    
    // Count samples
    features.push(`${pack.sampleCount || pack.samples.length} high-quality samples`);

    // Count by sample type
    const types = pack.samples.reduce((acc, sample) => {
      const type = sample.sampleType || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(types).forEach(([type, count]) => {
      const typeName = type === 'ONESHOT' ? 'one-shots' : 
                      type === 'LOOP' ? 'loops' : 
                      type === 'VOCAL' ? 'vocals' :
                      type.toLowerCase();
      features.push(`${count} ${typeName}`);
    });

    // Count by instrument group
    const instruments = pack.samples.reduce((acc, sample) => {
      const instrument = sample.instrumentGroup || 'OTHER';
      acc[instrument] = (acc[instrument] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(instruments).forEach(([instrument, count]) => {
      if (count > 2) { // Only show if significant number
        const instrumentName = instrument.toLowerCase().replace(/_/g, ' ');
        features.push(`${count} ${instrumentName} samples`);
      }
    });

    // Check for FX
    const hasFX = pack.samples.some(s => 
      s.instrumentGroup === 'FX' || 
      s.name?.toLowerCase().includes('fx') ||
      s.name?.toLowerCase().includes('effect')
    );
    if (hasFX) {
      features.push('Sound effects and transitions');
    }

    // Check for vocals
    const hasVocals = pack.samples.some(s => 
      s.instrumentGroup === 'VOCALS' ||
      s.name?.toLowerCase().includes('vocal')
    );
    if (hasVocals) {
      features.push('Vocal samples and chants');
    }

    return features;
  }, [pack.samples, pack.sampleCount]);

  // Calculate technical info from samples
  const technicalInfo = useMemo(() => {
    let format = 'WAV 24-bit';
    
    // Extract format from audio URL
    if (pack.samples && pack.samples.length > 0) {
      const firstSample = pack.samples[0];
      if (firstSample.audioUrl) {
        // Get file extension from URL
        const extension = firstSample.audioUrl.split('.').pop()?.toLowerCase();
        
        switch (extension) {
          case 'wav':
            format = 'WAV 24-bit';
            break;
          case 'mp3':
            format = 'MP3 320kbps';
            break;
          case 'flac':
            format = 'FLAC Lossless';
            break;
          case 'aiff':
          case 'aif':
            format = 'AIFF 24-bit';
            break;
          case 'ogg':
            format = 'OGG Vorbis';
            break;
          case 'm4a':
            format = 'M4A AAC';
            break;
          default:
            format = extension ? extension.toUpperCase() : 'Audio File';
        }
      }
    }

    return {
      format,
      sampleRate: '44.1 kHz',
      totalSize: pack.totalSize || '0 MB',
      compatible: 'All DAWs'
    };
  }, [pack.samples, pack.totalSize]);

  // Get unique BPMs if available
  const bpmRange = useMemo(() => {
    if (!pack.samples || pack.samples.length === 0) return null;
    
    const bpms = pack.samples
      .map(s => s.bpm)
      .filter(bpm => bpm && bpm > 0)
      .sort((a, b) => a - b);
    
    if (bpms.length === 0) return null;
    
    const min = bpms[0];
    const max = bpms[bpms.length - 1];
    
    return min === max ? `${min} BPM` : `${min}-${max} BPM`;
  }, [pack.samples]);

  // Get unique keys if available
  const musicalKeys = useMemo(() => {
    if (!pack.samples || pack.samples.length === 0) return [];
    
    const keys = new Set(
      pack.samples
        .map(s => s.key)
        .filter(key => key && key.trim() !== '')
    );
    
    return Array.from(keys);
  }, [pack.samples]);

  return (
    <div className="pack-details-container">
      <div className="details-section">
        <h2 className="section-title">About This Pack</h2>
        <p className="pack-description">
          {pack.description || 'A professional collection of high-quality samples.'}
        </p>
      </div>

      {packFeatures.length > 0 && (
        <div className="details-section">
          <h3 className="subsection-title">What's Inside</h3>
          <ul className="features-list">
            {packFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                <div className="feature-bullet"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="details-section">
        <h3 className="subsection-title">Technical Info</h3>
        <div className="tech-grid">

          <div className="tech-item">
            <span className="tech-label">Total Size:</span>
            <span className="tech-value">{technicalInfo.totalSize}</span>
          </div>

          {bpmRange && (
            <div className="tech-item">
              <span className="tech-label">BPM Range:</span>
              <span className="tech-value">{bpmRange}</span>
            </div>
          )}
          {musicalKeys.length > 0 && (
            <div className="tech-item">
              <span className="tech-label">Keys:</span>
              <span className="tech-value">{musicalKeys.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {pack.genres && pack.genres.length > 0 && (
        <div className="details-section">
          <h3 className="subsection-title">Genres</h3>
          <div className="genres-list">
            {pack.genres.map((genre, index) => (
              <span key={index} className="detail-genre-tag">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {pack.tags && pack.tags.length > 0 && (
        <div className="details-section">
          <h3 className="subsection-title">Tags</h3>
          <div className="genres-list">
            {pack.tags.map((tag, index) => (
              <span key={index} className="detail-genre-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {pack.releaseDate && (
        <div className="details-section">
          <h3 className="subsection-title">Release Information</h3>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-label">Released:</span>
              <span className="tech-value">
                {new Date(pack.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Artist:</span>
              <span className="tech-value">{pack.artist}</span>
            </div>
            {pack.downloads !== undefined && (
              <div className="tech-item">
                <span className="tech-label">Downloads:</span>
                <span className="tech-value">{pack.downloads.toLocaleString()}</span>
              </div>
            )}
            {pack.rating !== undefined && pack.rating > 0 && (
              <div className="tech-item">
                <span className="tech-label">Rating:</span>
                <span className="tech-value">
                  {pack.rating.toFixed(1)} / 5.0
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackDetails;