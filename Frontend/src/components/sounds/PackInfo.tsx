// src/components/PackInfo.tsx
import React, { useState } from 'react';
import { SamplePack } from '../../types';
import { useLocation } from 'react-router-dom';
import {  FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import './PackInfo.css';

interface PackInfoProps {
  pack: SamplePack;
  onAddToCart: () => void;
  onDownloadPreview: () => void;
  onShare: () => void;
}

const PackInfo: React.FC<PackInfoProps> = ({ 
  pack, 
  onAddToCart, 
  onDownloadPreview, 
  onShare 
}) => {
  const [isLiked, setIsLiked] = useState(false);
const location = useLocation();
const { isLoggedUserPack } = location.state || {};
const navigate = useNavigate();
const handleEditPack = () => {
  navigate(`/edit-pack/${pack.id}`, { state: { pack } });
};
  return (
    <div className="pack-info">
      {/* Cover Image */}
      <div className="pack-cover-wrapper">
        <img 
          src={pack.coverImage} 
          alt={pack.title}
          className="pack-cover"
        />
        <div className="pack-cover-overlay"></div>
      </div>

      {/* Pack Details */}
      <div className="pack-details">
        <div className="pack-header">
          <h1 className="pack-title">{pack.title}</h1>
          <p className="pack-artist">{pack.artist}</p>
        </div>

        {/* Stats */}
        <div className="pack-stats">
          <div className="stat-item">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>{pack.sampleCount} samples</span>
          </div>
          <div className="stat-item">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{pack.totalSize}</span>
          </div>
        </div>

        {/* Genres */}
        <div className="pack-genres">
          {pack.genres.map((genre, index) => (
            <span key={index} className="genre-tag">
              {genre}
            </span>
          ))}
        </div>

        {/* Price & Actions */}
        <div className="pack-actions">
          <div className="price-section">
            <span className="pack-price">${pack.price}</span>
            <button 
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
              aria-label="Like this pack"
            >
              <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          {! isLoggedUserPack && 
          <button className="btn btn-primary action-btn" onClick={onAddToCart}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </button>
          }
          { isLoggedUserPack && 
          <button className="btn btn-secondary action-btn" onClick={handleEditPack}>
              <FaEdit className="action-icon " />
            Edit Your Pack
          </button>
          }
          <button className="btn btn-secondary action-btn" onClick={onDownloadPreview}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Pack
          </button>
         
           
          <button className="btn btn-ghost action-btn" onClick={onShare}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>

        {/* Tags */}
        <div className="pack-tags-section">
          <h3 className="tags-title">TAGS</h3>
          <div className="pack-tags">
            {pack.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackInfo;