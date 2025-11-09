// src/components/PackForm/SamplesStep.tsx
import React, { useState } from 'react';
import { PackFormData, PackSample } from '../PackForm';
import { 
  MusicalKey, 
  MusicalScale, 
  SampleType, 
  InstrumentGroup
} from '../../../types/audioEnums';
import { SamplesFromPackDTO } from '../../../types';
import SampleSelector from '../../sounds/SampleSelectorComponent';
import './SamplesStep.css';

interface SamplesStepProps {
  formData: PackFormData;
  onSampleUpload: (files: FileList | null) => void;
  onAddExistingSamples: (samples: SamplesFromPackDTO[]) => void;
  onUpdateSample: (id: string, field: keyof PackSample, value: any) => void;
  onRemoveSample: (id: string) => void;
  onPlaySample: (sample: PackSample) => void;
  playingSampleId: string | null;
  isSubmitting: boolean;
  isStepValid: boolean;
  onSubmitProgress: number;
  onBack: () => void;
  mode: 'upload' | 'edit';
}

export const SamplesStep: React.FC<SamplesStepProps> = ({
  formData,
  onSampleUpload,
  onAddExistingSamples,
  onUpdateSample,
  onRemoveSample,
  onPlaySample,
  playingSampleId,
  isSubmitting,
  isStepValid,
  onSubmitProgress,
  onBack,
  mode
}) => {
  const [showSampleSelector, setShowSampleSelector] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSampleUpload(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleExistingSamplesSelect = (samples: SamplesFromPackDTO[]) => {
    onAddExistingSamples(samples);
  };

  // Get IDs of already added samples to prevent duplicates
  const alreadySelectedIds = formData.samples
    .filter(s => s.isExisting)
    .map(s => s.existingSampleId)
    .filter(id => id) as string[];

  return (
    <div className="form-step samples-step">
      <div className="step-header">
        <h2 className="step-title">Add Samples</h2>
        <p className="step-description">
          Upload new samples or add from your existing library
        </p>
      </div>

      {/* Upload Actions */}
      <div className="upload-actions">
        <label className="upload-btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New Samples
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            disabled={isSubmitting}
            style={{ display: 'none' }}
          />
        </label>

        <button
          type="button"
          className="add-existing-btn btn-secondary"
          onClick={() => setShowSampleSelector(true)}
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Add from Existing
        </button>
      </div>

      {/* Samples List */}
      {formData.samples.length > 0 ? (
        <div className="samples-list">
          <div className="samples-list-header">
            <h3>Pack Samples ({formData.samples.length})</h3>
          </div>

          {formData.samples.map((sample) => (
            <div key={sample.id} className="sample-item">
              <div className="sample-main">
                {/* Play/Pause Button */}
                <button
                  type="button"
                  className="play-btn"
                  onClick={() => onPlaySample(sample)}
                  disabled={isSubmitting}
                >
                  {playingSampleId === sample.id ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Sample Info */}
                <div className="sample-info">
                  <div className="sample-header">
                    <input
                      type="text"
                      className="sample-name-input"
                      value={sample.name}
                      onChange={(e) => onUpdateSample(sample.id, 'name', e.target.value)}
                      placeholder="Sample name"
                      disabled={isSubmitting || sample.isExisting}
                    />
                    {sample.isExisting && (
                      <span className="existing-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        From Library
                      </span>
                    )}
                  </div>

                  <div className="sample-details">
                    {/* BPM */}
                    <div className="detail-field">
                      <label>BPM</label>
                      <input
                        type="number"
                        value={sample.bpm || ''}
                        onChange={(e) => onUpdateSample(sample.id, 'bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="120"
                        disabled={isSubmitting || sample.isExisting}
                      />
                    </div>

                    {/* Key */}
                    <div className="detail-field">
                      <label>Key</label>
                      <select
                        value={sample.musicalKey || ''}
                        onChange={(e) => onUpdateSample(sample.id, 'musicalKey', e.target.value || undefined)}
                        disabled={isSubmitting || sample.isExisting}
                      >
                        <option value="">None</option>
                        {Object.values(MusicalKey).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>

                    {/* Scale */}
                    <div className="detail-field">
                      <label>Scale</label>
                      <select
                        value={sample.musicalScale || ''}
                        onChange={(e) => onUpdateSample(sample.id, 'musicalScale', e.target.value || undefined)}
                        disabled={isSubmitting || sample.isExisting}
                      >
                        <option value="">None</option>
                        {Object.values(MusicalScale).map(scale => (
                          <option key={scale} value={scale}>{scale}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div className="detail-field">
                      <label>Type</label>
                      <select
                        value={sample.sampleType}
                        onChange={(e) => onUpdateSample(sample.id, 'sampleType', e.target.value)}
                        disabled={isSubmitting || sample.isExisting}
                      >
                        {Object.values(SampleType).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Instrument */}
                    <div className="detail-field">
                      <label>Instrument</label>
                      <select
                        value={sample.instrumentGroup}
                        onChange={(e) => onUpdateSample(sample.id, 'instrumentGroup', e.target.value)}
                        disabled={isSubmitting || sample.isExisting}
                      >
                        {Object.values(InstrumentGroup).map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemoveSample(sample.id)}
                  disabled={isSubmitting}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-samples">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3>No Samples Added Yet</h3>
          <p>Upload new audio files or add samples from your existing library</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <button
          type="submit"
          className="btn-primary"
          disabled={!isStepValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              {mode === 'upload' ? 'Uploading' : 'Updating'}... {onSubmitProgress}%
            </>
          ) : (
            <>
              {mode === 'upload' ? 'Upload Pack' : 'Update Pack'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Sample Selector Modal */}
      {showSampleSelector && (
        <SampleSelector
          onSelect={handleExistingSamplesSelect}
          onClose={() => setShowSampleSelector(false)}
          alreadySelectedIds={alreadySelectedIds}
        />
      )}
    </div>
  );
};