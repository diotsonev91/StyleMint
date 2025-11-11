// src/components/PackForm/PackFormProgress.tsx
import React from 'react';

interface PackFormProgressProps {
  step: 1 | 2;
  mode: 'upload' | 'edit'
}

export const PackFormProgress: React.FC<PackFormProgressProps> = ({ step, mode }) => (
  <div className="progress-steps">
    <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
      <div className="step-circle">
        {step > 1 ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          '1'
        )}
      </div>
      <span>Pack Info</span>
    </div>
    <div className="step-divider"></div>
    <div className={`step ${step >= 2 ? 'active' : ''}`}>
      <div className="step-circle">2</div>
      
      {mode == 'upload' &&
      <span>Add Samples</span>}
       {mode == 'edit' &&
      <span>Edit Samples</span>}
    </div>
  </div>
);