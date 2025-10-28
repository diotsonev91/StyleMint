// src/components/PackDetails.tsx
import React from 'react';
import { SamplePack } from '../../types';
import './PackDetails.css';

interface PackDetailsProps {
  pack: SamplePack;
}

const PackDetails: React.FC<PackDetailsProps> = ({ pack }) => {
  return (
    <div className="pack-details-container">
      <div className="details-section">
        <h2 className="section-title">About This Pack</h2>
        <p className="pack-description">{pack.description}</p>
      </div>

      <div className="details-section">
        <h3 className="subsection-title">What's Inside</h3>
        <ul className="features-list">
          <li className="feature-item">
            <div className="feature-bullet"></div>
            <span>{pack.sampleCount} high-quality samples</span>
          </li>
          <li className="feature-item">
            <div className="feature-bullet"></div>
            <span>Authentic African percussion loops</span>
          </li>
          <li className="feature-item">
            <div className="feature-bullet"></div>
            <span>Deep, rolling basslines</span>
          </li>
          <li className="feature-item">
            <div className="feature-bullet"></div>
            <span>Soulful vocal chants and phrases</span>
          </li>
          <li className="feature-item">
            <div className="feature-bullet"></div>
            <span>Drum one-shots and FX</span>
          </li>
        </ul>
      </div>

      <div className="details-section">
        <h3 className="subsection-title">Technical Info</h3>
        <div className="tech-grid">
          <div className="tech-item">
            <span className="tech-label">Format:</span>
            <span className="tech-value">WAV 24-bit</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Sample Rate:</span>
            <span className="tech-value">44.1 kHz</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Total Size:</span>
            <span className="tech-value">{pack.totalSize}</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Compatible:</span>
            <span className="tech-value">All DAWs</span>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default PackDetails;
