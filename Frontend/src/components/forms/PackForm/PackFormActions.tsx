// src/components/PackForm/PackFormActions.tsx
import React from 'react';

interface PackFormActionsProps {
  mode: 'upload' | 'edit';
  isSubmitting: boolean;
  submitProgress: number;
  onCancel: () => void;
}

export const PackFormActions: React.FC<PackFormActionsProps> = ({
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
          {mode === 'upload' ? 'Upload Sample Pack' : 'Update Sample Pack'}
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
  </div>
);