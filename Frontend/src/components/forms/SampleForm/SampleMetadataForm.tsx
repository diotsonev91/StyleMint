// src/components/SampleForm/SampleMetadataForm.tsx
import React, { useState } from 'react';
import { SampleFormData } from '../SampleForm';
import { 
  MusicalKey, 
  MusicalScale, 
  SampleType, 
  Genre, 
  InstrumentGroup,
  getMusicalKeyDisplayName,
  getMusicalScaleDisplayName,
  getSampleTypeDisplayName,
  getInstrumentGroupDisplayName
} from '../../../types/audioEnums';

interface SampleMetadataFormProps {
  formData: SampleFormData;
  onInputChange: (field: keyof SampleFormData, value: any) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  isSubmitting: boolean;
  mode: 'upload' | 'edit';
}

export const SampleMetadataForm: React.FC<SampleMetadataFormProps> = ({
  formData,
  onInputChange,
  onAddTag,
  onRemoveTag,
  isSubmitting,
  mode
}) => {
  const [tagInput, setTagInput] = useState('');

  const musicalKeyOptions = Object.values(MusicalKey);
  const musicalScaleOptions = Object.values(MusicalScale);
  const sampleTypeOptions = Object.values(SampleType);
  const genreOptions = Object.values(Genre);
  const instrumentGroupOptions = Object.values(InstrumentGroup);

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
    <>
      <div className="form-grid">
        <div className="form-group">
          <label>Sample Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="e.g. Deep Bass One Shot"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Artist Name *</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => onInputChange('artist', e.target.value)}
            placeholder="Your artist name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Price (USD) *</label>
          <div className="price-input">
            <span className="currency">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => onInputChange('price', e.target.value)}
              placeholder="4.99"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label>BPM (Optional)</label>
          <input
            type="number"
            min="0"
            max="300"
            value={formData.bpm || ''}
            onChange={(e) => onInputChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="120"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Musical Key (Optional)</label>
          <select 
            value={formData.musicalKey || ''} 
            onChange={(e) => onInputChange('musicalKey', e.target.value as MusicalKey)}
            disabled={isSubmitting}
          >
            <option value="">Select key</option>
            {musicalKeyOptions.map(key => (
              <option key={key} value={key}>
                {getMusicalKeyDisplayName(key)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Musical Scale (Optional)</label>
          <select 
            value={formData.musicalScale || ''} 
            onChange={(e) => onInputChange('musicalScale', e.target.value as MusicalScale)}
            disabled={isSubmitting}
          >
            <option value="">Select scale</option>
            {musicalScaleOptions.map(scale => (
              <option key={scale} value={scale}>
                {getMusicalScaleDisplayName(scale)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Genre (Optional)</label>
          <select 
            value={formData.genre || ''} 
            onChange={(e) => onInputChange('genre', e.target.value as Genre)}
            disabled={isSubmitting}
          >
            <option value="">Select genre</option>
            {genreOptions.map(g => (
              <option key={g} value={g}>{g.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sample Type *</label>
          <select 
            value={formData.sampleType || ''} 
            onChange={(e) => onInputChange('sampleType', e.target.value as SampleType)}
            required
            disabled={isSubmitting}
          >
            <option value="">Select type</option>
            {sampleTypeOptions.map(type => (
              <option key={type} value={type}>
                {getSampleTypeDisplayName(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Instrument Group *</label>
          <select 
            value={formData.instrumentGroup || ''} 
            onChange={(e) => onInputChange('instrumentGroup', e.target.value as InstrumentGroup)}
            required
            disabled={isSubmitting}
          >
            <option value="">Select group</option>
            {instrumentGroupOptions.map(group => (
              <option key={group} value={group}>
                {getInstrumentGroupDisplayName(group)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label>Tags (Optional)</label>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add tags (e.g. Bass, Loop, One-Shot)"
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            onClick={handleAddTag} 
            className="add-tag-btn"
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
    </>
  );
};