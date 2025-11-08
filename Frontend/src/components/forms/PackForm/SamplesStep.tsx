// src/components/PackForm/SamplesStep.tsx
import React from 'react';
import { PackFormData, PackSample } from '../PackForm';
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

interface SamplesStepProps {
  formData: PackFormData;
  onSampleUpload: (files: FileList | null) => void;
  onUpdateSample: (id: string, field: keyof PackSample, value: any) => void;
  onRemoveSample: (id: string) => void;
  onPlaySample: (sample: PackSample) => void;
  playingSampleId: string | null;
  isSubmitting: boolean;
  isStepValid: boolean;
  onSubmitProgress: number;
  onBack: () => void;
}

export const SamplesStep: React.FC<SamplesStepProps> = ({
  formData,
  onSampleUpload,
  onUpdateSample,
  onRemoveSample,
  onPlaySample,
  playingSampleId,
  isSubmitting,
  isStepValid,
  onSubmitProgress,
  onBack
}) => {
  const musicalKeyOptions = Object.values(MusicalKey);
  const musicalScaleOptions = Object.values(MusicalScale);
  const sampleTypeOptions = Object.values(SampleType);
  const genreOptions = Object.values(Genre);
  const instrumentGroupOptions = Object.values(InstrumentGroup);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSampleUpload(e.target.files);
  };

  return (
    <div className="form-step" style={{ animation: 'slideIn 0.5s ease-out' }}>
      <div className="form-section">
        <label className="section-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Audio Samples * (Minimum 1)
        </label>

        <label className="samples-upload-area">
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileChange}
            hidden
            disabled={isSubmitting}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Click to upload audio files</span>
          <small>WAV, MP3, AIFF (Multiple files supported)</small>
        </label>
      </div>

      {formData.samples.length > 0 && (
        <div className="samples-list">
          <div className="samples-header">
            <h3>{formData.samples.length} Sample{formData.samples.length !== 1 ? 's' : ''} Added</h3>
          </div>

          {formData.samples.map((sample, index) => (
            <div key={sample.id} className="sample-item-edit">
              <div className="sample-number">{index + 1}</div>
              
              <button
                type="button"
                className={`sample-play-button ${playingSampleId === sample.id ? 'playing' : ''}`}
                onClick={() => onPlaySample(sample)}
                title={playingSampleId === sample.id ? 'Pause' : 'Play preview'}
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

              <div className="sample-edit-grid">
                <div className="form-group">
                  <label>Sample Name *</label>
                  <input
                    type="text"
                    value={sample.name}
                    onChange={(e) => onUpdateSample(sample.id, 'name', e.target.value)}
                    placeholder="Sample name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Artist *</label>
                  <input
                    type="text"
                    value={sample.artist}
                    onChange={(e) => onUpdateSample(sample.id, 'artist', e.target.value)}
                    placeholder="Artist name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>BPM (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={sample.bpm || ''}
                    onChange={(e) => onUpdateSample(sample.id, 'bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="120"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Musical Key (Optional)</label>
                  <select
                    value={sample.musicalKey || ''}
                    onChange={(e) => onUpdateSample(sample.id, 'musicalKey', e.target.value as MusicalKey)}
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
                    value={sample.musicalScale || ''}
                    onChange={(e) => onUpdateSample(sample.id, 'musicalScale', e.target.value as MusicalScale)}
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
                    value={sample.genre || ''}
                    onChange={(e) => onUpdateSample(sample.id, 'genre', e.target.value as Genre)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select genre</option>
                    {genreOptions.map(genre => (
                      <option key={genre} value={genre}>
                        {genre.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sample Type *</label>
                  <select
                    value={sample.sampleType}
                    onChange={(e) => onUpdateSample(sample.id, 'sampleType', e.target.value as SampleType)}
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
                    value={sample.instrumentGroup}
                    onChange={(e) => onUpdateSample(sample.id, 'instrumentGroup', e.target.value as InstrumentGroup)}
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

              <button
                type="button"
                className="remove-sample"
                onClick={() => onRemoveSample(sample.id)}
                title="Remove sample"
                disabled={isSubmitting}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn-back"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>

        <button
          type="submit"
          className="btn-submit"
          disabled={!isStepValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Uploading... {onSubmitProgress}%
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Upload Sample Pack
            </>
          )}
        </button>
      </div>
    </div>
  );
};