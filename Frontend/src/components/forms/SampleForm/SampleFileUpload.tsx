// src/components/SampleForm/SampleFileUpload.tsx
import React from 'react';

interface SampleFileUploadProps {
  sampleFile: File | null;
  onFileChange: (file: File | null) => void;
  isSubmitting: boolean;
  mode: 'upload' | 'edit';
}

export const SampleFileUpload: React.FC<SampleFileUploadProps> = ({
  sampleFile,
  onFileChange,
  isSubmitting,
  mode
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file || null);
  };

  return (
    <div className="form-section-highlight">
      <label className="section-label-big">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Select Audio File {mode === 'upload' ? '*' : '(Optional)'}
      </label>

      {sampleFile ? (
        <div className="file-selected">
          <div className="file-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <div className="file-details">
              <span className="file-name">{sampleFile.name}</span>
              <span className="file-size">
                {(sampleFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            className="change-file-btn"
            onClick={() => onFileChange(null)}
            disabled={isSubmitting}
          >
            Change File
          </button>
        </div>
      ) : (
        <label className="audio-upload-area">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            hidden
            required={mode === 'upload'}
            disabled={isSubmitting}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Click to upload audio file</span>
          <small>WAV, MP3, AIFF, FLAC (max 50MB)</small>
        </label>
      )}
    </div>
  );
};