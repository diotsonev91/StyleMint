// src/components/PackForm/PackInfoStep.tsx
import React, { useState } from 'react';
import { PackFormData } from '../PackForm';
import { Genre } from '../../../types/audioEnums';

interface PackInfoStepProps {
  formData: PackFormData;
  onFormDataChange: (field: keyof PackFormData, value: any) => void;
  onCoverImageChange: (file: File | null, preview: string) => void;
  onToggleGenre: (genre: Genre) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  isSubmitting: boolean;
  onNext: () => void;
  isStepValid: boolean;
}

export const PackInfoStep: React.FC<PackInfoStepProps> = ({
  formData,
  onFormDataChange,
  onCoverImageChange,
  onToggleGenre,
  onAddTag,
  onRemoveTag,
  isSubmitting,
  onNext,
  isStepValid
}) => {
  const [tagInput, setTagInput] = useState('');
  const genreOptions = Object.values(Genre);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCoverImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim());
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="form-step">
      <div className="form-group">
        <label>Pack Title *</label>
        <input
          type="text"
          value={formData.packTitle}
          onChange={(e) => onFormDataChange('packTitle', e.target.value)}
          placeholder="Essential Afro House"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Artist Name *</label>
        <input
          type="text"
          value={formData.artist}
          onChange={(e) => onFormDataChange('artist', e.target.value)}
          placeholder="Your artist name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Price (USD) *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => onFormDataChange('price', e.target.value)}
          placeholder="29.99"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Cover Image *</label>
        <div className="cover-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            hidden
            id="cover-upload"
            disabled={isSubmitting}
          />
          <label htmlFor="cover-upload" className="cover-upload-label">
            {formData.coverPreview ? (
              <img src={formData.coverPreview} alt="Cover preview" className="cover-preview" />
            ) : (
              <div className="cover-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Click to upload cover image</span>
                <small>JPG, PNG, or WebP</small>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange('description', e.target.value)}
          placeholder="Describe your sample pack..."
          rows={4}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Genres * (Select at least one)</label>
        <div className="genre-grid">
          {genreOptions.map(genre => (
            <button
              key={genre}
              type="button"
              className={`genre-chip ${formData.selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => onToggleGenre(genre)}
              disabled={isSubmitting}
            >
              {formData.selectedGenres.includes(genre) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {genre.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Tags (Optional)</label>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add tags (e.g. Percussion, Vocals)"
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            onClick={handleAddTag} 
            className="add-tag-btn"
            disabled={isSubmitting}
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="tags-list">
            {formData.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => onRemoveTag(tag)}
                  disabled={isSubmitting}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-next"
          onClick={onNext}
          disabled={!isStepValid || isSubmitting}
        >
          Next: Add Samples
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};