// src/components/SampleForm/SampleFormActions.tsx
import React from 'react';

interface SampleFormActionsProps {
  mode: 'upload' | 'edit';
  isSubmitting: boolean;
  submitProgress: number;
  onCancel: () => void;
}

export const SampleFormActions: React.FC<SampleFormActionsProps> = ({
  mode,
  isSubmitting,
  submitProgress,
  onCancel
}) => (
  <div className="form-actions">
    <button
      type="submit"
      className="btn-submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <div className="spinner"></div>
          {mode === 'upload' ? 'Uploading...' : 'Updating...'} {submitProgress}%
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          {mode === 'upload' ? 'Upload Sample' : 'Update Sample'}
        </>
      )}
    </button>

    <button
      type="button"
      className="btn-cancel"
      onClick={onCancel}
      disabled={isSubmitting}
    >
      Cancel
    </button>

    <div className="info-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Upload Guidelines:</strong>
        <ul>
          <li>Audio quality: Minimum 16-bit, 44.1kHz</li>
          <li>File formats: WAV preferred, MP3 acceptable</li>
          <li>Maximum file size: 50MB</li>
          <li>Ensure you own the rights to the sample</li>
          <li>Required fields: File, Name, Artist, Price, Sample Type, Instrument Group</li>
        </ul>
      </div>
    </div>
  </div>
);