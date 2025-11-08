// src/components/SampleForm/SampleFormHeader.tsx
import React from 'react';

interface SampleFormHeaderProps {
  mode: 'upload' | 'edit';
  title: string;
  subtitle: string;
}

export const SampleFormHeader: React.FC<SampleFormHeaderProps> = ({ 
  mode, 
  title, 
  subtitle 
}) => (
  <header className="form-header">
    <div className="header-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    </div>
    <h1 className="form-title">
      {title} <span className="gradient-text">{mode === 'upload' ? 'Sample' : ''}</span>
    </h1>
    <p className="form-subtitle">{subtitle}</p>
  </header>
);